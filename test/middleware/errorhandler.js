/**
 * Mocha unit tests for the error handeler middleware. Note that this file does not require
 * mocha.
 *
 * This middleware will intercept any errors that are passed to it and will determine if it should render a web page,
 * redirect the user, or send a JSON object to be consumed by an API.
 *
 * @file test/middleware/errorhandler.js
 * @author Marshall Asch <masch@uoguelph.ca>
 * @see module:middleware
 */
"use strict";

const source = require("rfr");

const chai = require("chai");
const asPromised = require("chai-as-promised");
const assert = chai.assert;

const middleware = source("middleware");
const errorHandler = middleware.errorHandler;
const Error = source("models/responses").Error;

chai.use(asPromised);

/* require headers test suite */
suite("middleware/errorhandler", function() {
    function assertIsApiv1ErrorResponse(code, err) {
        assert.isOk(Number.isInteger(code));
        assert.equal(err.status, code);
        assert.isString(err.message);
    }

    test("receive syntax error (bad JSON errors)", function() {

        const resSub = {
            status: (code) => {
                assert.equal(code, 400);
                return {
                    json: (body) => {
                        assertIsApiv1ErrorResponse(400, body);
                    },
                };
            },
        };

        errorHandler(new SyntaxError(), {method: "GET", path: "/api/test", }, resSub, null);
    });

    test("receive unrecognised error object", function() {

        const resSub = {
            status: (code) => {
                assert.equal(code, 500);
                return {
                    json: (body) => {
                        assertIsApiv1ErrorResponse(500, body);
                    },
                };
            },
        };

        errorHandler({_message: "unknown err", }, {method: "GET", path: "/api/test", }, resSub, null);
    });

    test("receive null error object, do nothing", function() {

        const resSub = {
            status: () => {
                assert.fail("This should not be called");
                return {
                    json: () => {
                        assert.fail("This should not be called");
                    },
                };
            },
            render: () => {
                assert.fail("This should not be called");
            },
            redirect: () => {
                assert.fail("This should not be called");
            },
        };

        errorHandler(null, {method: "GET", path: "/api/test", }, resSub, null);
    });

    test("path is /api/test, should send json", function() {

        const resSub = {
            status: (code) => {
                assert.equal(code, 404);
                return {
                    json: (body) => {
                        assertIsApiv1ErrorResponse(404, body);
                    },
                };
            },
        };

        errorHandler(new Error(404, "Not Found"), {method: "GET", path: "/api/test", }, resSub, null);
    });

    test("path is //api/test, should send json", function() {

        const resSub = {
            status: (code) => {
                assert.equal(code, 404);
                return {
                    json: (body) => {
                        assertIsApiv1ErrorResponse(404, body);
                    },
                };
            },
        };

        errorHandler(new Error(404, "Not Found"), {method: "GET", path: "//api/test", }, resSub, null);
    });

    test("path is /admin/test and status != 401, should render page", function() {

        const resSub = {
            render: (page, args) => {
                assert.equal(page, "error");
                assert.containsAllKeys(args, ["status", "message"]);

                assert.equal(args.status, 404);
                assert.equal(args.message, "Not Found");
            },
        };

        errorHandler(new Error(404, "Not Found"), {method: "GET", path: "/admin/test", }, resSub, null);
    });

    test("path is /admin/test and status = 401, should redirect to home", function() {

        const resSub = {
            redirect: (path) => {
                assert.equal(path, "/");
            },
        };

        errorHandler(Error.Unauthorized(), {method: "GET", path: "/admin/test", }, resSub, null);
    });
});

