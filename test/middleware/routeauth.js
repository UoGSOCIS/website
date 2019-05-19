/**
 * Mocha unit tests for custom middleware. Note that this file does not require
 * mocha. Tests facilitated by supertest.
 *
 * @file test/middleware/routeauth.js
 * @author Marshall Asch <masch@uoguelph.ca>
 * @see module middleware
 */
"use strict";

const source = require("rfr");

const chai = require("chai");
const asPromised = require("chai-as-promised");
const assert = chai.assert;

const middleware = source("middleware");
const routeAuth = middleware.routeAuth;

const authentication = source("authentication");
const config = source("config");
const logger = source("logger");


chai.use(asPromised);

/* route auth test suite */
suite ("middleware/routeauth", function() {
    function assertIsApiv1ErrorResponse(code, err) {
        assert.isOk(Number.isInteger(code));
        assert.equal(err.status, code);
        assert.isString(err.message);
    }

    let validToken = "";      // this will be set in the setup method
    const invalidToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

    const getValid = (key) => {
        if (key === "authorization") {
            return `bearer: ${validToken}`;
        }
        return undefined;
    };

    const getInvalid = (key) => {
        if (key === "authorization") {
            return `bearer: ${invalidToken}`;
        }
        return undefined;
    };

    // eslint-disable-next-line no-unused-vars
    const getNothing = (key) => {
        return undefined;
    };


    suiteSetup(function() {
        const iat = Date.now();
        const exp = iat + 5 * 60000;    // 5 min from now

        return authentication.sign({
            iss: config.jwt.iss[0],
            azp: config.jwt.aud,
            aud: config.jwt.aud,
            sub: "1179434225147165448",
            hd: "socis.ca",
            email: "test_account@socis.ca",
            email_verified: true,
            at_hash: "2EB436643D1F1E733B8224FF2D56CB1F62CF5C55",
            name: "This is a test run of sign",
            picture: "https://images.pexels.com/photos/104827/cat-pet-animal-domestic-104827.jpeg",
            given_name: "Test",
            family_name: "User",
            locale: "en",
            iat: iat,
            exp: exp,
        })
        .then((token) => {
            validToken = token;
        })
        .catch((err) => {
            logger.error("Error creating user test token", err);
        });
    });

    suite("can perform anything on non api or admin endpoints without authentication ", function() {

        test("GET roboticon", function() {
            // the session passes authentication

            return routeAuth({
                method: "GET",
                path: "/roboticon",
            }, null, (err) => {
                assert.isUndefined(err);
            });
        });

        test("POST roboticon", function() {
            // the session passes authentication

            return routeAuth({
                method: "POST",
                path: "/roboticon",
            }, null, (err) => {
                assert.isUndefined(err);
            });
        });

        test("PATCH roboticon", function() {
            // the session passes authentication

            return routeAuth({
                method: "PATCH",
                path: "/roboticon",
            }, null, (err) => {
                assert.isUndefined(err);
            });
        });

    });

    suite("can GET api endpoints without authentication", function() {

        test("can GET api endpoints, without authentication", function() {
            // the session passes authentication
            const reqStub = {
                method: "GET",
                path: "/api/execs",
            };

            return routeAuth(reqStub, null, (err) => {
                assert.isUndefined(err);
            });
        });

        test("can not POST api endpoints, without authentication", function() {
            // the session passes authentication
            const reqStub = {
                method: "POST",
                path: "/api/execs",
                get: getInvalid,

            };

            return routeAuth(reqStub, null, (err) => {
                assertIsApiv1ErrorResponse(401, err);
            });
        });
    });

    suite("can access protected endpoints with a session", function() {

        test("can GET api endpoints, without authentication", function() {
            // the session passes authentication
            const reqStub = {
                method: "POST",
                path: "/api/execs",
                session: {
                    token: "It does not matter when I actualy am",
                },
            };

            return routeAuth(reqStub, null, (err) => {
                assert.isUndefined(err);
            });
        });

        test("can not POST api endpoints, without authentication", function() {
            // the session passes authentication
            const reqStub = {
                method: "GET",
                path: "/admin/execs",
                session: {
                    token: "It does not matter when I actualy am",
                },
            };

            return routeAuth(reqStub, null, (err) => {
                assert.isUndefined(err);
            });
        });
    });

    suite("can access protected with bearer token", function() {

        test("missing token should be rejected", function() {

            const reqStub = {
                method: "POST",
                path: "/api/execs",
                get: getNothing,
            };

            return routeAuth(reqStub, null, (err) => {
                assertIsApiv1ErrorResponse(401, err);
            });
        });

        test("invalid token should be rejected", function() {

            const reqStub = {
                method: "POST",
                path: "/api/execs",
                get: getInvalid,
            };

            return routeAuth(reqStub, null, (err) => {
                assertIsApiv1ErrorResponse(401, err);
            });
        });

        test("valid token should be accepted", function() {

            const reqStub = {
                method: "POST",
                path: "/api/execs",
                get: getValid,
            };

            return routeAuth(reqStub, null, (err) => {
                assert.isUndefined(err);
            });
        });
    });
});
