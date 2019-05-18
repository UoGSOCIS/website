/**
 * Mocha unit tests for event module. Note that this file does not require mocha.
 * Asserts provided via the chai framework. All test should return Promises.
 *
 * @file test-exec.js
 * @see module:models/event
 */
"use strict";

const source = require("rfr");
const chai = require("chai");

const asPromised = require("chai-as-promised");
const assert = chai.assert;

const Event = source("models/event");
const connection = source("test/connection");
const logger = source("logger");

const errors = source("models/error");


chai.use(asPromised);

/* User class test suite */
suite("Event", function() {

    suite("#init()", function() {

        let event = new Event()
        .setTitle("The first event")
        .setDescription("This is the first event ever created")
        .setLocation("Reynolds 1101")
        .setStartTime("2019-04-05T19:00:00.000z")
        .setEndTime("2019-04-05T20:00:00.000z")
        .setTags(["event", "awesome"]);

        test("should have an id", function() {
            assert.isString(event.id);
            assert.lengthOf(event.id, 24);
        });

        test("should have a location", function() {
            assert.equal(event.location, "Reynolds 1101");
        });

        test("should have a title", function() {
            assert.equal(event.title, "The first event");
        });

        test("should have a description", function() {
            assert.equal(event.description, "This is the first event ever created");
        });

        test("should have a start time", function() {
            assert.equal(event.startTime.valueOf(), new Date("2019-04-05T19:00:00.000z").valueOf());
        });

        test("should have a end time", function() {
            assert.equal(event.endTime.valueOf(), new Date("2019-04-05T20:00:00.000z").valueOf());
        });

        test("should have a tags", function() {
            assert.lengthOf(event.tags, 2);
            assert.equal(event.tags[0], "event");
            assert.equal(event.tags[1], "awesome");

        });
    });

    suite("validate(exec)", function() {
        test("should be valid", function() {
            let event = new Event()
            .setTitle("The first event")
            .setDescription("This is the first event ever created")
            .setLocation("Reynolds 1101")
            .setStartTime("2019-04-05T19:00:00.000z")
            .setEndTime("2019-04-05T20:00:00.000z")
            .setTags(["event", "awesome"]);

            return assert.isFulfilled(Event.isValid(event));
        });

        test("valid default tags", function() {
            let event = new Event()
            .setTitle("The first event")
            .setDescription("This is the first event ever created")
            .setLocation("Reynolds 1101")
            .setStartTime("2019-04-05T19:00:00.000z")
            .setEndTime("2019-04-05T20:00:00.000z");

            return assert.isFulfilled(Event.isValid(event));
        });

        test("valid missing title", function() {
            let event = new Event()
            .setDescription("This is the first event ever created")
            .setLocation("Reynolds 1101")
            .setStartTime("2019-04-05T19:00:00.000z")
            .setEndTime("2019-04-05T20:00:00.000z")
            .setTags(["event", "awesome"]);

            return assert.isRejected(Event.isValid(event));
        });

        test("missing title", function() {
            let event = new Event()
            .setDescription("This is the first event ever created")
            .setLocation("Reynolds 1101")
            .setStartTime("2019-04-05T19:00:00.000z")
            .setEndTime("2019-04-05T20:00:00.000z")
            .setTags(["event", "awesome"]);

            return assert.isRejected(Event.isValid(event));
        });

        test("missing description", function() {
            let event = new Event()
            .setTitle("The first event")
            .setLocation("Reynolds 1101")
            .setStartTime("2019-04-05T19:00:00.000z")
            .setEndTime("2019-04-05T20:00:00.000z")
            .setTags(["event", "awesome"]);

            return assert.isRejected(Event.isValid(event));
        });

        test("end time before start time", function() {
            let event = new Event()
            .setTitle("The first event")
            .setDescription("This is the first event ever created")
            .setLocation("Reynolds 1101")
            .setStartTime("2019-04-05T20:00:00.000z")
            .setEndTime("2019-04-05T19:00:00.000z")
            .setTags(["event", "awesome"]);

            return assert.isRejected(Event.isValid(event));
        });

        test("missing location", function() {
            let event = new Event()
            .setTitle("The first event")
            .setDescription("This is the first event ever created")
            .setStartTime("2019-04-05T19:00:00.000z")
            .setEndTime("2019-04-05T20:00:00.000z")
            .setTags(["event", "awesome"]);

            return assert.isRejected(Event.isValid(event));
        });

        test("missing start time", function() {
            let event = new Event()
            .setTitle("The first event")
            .setDescription("This is the first event ever created")
            .setLocation("Reynolds 1101")
            .setEndTime("2019-04-05T20:00:00.000z")
            .setTags(["event", "awesome"]);

            return assert.isRejected(Event.isValid(event));
        });

        test("missing end time", function() {
            let event = new Event()
            .setTitle("The first event")
            .setDescription("This is the first event ever created")
            .setLocation("Reynolds 1101")
            .setStartTime("2019-04-05T19:00:00.000z")
            .setTags(["event", "awesome"]);

            return assert.isRejected(Event.isValid(event));
        });

        test("tag list not an array", function() {
            let event = new Event()
            .setTitle("The first event")
            .setDescription("This is the first event ever created")
            .setLocation("Reynolds 1101")
            .setStartTime("2019-04-05T19:00:00.000z")
            .setTags("event");

            return assert.isRejected(Event.isValid(event));
        });
    });

    suite("save()", function() {
        test("Saving valid event", function() {
            let event = new Event()
            .setTitle("The first event")
            .setDescription("This is the first event ever created")
            .setLocation("Reynolds 1101")
            .setStartTime("2019-04-05T19:00:00.000z")
            .setEndTime("2019-04-05T20:00:00.000z")
            .setTags(["event", "awesome"]);

            return assert.isFulfilled(event.save());
        });

        test("Should not save an invalid event", function() {

            // missing name so its not valid
            let event = new Event()
            .setTitle("The first event")
            .setDescription("This is the first event ever created")
            .setLocation("Reynolds 1101")
            .setStartTime("2019-04-05T19:00:00.000z")
            .setEndTime("2019-04-05T18:00:00.000z")
            .setTags(["event", "awesome"]);

            return assert.isRejected(event.save());
        });

        suiteTeardown(function() {

            if (!connection.db) {
                return;
            }

            return connection.db.collections().then((collections) => {
                let drops = [];
                collections.forEach((collection) => {
                    drops.push(collection.deleteMany({}));
                });

                return Promise.all(drops);
            });
        });
    });

    suite("getById(id)", function() {

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
            .setStartTime("2019-12-01T08:00:00.000z")
            .setEndTime("2019-12-01T20:00:00.000z")
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

        test("Getting an invalid id", function() {

            return Event.getById("507f1f77bcf86cd799439011")
            .then(() => {
                assert.fail("No event should have been found");
            })
            .catch((err) => {
                assert.isTrue(err instanceof errors.event.NotFoundError);
            });
        });

        test("Getting an valid id", function() {

            return Event.getById(event1.id)
            .then((event) => {
                assert.equal(event.id, event1.id);
                assert.equal(event.title, event1.title);
                assert.equal(event.description, event1.description);
                assert.equal(event.location, event1.location);
                assert.equal(event.startTime.valueOf(), event1.startTime.valueOf());
                assert.equal(event.endTime.valueOf(), event1.endTime.valueOf());
            });
        });

        suiteTeardown(function() {

            if (!connection.db) {
                return;
            }

            return connection.db.collections().then((collections) => {
                let drops = [];
                collections.forEach((collection) => {
                    drops.push(collection.deleteMany({}));
                });

                return Promise.all(drops);
            });
        });
    });

    suite("delete()", function() {

        var event1;

        suiteSetup(function() {

            event1 = new Event()
            .setTitle("The first event")
            .setDescription("This is the first event ever created")
            .setLocation("Reynolds 1101")
            .setStartTime("2019-04-05T19:00:00.000z")
            .setEndTime("2019-04-05T20:00:00.000z")
            .setTags(["event", "awesome"]);

            // save the execs to the db
            event1.save()
            .then((event) => {
                event1 = event;
            })
            .catch((err) => {
                    logger.error("Unexpected error", err);
                });
        });

        test("delete an invalid id", function() {

            let event = new Event()
            .setTitle("not in db")
            .setDescription("this should have a db but not be in the db")
            .setLocation("Pi lab")
            .setStartTime("2019-12-01T08:00:00.000z")
            .setEndTime("2019-12-01T20:00:00.000z")
            .setTags(["event"]);

            return event.delete()
            .then(() => {
                assert.fail("No event should have been found");
            })
            .catch((err) => {
                assert.isTrue(err instanceof errors.event.NotFoundError);
            });
        });

        test("delete an valid id", function() {

            return event1.delete()
            .then((event) => {
                assert.equal(event.id, event1.id);
                assert.equal(event.title, event1.title);
                assert.equal(event.description, event1.description);
                assert.equal(event.location, event1.location);
                assert.equal(event.startTime.valueOf(), event1.startTime.valueOf());
                assert.equal(event.endTime.valueOf(), event1.endTime.valueOf());
            });
        });

        suiteTeardown(function() {

            if (!connection.db) {
                return;
            }

            return connection.db.collections().then((collections) => {
                let drops = [];
                collections.forEach((collection) => {
                    drops.push(collection.deleteMany({}));
                });

                return Promise.all(drops);
            });
        });
    });

    suite("toApiV1()", function() {
        test("check that only the correct fields are present", function() {
            let event = new Event()
            .setTitle("The first event")
            .setDescription("This is the first event ever created")
            .setLocation("Reynolds 1101")
            .setStartTime("2019-04-05T19:00:00.000z")
            .setEndTime("2019-04-05T20:00:00.000z")
            .setTags(["event", "awesome"]);

            assert.hasAllKeys(event.toApiV1(), [
                "title",
                "description",
                "location",
                "start_time",
                "end_time",
                "tags",
                "id"
            ]);

            assert.equal(event.toApiV1().start_time, "2019-04-05T19:00:00.000Z");
            assert.equal(event.toApiV1().end_time, "2019-04-05T20:00:00.000Z");
        });
    });
});
