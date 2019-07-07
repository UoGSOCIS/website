/**
 * This file sets the route handlers for all the routes
 * that render pages
 *
 * @author Marshall Asch <masch@uoguelph.ca>
 * @module router
 */
"use-strict";

const express = require("express");
const router = express.Router();
const source = require("rfr");

const numToWords = require("number-to-words");

const authentication = source("authentication");
const Exec = source("models/exec");
const Event = source("models/event");

const users = source("models/user");

const response = source("models/responses");
const Error = response.Error;

const errors = source("models/error");

const Challenge = source("models/roboticon");
const myMarked = require("marked");

myMarked.setOptions({
    renderer: new myMarked.Renderer(),
    gfm: true,
    tables: true,
    sanitize: true,
    smartLists: true,
});

/* GET home page. */
router.get("/", function(req, res) {

    // load the events that are scheduled for today or later
    res.render("index", { whiteBackground: true, });
});

router.get("/events", function(req, res) {

    let upcoming = [];
    let past = [];

    const baseUrl = req.protocol + "://" + req.headers.host + "/events/";
    Event.getUpcoming("event")
    .then((events) => {

        events.forEach((event) => {
            let e =  {
                url: baseUrl + event.id,
                title: event.title,
                date: event.startTime.toLocaleDateString("default", {year: "numeric", month: "long", day: "numeric", }),
                event_time: event.startTime.toLocaleTimeString("default", {hour12: true, }),
            };
            upcoming.push(e);
        });

        return Event.getPast("event");
    })
    .then((events) => {

        events.forEach((event) => {
            let e =  {
                url: baseUrl + event.id,
                title: event.title,
                date: event.startTime.toLocaleDateString("default", {year: "numeric", month: "long", day: "numeric", }),
                event_time: event.startTime.toLocaleTimeString("default", {hour12: true, }),
            };
            past.push(e);
        });

        res.render("events", {upComingEvents: upcoming, pastEvents: past, });

    })
    .catch((err) => {
        return res.render("error", {whiteBackground: true, message: err.message, status: 500, });
    });


});


router.get("/events/:id([0-9a-fA-F]{24})", function(req, res) {

    Event.getById(req.params.id)
    .then((event) => {

        const content = {
            title: event.title,
            location: event.location,
            date:  event.startTime.toLocaleDateString("default", {year: "numeric", month: "long", day: "numeric", }),
            start_time: event.startTime.toLocaleTimeString("default", {hour12: true, }),
            end_time: event.endTime.toLocaleTimeString("default", {hour12: true, }),
            description: myMarked(event.description),
        };


        res.render("event", content);

    })
    .catch( (err) => {
        return res.render("error", {whiteBackground: true, message: err.message, status: 500, });
    });
});

router.post("/authenticate", function(req, res, next) {

    authentication.verifyGoogle(req.body.token)
    .then((decoded) => {

        const userId = decoded.sub;
        //res.send(userId);

        return users.User.getByAccountId(userId)
        .catch((err) => {

            // then the user does not yet exist in the db ans should be created
            if (err instanceof errors.user.NotFoundError) {

                // check if the user is should be an admin
                let permission = users.Permission.NONE;
                if (decoded.email === "admin@socis.ca" || decoded.email === "president@socis.ca") {
                    permission = users.Permission.ADMIN;
                }

                const user = new users.User()
                .setAccountId(userId)
                .setName(decoded.name)
                .setEmail(decoded.email)
                .setPermissions(permission);

                return user.save();
            }
        });
    })
    .then((user) => {
        // the user is ether the one found on the db or the new one that was just created
        req.session.user = user.toApiV1();

        return authentication.sign(user.toApiV1());
    })
    .then((token) => {
        res.send(token);
    })
    .catch((err) => {
        next(Error.Unauthorized(err.message));
    });
});


router.get("/admin", function(req, res) {

    res.render("admin", {whiteBackground: true, });
});

router.get("/admin/events", function(req, res) {
    res.render("admin_events", {whiteBackground: true, });
});

router.get("/admin/events/create", function(req, res) {
    res.render("admin_create_event", {whiteBackground: true, });
});

router.get("/admin/exec", function(req, res) {


    const date = new Date();
    var curYear = date.getFullYear() - (date.getMonth() < 4 ? 1 : 0);

    Exec.getExecForYear(curYear)
    .then((exec) => {

        res.render("admin_exec", {
            whiteBackground: true,
            currentExec: exec,
        });
    })
    .catch((err) => {
        return res.render("error", {whiteBackground: true, message: err.message, status: 500, });
    });
});
/*

router.post("/admin/exec", function(req, res) {

    //return res.send(400);


    var toSave = new Exec()
    .setName(req.body.name)
    .setEmail(req.body.email)
    .setRole(req.body.role)
    .setYear(req.body.year)
    .save();

    toSave.then(() => {
        return res.status(201).json({ message: "success", status: 200, });
    })
    .catch((err) => {
        return res.render("error", {whiteBackground: true, message: err.message, status: 500, });

    });
});

router.post("/admin/roboticon", function(req, res) {

    var toSave = new Challenge()
    .setDescription(req.body.description)
    .setGoal(req.body.goal)
    .setParameters(req.body.parameters)
    .setPoints(req.body.points)
    .setImagePath(req.body.imagePath)
    .setMapPath(req.body.mapPath)
    .setChallengeNumber(req.body.challengeNumber)
    .setHidden(req.body.hidden)
    .setYear(req.body.year)
    .save();


    toSave.then(() => {
        return res.render("error", {whiteBackground: true, message: "success", status: 200, });
    })
    .catch((err) => {
        return res.render("error", {whiteBackground: true, message: err.message, status: 500, });

    });
});
*/

router.get("/about", function(req, res) {

    const date = new Date();
    var curYear = date.getFullYear() - (date.getMonth() < 4 ? 1 : 0);

    Exec.getExecForYear(curYear)
    .then((exec) => {

        res.render("about", {
            currentExec: exec,
            execYearStart: curYear,
            execYearEnd: curYear+1,
        });
    })
    .catch((err) => {
        return res.render("error", {whiteBackground: true, message: err.message, status: 500, });
    });
});

router.get("/gcc", function(req, res) {
    res.render("gcc", {});
});

router.get("/csgames", function(req, res) {
    res.render("csgames", {});
});

router.get("/cusec", function(req, res) {
    res.render("cusec", {});
});

router.get("/roboticon/:year([0-9]{4})?", function(req, res) {

    var currentYear = req.params.year || new Date().getFullYear();

    Challenge.getChallengesForYear(currentYear, true)
    .then((result) => {

        var challenges = [];

        result.forEach((challenge) => {
            var r = {};
            r.challengeNumber = numToWords.toWords(challenge.challengeNumber);
            r.description = myMarked(challenge.description);
            r.goal = myMarked(challenge.goal);
            r.parameters = myMarked(challenge.parameters);
            r.points = myMarked(challenge.points);
            r.mapPath = challenge.mapPath;
            r.imagePath = challenge.imagePath;

            challenges.push(r);
        });

        Challenge.getChallengesYears()
        .then((years) => {

            var page = req.params.year ? "roboticonChallenge" : "roboticon";

            res.render(page, {
                challenges: challenges,
                currentYear: currentYear,
                challengeYears: years,
            });
        });
    })
    .catch((err) => {
        return res.render("error", {whiteBackground: true, message: err.message, status: 500, });

    });
});

module.exports = router;
