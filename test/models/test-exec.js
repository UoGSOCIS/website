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
const validator = require("validator");

const asPromised = require("chai-as-promised");
const assert = chai.assert;

const exec = source("models/exec");
const connection = source("test/connection");

chai.use(asPromised);

/* User class test suite */
suite("Exec", function() {
    let referenceUser;

    suiteSetup(function() {
        referenceUser = new exec();
    });


    suite("#init()", function() {
        test("should have a uuid", function() {

            assert.isString(referenceUser.uuid);
            assert.isTrue(validator.isUUID(referenceUser.uuid));
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
