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

const auth = require("google-auth-library");

const config = source("config");
const client = new auth.OAuth2Client(config.google.client_id);

const logger = source("logger");
const Exec = source("models/exec");
const Challenge = source("models/roboticon");
var myMarked = require("marked");

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


router.post("/authenticate", function(req, res) {

    var token = req.body.token;
    client.verifyIdToken({
        idToken: token,
        audience: config.google.client_id,
    }).then((ticket) => {

        const payload = ticket.getPayload();

        const userid = payload["sub"];
        const aud = payload["aud"];

        const domain = payload["hd"];

        if (aud !== config.google.client_id) {
            logger.error("The token is not for the correct audience");
            res.status(400).send("The token is not for the correct audience");
            return;
        }

        // verify that the domain name was from the socis organization
        if (domain !== "socis.ca") {
            logger.error("The user is not a SOCIS email address. ");
            res.status(400).send("The user is not a SOCIS email address. ");
            return;
        }

        // probably going to want to create our own user account data here
        req.session.token = payload;

        res.send(userid);
    }).catch((err) => {
        logger.error("Something when horribly wrong: " + err);
        res.status(400).send("Failed to validate the token");
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
