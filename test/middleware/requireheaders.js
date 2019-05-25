/**
 * Mocha unit tests for the require headers middleware. Note that this file does not require
 * mocha.
 *
 * @file test/middleware/requireheaders.js
 * @author Marshall Asch <masch@uoguelph.ca>
 * @see module:middleware
 */
"use strict";

const source = require("rfr");

const chai = require("chai");
const asPromised = require("chai-as-promised");
const assert = chai.assert;

const middleware = source("middleware");
const requireHeaders = middleware.requireHeaders;

chai.use(asPromised);

/* require headers test suite */
suite("middleware/requireheaders", function() {
    function assertIsApiv1ErrorResponse(code, err) {
        assert.isOk(Number.isInteger(code));
        assert.equal(err.status, code);
        assert.isString(err.message);
    }

    // this is used to stub out the express request object
    const reqStub = {
        noHeader: {
            method: "get",
            path: "/test/headers",
            // eslint-disable-next-line no-unused-vars
            get: (key) => {
                return undefined;
            },
        },
        withHeader: {
            method: "get",
            path: "/test/headers",
            get: (key) => {

                if (key === "X-Custom-Header") {
                    return "penguins";
                }
                return undefined;
            },
        },
    };

    test("requests with the expected header succeed", function() {

        return requireHeaders([{
            key: "X-Custom-Header",
            value: "penguins",
        }])(reqStub.withHeader, null, (err) => {

            assert.isUndefined(err);
        });
    });

    test("requests without the expected header fail with 400", function() {

        return requireHeaders([{
            key: "X-Custom-Header",
            value: "value",
        }])(reqStub.noHeader, null, (err) => {

            assertIsApiv1ErrorResponse(400, err);
        });
    });

    test("requests without the expected header value fail with 400", function() {

        return requireHeaders([{
            key: "X-Custom-Header",
            value: "caterpillar",
        }])(reqStub.withHeader, null, (err) => {

            assertIsApiv1ErrorResponse(400, err);
        });
    });

    test("requests with expected header and variable value succeed", function() {

        return requireHeaders([{
            key: "X-Custom-Header",
        }])(reqStub.withHeader, null, (err) => {

            assert.isUndefined(err);
        });
    });

    test("requests without expected variable-value header fail with 400", function() {

        return requireHeaders([{
            key: "X-Custom-Header",
        }])(reqStub.noHeader, null, (err) => {

            assertIsApiv1ErrorResponse(400, err);
        });
    });

    test("requests without bad configuration should succeed", function() {

        return requireHeaders([{
            apples: "X-Custom-Header",
            value: "cats",
        }])(reqStub.noHeader, null, (err) => {

            assertIsApiv1ErrorResponse(400, err);
        });
    });

    test("if middleware is used but not configured, requested succeed", function() {

        return requireHeaders()(reqStub.noHeader, null, (err) => {

            assert.isUndefined(err);
        });
    });
});

