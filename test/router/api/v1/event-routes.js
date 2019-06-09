/**
 * Mocha unit tests for APIv1 exec routes. Note that this file does not require
 * mocha. API tests facilitates by supertest.
 *
 * @file test/router/api/v1/exec-routes.js
 * @author Marshall Asch <masch@uoguelph.ca>
 * @see module:router
 */
"use strict";

const source = require("rfr");

const request = require("supertest");
const chai = require("chai");
const asPromised = require("chai-as-promised");
const assert = chai.assert;
//const fuzzer = require("fuzzer");

const app = source("server");
const logger = source("logger");
const Event = source("models/event");
const statusCodes = require("http-status-codes");

const connection = source("test/connection");
const check = source("test/router/api/assert");

const authentication = source("authentication");
const config = source("config");
const users = source("models/user");


chai.use(asPromised);

suite("APIv1 event routes", function() {

    let validUser;
    let validToken;

    suiteSetup(function() {

        const newUser = new users.User()
        .setAccountId("896tgu8yfh")
        .setName("Test User")
        .setEmail("execUser@example.com")
        .setPermissions(users.Permission.ADMIN);

        return newUser.save()
        .then((saved) => {
            validUser = saved;
            return authentication.sign(saved.toApiV1());
        })
        .then((token) => {
            validToken = token;
        })
        .catch((err) => {
            logger.error("Error creating user test token", err);
        });

    });

    suite("POST /api/v1/events", function() {

        test("Valid event wrong content type", function() {
            return request(app)
            .post("/api/v1/events")
            .set("Content-Type", "x-www-form-urlencoded")
            .set("Authorization", `Bearer ${validToken}`)
            .send("start_time=2019-04-04T19:00:00.000Z")
            .send("end_time=2019-04-04T20:00:00.000Z")
            .send("title=The Last SOCIS event of the year")
            .send("description=This is a bit of information about the event that will be *awesome*!")
            .send("location=Reynolds 0101")
            .send("tags[0]=event")
            .send("tags[1]=cool")
            .expect(statusCodes.BAD_REQUEST)
            .then((res) => {
                check.api["v1"].isGenericResponse(statusCodes.BAD_REQUEST, res.body);
            });
        });

        test("a valid event with correct content type", function() {
            return request(app)
            .post("/api/v1/events")
            .set("Content-Type", "application/json")
            .set("Authorization", `Bearer ${validToken}`)
            .send({
                start_time: "2019-04-04T19:00:00.000Z",
                end_time: "2019-04-04T20:00:00.000Z",
                title: "The Last SOCIS event of the year",
                description: "This is a bit of information about the event that will be *awesome*!",
                location: "Reynolds 0101",
                tags: ["event", "cool"],
            })
            .expect(statusCodes.CREATED)
            .then((res) => {
                check.api["v1"].isEvent(res.body);
            });
        });

        test("a valid object no authorization token", function() {

            return request(app)
            .post("/api/v1/events")
            .set("Content-Type", "application/json")
            .send({
                start_time: "2019-05-04T19:00:00.000Z",
                end_time: "2019-05-04T20:00:00.000Z",
                title: "The Last SOCIS event of the year",
                description: "This is a bit of information about the event that will be *awesome*!",
                location: "Reynolds 0101",
                tags: ["event", "cool"],
            })
            .expect(statusCodes.UNAUTHORIZED)
            .then((res) => {
                check.api["v1"].isGenericResponse(statusCodes.UNAUTHORIZED, res.body);
            });
        });

        test("extra fields should be ignored", function() {

            return request(app)
            .post("/api/v1/events")
            .set("Content-Type", "application/json")
            .set("Authorization", `Bearer ${validToken}`)
            .send({
                id: "5ce07aba7d20c5c791d35826",
                start_time: "2019-06-04T19:00:00.000Z",
                end_time: "2019-06-04T20:00:00.000Z",
                title: "The Last SOCIS event of the year",
                description: "This is a bit of information about the event that will be *awesome*!",
                location: "Reynolds 0101",
                tags: ["event", "cool"],
            })
            .expect(statusCodes.CREATED)
            .then((res) => {

                check.api["v1"].isEvent(res.body);
                assert.notEqual(res.body.id, "5ce07aba7d20c5c791d35826");
            });
        });

        test("missing required fields", function() {
            return request(app)
            .post("/api/v1/events")
            .set("Content-Type", "application/json")
            .set("Authorization", `Bearer ${validToken}`)
            .send({
                end_time: "2019-06-04T20:00:00.000Z",
                title: "The Last SOCIS event of the year",
                description: "This is a bit of information about the event that will be *awesome*!",
                location: "Reynolds 0101",
                tags: ["event", "cool"],
            })
            .expect(statusCodes.BAD_REQUEST)
            .then((res) => {
                check.api["v1"].isGenericResponse(statusCodes.BAD_REQUEST, res.body);
            });
        });

        // clear the events DB
        suiteTeardown(function() {
            connection.db.dropCollection("events", function (err, result) {});
        });
    });

    suite("PATCH /api/v1/events", function() {

        var event1;
        var event2;
        var event3;
        var event4;

        suiteSetup(function() {

            event1 = new Event()
            .setTitle("The first event")
            .setDescription("This is the first event ever created")
            .setLocation("Reynolds 1101")
            .setStartTime("2019-04-05T19:00:00.000Z")
            .setEndTime("2019-04-05T20:00:00.000Z")
            .setTags(["event", "awesome"]);

            event2 = new Event()
            .setTitle("The second event")
            .setDescription("This is the second event ever created, it is all about the best snacks")
            .setLocation("Pi lab")
            .setStartTime("2019-05-05T19:00:00.000Z")
            .setEndTime("2019-05-05T20:00:00.000Z")
            .setTags(["event"]);

            event3 = new Event()
            .setTitle("Local hack day")
            .setDescription("Local hackathon where we are going to build cool things")
            .setLocation("Pi lab")
            .setStartTime("2019-12-01T08:00:00.000Z")
            .setEndTime("2019-12-01T20:00:00.000Z")
            .setTags(["event"]);

            event4 = new Event()
            .setTitle("coolest event")
            .setDescription("all these values should change")
            .setLocation("Pi lab")
            .setStartTime("2020-12-01T08:00:00.000Z")
            .setEndTime("2020-12-01T20:00:00.000Z");

            // save the execs to the db
            event1.save()
            .then((event) => {
                event1 = event;
                return event2.save();
            })
            .then((event) => {
                event2 = event;
                return event3.save();
            })
            .then((event) => {
                event3 = event;
                return event4.save();
            })
            .then((event) => {
                event4 = event;
            })
            .catch((err) => {
                logger.error("Unexpected error", err);
            });
        });

        test("Valid event wrong content type", function() {

            return request(app)
            .patch(`/api/v1/events/${event1.id}`)
            .set("Content-Type", "x-www-form-urlencoded")
            .set("Authorization", `Bearer ${validToken}`)
            .send("title=This title should not be changed")
            .expect(statusCodes.BAD_REQUEST)
            .then((res) => {
                check.api["v1"].isGenericResponse(statusCodes.BAD_REQUEST, res.body);
            });
        });

        test("update an event that does not exist in the db", function() {

            return request(app)
            .patch("/api/v1/events/5ce087e883c678fd2d3d034a")
            .set("Content-Type", "application/json")
            .set("Authorization", `Bearer ${validToken}`)
            .send({title: "this also wont get updated", })
            .expect(statusCodes.NOT_FOUND)
            .then((res) => {
                check.api["v1"].isGenericResponse(statusCodes.NOT_FOUND, res.body);
            });
        });

        test("missing authentication", function() {

            return request(app)
            .patch(`/api/v1/events/${event1.id}`)
            .set("Content-Type", "application/json")
            .send({title: "this also wont get updated because of bad auth", })
            .expect(statusCodes.UNAUTHORIZED)
            .then((res) => {
                check.api["v1"].isGenericResponse(statusCodes.UNAUTHORIZED, res.body);
            });
        });

        test("not all the fields are set", function() {

            let update1 = {
                title: "this should be set",
                tags: [],
            };

            return request(app)
            .patch(`/api/v1/events/${event2.id}`)
            .set("Authorization", `Bearer ${validToken}`)
            .set("Content-Type", "application/json")
            .send(update1)
            .expect(statusCodes.OK)
            .then((res) => {

                check.api["v1"].isEvent(res.body);
                assert.equal(res.body.id, event2.id);
                assert.equal(res.body.start_time, event2.startTime.toISOString());
                assert.equal(res.body.end_time, event2.endTime.toISOString());
                assert.equal(res.body.title, update1.title);
                assert.equal(res.body.location, event2.location);
                assert.isArray(res.body.tags);
                assert.lengthOf(res.body.tags, 0);
            });
        });

        test("update with invalid start time", function() {

            return request(app)
            .patch(`/api/v1/events/${event3.id}`)
            .set("Authorization", `Bearer ${validToken}`)
            .set("Content-Type", "application/json")
            .send({start_time: Date.now(), })
            .expect(statusCodes.BAD_REQUEST)
            .then((res) => {
                check.api["v1"].isGenericResponse(statusCodes.BAD_REQUEST, res.body);
            });
        });

        test("valid full set of changes", function() {

            let update1 = {
                start_time: "2012-12-01T08:00:00.000Z",
                end_time: "2012-12-01T10:00:00.000Z",
                location: "top secret place",
                title: "classified event",
                description: "I guess you will have to show up to find out",
                tags: ["test", "again", "events"],
            };

            return request(app)
            .patch(`/api/v1/events/${event4.id}`)
            .set("Authorization", `Bearer ${validToken}`)
            .set("Content-Type", "application/json")
            .send(update1)
            .expect(statusCodes.OK)
            .then((res) => {

                check.api["v1"].isEvent(res.body);
                assert.equal(res.body.id, event4.id);
                assert.equal(res.body.start_time, update1.start_time);
                assert.equal(res.body.end_time, update1.end_time);
                assert.equal(res.body.title, update1.title);
                assert.equal(res.body.description, update1.description);
                assert.equal(res.body.location, update1.location);
                assert.isArray(res.body.tags);
                assert.lengthOf(res.body.tags, 3);
            });
        });

        // clear the events DB
        suiteTeardown(function() {
            connection.db.dropCollection("events", function (err, result) {});
        });
    });

    suite("DELETE /api/v1/events/:eventId", function() {

        var event1;
        var event2;
        var event3;

        suiteSetup(function() {

            event1 = new Event()
            .setTitle("The first event")
            .setDescription("This is the first event ever created")
            .setLocation("Reynolds 1101")
            .setStartTime("2019-04-05T19:00:00.000z")
            .setEndTime("2019-04-05T20:00:00.000z")
            .setTags(["event", "awesome"]);

            event2 = new Event()
            .setTitle("The second event")
            .setDescription("This is the second event ever created, it is all about the best snacks")
            .setLocation("Pi lab")
            .setStartTime("2019-05-05T19:00:00.000z")
            .setEndTime("2019-05-05T20:00:00.000z")
            .setTags(["event"]);

            event3 = new Event()
            .setTitle("Local hack day")
            .setDescription("Local hackathon where we are going to build cool things")
            .setLocation("Pi lab")
            .setStartTime("2019-12-01T08:00:00.000Z")
            .setEndTime("2019-12-01T20:00:00.000Z")
            .setTags(["event"]);

            // save the execs to the db
            event1.save()
            .then((event) => {
                event1 = event;
                return event2.save();
            })
            .then((event) => {
                event2 = event;
                return event3.save();
            })
            .then((event) => {
                event3 = event;
            })
            .catch((err) => {
                logger.error("Unexpected error", err);
            });
        });

        test("missing authentication", function() {

            return request(app)
            .delete(`/api/v1/events/${event1.id}`)
            .expect(statusCodes.UNAUTHORIZED)
            .then((res) => {
                check.api["v1"].isGenericResponse(statusCodes.UNAUTHORIZED, res.body);
            });
        });

        test("deleting non existent eventId, valid format id", function() {
            return request(app)
            .delete("/api/v1/events/5ce07f989c3aabe99abf309e")
            .set("Authorization", `Bearer ${validToken}`)
            .expect(statusCodes.NOT_FOUND)
            .then((res) => {
                check.api["v1"].isGenericResponse(statusCodes.NOT_FOUND, res.body);
            });
        });

        test("deleting non existent eventId, invalid format id", function() {
            return request(app)
            .delete("/api/v1/events/badEventId")
            .set("Authorization", `Bearer ${validToken}`)
            .expect(statusCodes.NOT_FOUND)
            .then((res) => {
                check.api["v1"].isGenericResponse(statusCodes.NOT_FOUND, res.body);
            });
        });
        
        test("deleting an event that has already been deleted", function () {
            return request(app)
            .delete(`/api/v1/events/${event2.id}`)
            .set("Authorization", `Bearer ${validToken}`)
            .expect(statusCodes.NO_CONTENT)
            .then(() => {

                // try deleting it again
                return request(app)
                .delete(`/api/v1/events/${event2.id}`)
                .set("Authorization", `Bearer ${validToken}`)
                .expect(statusCodes.NOT_FOUND)
                .then((res) => {
                    check.api["v1"].isGenericResponse(statusCodes.NOT_FOUND, res.body);
                });
            });
        });

        test("deleting a valid event", function() {

            return request(app)
            .delete(`/api/v1/events/${event3.id}`)
            .set("Authorization", `Bearer ${validToken}`)
            .expect(statusCodes.NO_CONTENT);
        });

        // clear the events DB
        suiteTeardown(function() {
            connection.db.dropCollection("events", function (err, result) {});
        });
    });

    // clear the users DB
    suiteTeardown(function() {
        connection.db.dropCollection("users", function (err, result) {});
    });
});