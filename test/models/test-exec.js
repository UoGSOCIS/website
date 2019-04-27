/**
 * Mocha unit tests for user module. Note that this file does not require mocha.
 * Asserts provided via the chai framework. All test should return Promises.
 *
 * @file test-exec.js
 * @see module:models/user
 */
"use strict";

var source = require("rfr");
const chai = require("chai");

const asPromised = require("chai-as-promised");
const assert = chai.assert;

const Exec = source("models/exec");
const connection = source("test/connection");

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
    });

    suiteTeardown(function() {

        if (!connection.db) {
            return;
        }

        return connection.db.collections().then((collections) => {
            let drops = [];
            collections.forEach((collection) => {
                drops.push(collection.remove({}));
            });

            return Promise.all(drops);
        });
    });
});
