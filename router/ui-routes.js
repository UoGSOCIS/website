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
const Challenge = source("models/roboticon");
const myMarked = require("marked");

const execRoles = [
    {
        name: "Senior Representative",
        value: "senior-rep"
    },
    {
        name: "Junior Representative",
        value: "junior-rep"
    }
];

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
    res.render("events", {});
});


router.post("/authenticate", function(req, res, next) {

    authentication.verify(req.body.token)
    .then((decoded) => {
        // probably going to want to create our own user account data here
        req.session.token = decoded;

        const userId = decoded.sub;
        res.send(userId);
    })
    .catch((err) => {
        next(Error.Unauthorized(err.message));
    });
});


router.get("/admin", function(req, res) {

    // note this is temporary contents
    const date = new Date();
    var curYear = date.getFullYear() - (date.getMonth() < 4 ? 1 : 0);

    Exec.getExecForYear(curYear)
    .then((exec) => {
        res.render("admin_exec", {
            whiteBackground: true,
            currentExec: exec,
            roles: execRoles,
        });
    })
    .catch((err) => {
        return res.render("error", {whiteBackground: true, message: err.message, status: 500, });
    });
});

/*
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
