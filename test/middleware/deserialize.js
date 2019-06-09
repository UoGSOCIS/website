/**
 * Mocha unit tests for custom middleware. Note that this file does not require
 * mocha. Tests facilitated by supertest.
 *
 * @file test/middleware/deserialize.js
 * @author Marshall Asch <masch@uoguelph.ca>
 * @see module middleware
 */
"use strict";

const source = require("rfr");

const chai = require("chai");
const asPromised = require("chai-as-promised");
const assert = chai.assert;

const middleware = source("middleware");
const deserialize = middleware.deserialize;

const authentication = source("authentication");
const logger = source("logger");

const connection = source("test/connection");

const users = source("models/user");


chai.use(asPromised);


/* deserialize test suite */
suite("middleware/deserialize", function() {

    let user;
    let fakeUser;
    let validToken = "";      // this will be set in the setup method
    let fakeToken = "";         // this will be a valid token for the user not in the db
    const invalidToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

    function getToken(token) {

        return (key) => {
            if (key === "authorization") {
                return token ? `bearer ${token}` : undefined;
            }
            return undefined;
        };
    }

    suiteSetup(function() {

        const newUser = new users.User()
        .setAccountId("567893345re")
        .setName("Test User")
        .setEmail("deserializerTestUser@example.com")
        .setPermissions(users.Permission.NONE);

        fakeUser = new users.User()
        .setAccountId("i8i7ytvgbu687")
        .setName("Test User - not saved")
        .setEmail("deserializerTestUser2@example.com")
        .setPermissions(users.Permission.NONE);

        return newUser.save()
        .then((saved) => {
            user = saved;
            return authentication.sign(user.toApiV1());
        })
        .then((token) => {
            validToken = token;
            return authentication.sign(fakeUser.toApiV1());
        })
        .then((token) => {
            fakeToken = token;
        })
        .catch((err) => {
            logger.error("Error creating user test token", err);
        });
    });

    test("valid token", function() {

        const reqSub = {
            get: getToken(validToken),
        };

        return deserialize(reqSub, null, (err) => {

            assert.isUndefined(err);
            assert.equal(reqSub.user.id, user.id);
            assert.equal(reqSub.user.email, user.email);
            assert.equal(reqSub.user.name, user.name);
            assert.equal(reqSub.user.permissions, user.permissions);
        });
    });

    test("no session, no token", function() {

        const reqSub = {
            get: getToken(),
        };

        return deserialize(reqSub, null, (err) => {
            assert.isUndefined(err);
            assert.isUndefined(reqSub.user);
        });
    });

    test("user in session is not in DB", function() {

        const reqSub = {
            session: {
                user: fakeUser.toApiV1(),
            },
            get: getToken(),
        };

        return deserialize(reqSub, null, (err) => {
            assert.isUndefined(err);
            assert.isUndefined(reqSub.user);
        });
    });

    test("valid session", function() {

        const reqSub = {
            session: {
                user: user.toApiV1(),
            },
            get: getToken(),
        };

        return deserialize(reqSub, null, (err) => {
            assert.isUndefined(err);
            assert.equal(reqSub.user.id, user.id);
            assert.equal(reqSub.user.email, user.email);
            assert.equal(reqSub.user.name, user.name);
            assert.equal(reqSub.user.permissions, user.permissions);
        });
    });

    test("invalid token", function() {

        const reqSub = {
            get: getToken(invalidToken),
        };

        return deserialize(reqSub, null, (err) => {
            assert.isDefined(err);
        });
    });

    test("no user in the db for the token", function() {
        const reqSub = {
            get: getToken(fakeToken),
        };

        return deserialize(reqSub, null, (err) => {
            assert.isDefined(err);
        });
    });

    // clear the DB
    suiteTeardown(function() {
        return new Promise((resolve, reject) => {

            return connection.db.dropCollection("users", (err, result) => {

                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    });
});