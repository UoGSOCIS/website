/**
 * Mocha unit tests for exec module. Note that this file does not require mocha.
 * Asserts provided via the chai framework. All test should return Promises.
 *
 * @file test-exec.js
 * @see module:models/exec
 */
"use strict";

const source = require("rfr");
const chai = require("chai");

const asPromised = require("chai-as-promised");
const assert = chai.assert;

const Exec = source("models/exec");
const connection = source("test/connection");
const logger = source("logger");


chai.use(asPromised);

/* User class test suite */
suite("Exec", function() {

    suite("#init()", function() {

        let exec = new Exec()
        .setName("Marshall")
        .setRole("admin")
        .setEmail("admin@socis.ca");

        test("should have an id", function() {
            assert.isString(exec.id);
            assert.lengthOf(exec.id, 24);
        });

        test("default year should be the current year", function() {
            assert.equal(exec.year, new Date().getFullYear());
        });

        test("default order should be 0", function() {
            assert.equal(exec.order, 0);
        });

        test("should have a name", function() {
            assert.equal(exec.name, "Marshall");
        });

        test("should have a role", function() {
            assert.equal(exec.role, "admin");
        });

        test("should have a email", function() {
            assert.equal(exec.email, "admin@socis.ca");
        });
    });

    suite("validate(exec)", function() {
        test("should be valid", function() {
            let exec = new Exec()
            .setName("Marshall")
            .setRole("admin")
            .setEmail("admin@socis.ca")
            .setYear(2017)
            .setOrder(4);

            return assert.isFulfilled(Exec.isValid(exec));
        });

        test("valid default year", function() {
            let exec = new Exec()
            .setName("Marshall")
            .setRole("admin")
            .setEmail("admin@socis.ca")
            .setOrder(4);

            return assert.isFulfilled(Exec.isValid(exec));
        });

        test("valid default order", function() {
            let exec = new Exec()
            .setName("Marshall")
            .setRole("admin")
            .setEmail("admin@socis.ca")
            .setYear(2017);

            return assert.isFulfilled(Exec.isValid(exec));
        });

        test("missing name", function() {
            let exec = new Exec()
            .setRole("admin")
            .setEmail("admin@socis.ca")
            .setYear(2017)
            .setOrder(4);

            return assert.isRejected(Exec.isValid(exec));
        });

        test("missing role", function() {
            let exec = new Exec()
            .setName("Marshall")
            .setEmail("admin@socis.ca")
            .setYear(2017)
            .setOrder(4);

            return assert.isRejected(Exec.isValid(exec));
        });

        test("missing email", function() {
            let exec = new Exec()
            .setName("Marshall")
            .setRole("admin")
            .setYear(2017)
            .setOrder(4);

            return assert.isRejected(Exec.isValid(exec));
        });

        test("email is not a valid email", function() {
            let exec = new Exec()
            .setName("Marshall")
            .setRole("admin")
            .setEmail("email_address")
            .setYear(2017)
            .setOrder(4);

            return assert.isRejected(Exec.isValid(exec));
        });

        test("year is before 2000, which is too old", function() {
            let exec = new Exec()
            .setName("Marshall")
            .setRole("admin")
            .setEmail("admin@socis.ca")
            .setYear(1990)
            .setOrder(4);

            return assert.isRejected(Exec.isValid(exec));
        });

        test("year is too far in the future 2120, which is more then 2 years", function() {
            let exec = new Exec()
            .setName("Marshall")
            .setRole("admin")
            .setEmail("admin@socis.ca")
            .setYear(2120)
            .setOrder(4);

            return assert.isRejected(Exec.isValid(exec));
        });
    });

    suite("save()", function() {
        test("Saving valid exec", function() {
            let exec = new Exec()
            .setName("Marshall")
            .setRole("admin")
            .setEmail("admin@socis.ca")
            .setYear(2017)
            .setOrder(4);

            return assert.isFulfilled(exec.save());
        });

        test("Should not save an invalid exec", function() {

            // missing name so its not valid
            let exec = new Exec()
            .setRole("admin")
            .setEmail("admin@socis.ca")
            .setYear(2017)
            .setOrder(4);

            return assert.isRejected(exec.save());
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

    suite("getExecForYear(year)", function() {

        var pres1;
        var pres2;
        var admin1;
        var admin2;

        suiteSetup(function() {

            pres1 = new Exec()
            .setEmail("pres@socis.ca")
            .setRole("president")
            .setName("Bob Marley")
            .setOrder(1)
            .setYear(2018);

            admin1 = new Exec()
            .setEmail("admin@socis.ca")
            .setRole("System Admin")
            .setName("John Smith")
            .setOrder(2)
            .setYear(2018);

            pres2 = new Exec()
            .setEmail("pres@socis.ca")
            .setRole("president")
            .setName("Jessey Jane")
            .setOrder(2)
            .setYear(2008);

            admin2 = new Exec()
            .setEmail("admin@socis.ca")
            .setRole("System Admin")
            .setName("John Franklin")
            .setOrder(1)
            .setYear(2008);

            // save the execs to the db
            pres1.save()
            .then((exec) => {
                pres1 = exec;
                return admin1.save();
            })
            .then((exec) => {
                admin1 = exec;
                return pres2.save();
            })
            .then((exec) => {
                pres2 = exec;
                return admin2.save();
            })
            .then((exec) => {
                admin2 = exec;
            })
            .catch((err) => {
                logger.error("Unexpected error", err);
            });
        });

        test("that they are returned sorted by order field, not the order they were added", function() {

            return Exec.getExecForYear(2018)
            .then((execList) => {
                assert.equal(execList.length, 2);
                assert.equal(execList[0].id, pres1.id);
                assert.equal(execList[1].id, admin1.id);

                return Exec.getExecForYear(2008);
            })
            .then((execList) => {
                assert.equal(execList.length, 2);
                assert.equal(execList[0].id, admin2.id);
                assert.equal(execList[1].id, pres2.id);
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
});
