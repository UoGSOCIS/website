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

const users = source("models/user");


chai.use(asPromised);

/* route auth test suite */
suite("middleware/routeauth", function() {
    function assertIsApiv1ErrorResponse(code, err) {
        assert.isOk(Number.isInteger(code));
        assert.equal(err.status, code);
        assert.isString(err.message);
    }

    function generateUser(permission) {

        return new users.User()
        .setAccountId("8765yu97865rtcfvgbiu78")
        .setName("user with perm: " + permission)
        .setEmail("email@example.com")
        .setPermissions(permission);
    }

    const accounts = {
        none: generateUser(users.Permission.NONE),
        superAdmin: generateUser(users.Permission.ADMIN),
        events: generateUser(users.Permission.EVENTS),
        seller: generateUser(users.Permission.SELLER),
        newsletter: generateUser(users.Permission.NEWSLETTER),
        merchant: generateUser(users.Permission.MERCHANT),
        merchSeller: generateUser(users.Permission.MERCHANT | users.Permission.SELLER),
    };

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
            };

            return routeAuth(reqStub, null, (err) => {
                assertIsApiv1ErrorResponse(401, err);
            });
        });
    });

    suite("Only users with valid permissions can access event routes", function() {

        test("no permission should not be able to access admin/events", function() {
            // the session passes authentication
            const reqStub = {
                method: "POST",
                path: "/admin/events",
                user: accounts.none,
            };

            return routeAuth(reqStub, null, (err) => {
                assertIsApiv1ErrorResponse(403, err);
            });
        });

        test("merchant permission should not be able to access admin/events", function() {
            // the session passes authentication
            const reqStub = {
                method: "POST",
                path: "/admin/events",
                user: accounts.merchant,
            };

            return routeAuth(reqStub, null, (err) => {
                assertIsApiv1ErrorResponse(403, err);
            });
        });

        test("admin permission should be able to access admin/events", function() {
            // the session passes authentication
            const reqStub = {
                method: "POST",
                path: "/admin/events",
                user: accounts.superAdmin,
            };

            return routeAuth(reqStub, null, (err) => {
                assert.isUndefined(err);
            });
        });

        test("events permission should be able to access admin/events", function() {
            // the session passes authentication
            const reqStub = {
                method: "POST",
                path: "/admin/events",
                user: accounts.events,
            };

            return routeAuth(reqStub, null, (err) => {
                assert.isUndefined(err);
            });
        });

        test("events permission should be able to access api/v1/events", function() {
            // the session passes authentication
            const reqStub = {
                method: "POST",
                path: "/api/v1/events",
                user: accounts.events,
            };

            return routeAuth(reqStub, null, (err) => {
                assert.isUndefined(err);
            });
        });

        test("admin permission be able to access api/v1/events", function() {
            // the session passes authentication
            const reqStub = {
                method: "POST",
                path: "/api/v1/events",
                user: accounts.superAdmin,
            };

            return routeAuth(reqStub, null, (err) => {
                assert.isUndefined(err);
            });
        });
    });

    suite("Only users with valid permissions can access exec routes", function() {

        test("no permission should not be able to access admin/exec", function() {
            // the session passes authentication
            const reqStub = {
                method: "POST",
                path: "/admin/exec",
                user: accounts.none,
            };

            return routeAuth(reqStub, null, (err) => {
                assertIsApiv1ErrorResponse(403, err);
            });
        });

        test("merchant permission should not be able to access admin/exec", function() {
            // the session passes authentication
            const reqStub = {
                method: "POST",
                path: "/admin/exec",
                user: accounts.merchant,
            };

            return routeAuth(reqStub, null, (err) => {
                assertIsApiv1ErrorResponse(403, err);
            });
        });

        test("admin permission should be able to access admin/exec", function() {
            // the session passes authentication
            const reqStub = {
                method: "POST",
                path: "/admin/exec",
                user: accounts.superAdmin,
            };

            return routeAuth(reqStub, null, (err) => {
                assert.isUndefined(err);
            });
        });

        test("events permission should not be able to access admin/exec", function() {
            // the session passes authentication
            const reqStub = {
                method: "POST",
                path: "/admin/exec",
                user: accounts.events,
            };

            return routeAuth(reqStub, null, (err) => {
                assertIsApiv1ErrorResponse(403, err);
            });
        });

        test("events permission should not be able to access api/v1/execs", function() {
            // the session passes authentication
            const reqStub = {
                method: "POST",
                path: "/api/v1/execs",
                user: accounts.events,
            };

            return routeAuth(reqStub, null, (err) => {
                assertIsApiv1ErrorResponse(403, err);
            });
        });

        test("admin permission should be able to access api/v1/execs", function() {
            // the session passes authentication
            const reqStub = {
                method: "POST",
                path: "/api/v1/execs",
                user: accounts.superAdmin,
            };

            return routeAuth(reqStub, null, (err) => {
                assert.isUndefined(err);
            });
        });
    });

    suite("Only users with valid permissions can access newsletter routes", function() {

        test("no permission should not be able to access admin/newsletter", function() {
            // the session passes authentication
            const reqStub = {
                method: "POST",
                path: "/admin/newsletter",
                user: accounts.none,
            };

            return routeAuth(reqStub, null, (err) => {
                assertIsApiv1ErrorResponse(403, err);
            });
        });

        test("merchant permission should not be able to access admin/newsletter", function() {
            // the session passes authentication
            const reqStub = {
                method: "POST",
                path: "/admin/newsletter",
                user: accounts.merchant,
            };

            return routeAuth(reqStub, null, (err) => {
                assertIsApiv1ErrorResponse(403, err);
            });
        });

        test("admin permission should be able to access admin/newsletter", function() {
            // the session passes authentication
            const reqStub = {
                method: "POST",
                path: "/admin/newsletter",
                user: accounts.superAdmin,
            };

            return routeAuth(reqStub, null, (err) => {
                assert.isUndefined(err);
            });
        });

        test("newsletter permission should be able to access admin/newsletter", function() {
            // the session passes authentication
            const reqStub = {
                method: "POST",
                path: "/admin/newsletter",
                user: accounts.newsletter,
            };

            return routeAuth(reqStub, null, (err) => {
                assert.isUndefined(err);
            });
        });

        test("newsletter permission should be able to access  api/v1/newsletter", function() {
            // the session passes authentication
            const reqStub = {
                method: "POST",
                path: "/api/v1/newsletter",
                user: accounts.newsletter,
            };

            return routeAuth(reqStub, null, (err) => {
                assert.isUndefined(err);
            });
        });

        test("events permission should not be able to access api/v1/newsletter", function() {
            // the session passes authentication
            const reqStub = {
                method: "POST",
                path: "/api/v1/newsletter",
                user: accounts.events,
            };

            return routeAuth(reqStub, null, (err) => {
                assertIsApiv1ErrorResponse(403, err);
            });
        });

        test("admin permission should be able to access api/v1/newsletter", function() {
            // the session passes authentication
            const reqStub = {
                method: "POST",
                path: "/api/v1/newsletter",
                user: accounts.superAdmin,
            };

            return routeAuth(reqStub, null, (err) => {
                assert.isUndefined(err);
            });
        });
    });

    suite("Only users with valid permissions can access store routes", function() {

        test("no permission should not be able to access admin/products", function() {
            // the session passes authentication
            const reqStub = {
                method: "POST",
                path: "/admin/products",
                user: accounts.none,
            };

            return routeAuth(reqStub, null, (err) => {
                assertIsApiv1ErrorResponse(403, err);
            });
        });

        test("seller permission should not be able to access admin/products", function() {
            // the session passes authentication
            const reqStub = {
                method: "POST",
                path: "/admin/products",
                user: accounts.seller,
            };

            return routeAuth(reqStub, null, (err) => {
                assertIsApiv1ErrorResponse(403, err);
            });
        });

        test("admin permission should be able to access admin/products", function() {
            // the session passes authentication
            const reqStub = {
                method: "POST",
                path: "/admin/products",
                user: accounts.superAdmin,
            };

            return routeAuth(reqStub, null, (err) => {
                assert.isUndefined(err);
            });
        });

        test("merchant permission should be able to access admin/products", function() {
            // the session passes authentication
            const reqStub = {
                method: "POST",
                path: "/admin/products",
                user: accounts.merchant,
            };

            return routeAuth(reqStub, null, (err) => {
                assert.isUndefined(err);
            });
        });

        test("merchant and seller permission should be able to access admin/products", function() {
            // the session passes authentication
            const reqStub = {
                method: "POST",
                path: "/admin/products",
                user: accounts.merchSeller,
            };

            return routeAuth(reqStub, null, (err) => {
                assert.isUndefined(err);
            });
        });

        test("merchant permission should be able to access api/v1/products", function() {
            // the session passes authentication
            const reqStub = {
                method: "POST",
                path: "/api/v1/products",
                user: accounts.merchant,
            };

            return routeAuth(reqStub, null, (err) => {
                assert.isUndefined(err);
            });
        });

        test("seller permission should not be able to access api/v1/products", function() {
            // the session passes authentication
            const reqStub = {
                method: "POST",
                path: "/api/v1/products",
                user: accounts.seller,
            };

            return routeAuth(reqStub, null, (err) => {
                assertIsApiv1ErrorResponse(403, err);
            });
        });

        test("admin permission should be able to access api/v1/products", function() {
            // the session passes authentication
            const reqStub = {
                method: "POST",
                path: "/api/v1/products",
                user: accounts.superAdmin,
            };

            return routeAuth(reqStub, null, (err) => {
                assert.isUndefined(err);
            });
        });
    });

    suite("Only users with valid permissions can access sales info", function() {

        test("no permission should not be able to access admin/store", function() {
            // the session passes authentication
            const reqStub = {
                method: "POST",
                path: "/admin/store",
                user: accounts.none,
            };

            return routeAuth(reqStub, null, (err) => {
                assertIsApiv1ErrorResponse(403, err);
            });
        });

        test("seller permission should be able to access admin/store", function() {
            // the session passes authentication
            const reqStub = {
                method: "POST",
                path: "/admin/store",
                user: accounts.seller,
            };

            return routeAuth(reqStub, null, (err) => {
                assert.isUndefined(err);
            });
        });

        test("admin permission should be able to access admin/store", function() {
            // the session passes authentication
            const reqStub = {
                method: "POST",
                path: "/admin/store",
                user: accounts.superAdmin,
            };

            return routeAuth(reqStub, null, (err) => {
                assert.isUndefined(err);
            });
        });

        test("merchant permission should not be able to access admin/store", function() {
            // the session passes authentication
            const reqStub = {
                method: "POST",
                path: "/admin/store",
                user: accounts.merchant,
            };

            return routeAuth(reqStub, null, (err) => {
                assertIsApiv1ErrorResponse(403, err);
            });
        });

        test("merchant and seller permission should be able to access admin/store", function() {
            // the session passes authentication
            const reqStub = {
                method: "POST",
                path: "/admin/store",
                user: accounts.merchSeller,
            };

            return routeAuth(reqStub, null, (err) => {
                assert.isUndefined(err);
            });
        });
    });

    suite("all the admin permissions should be able to access the admin page", function() {

        test("no permission should not be able to access admin", function() {
            // the session passes authentication
            const reqStub = {
                method: "POST",
                path: "/admin",
                user: accounts.none,
            };

            return routeAuth(reqStub, null, (err) => {
                assertIsApiv1ErrorResponse(403, err);
            });
        });

        test("seller permission should be able to access admin", function() {
            // the session passes authentication
            const reqStub = {
                method: "POST",
                path: "/admin",
                user: accounts.seller,
            };

            return routeAuth(reqStub, null, (err) => {
                assert.isUndefined(err);
            });
        });

        test("merchant permission should be able to access admin", function() {
            // the session passes authentication
            const reqStub = {
                method: "POST",
                path: "/admin",
                user: accounts.merchant,
            };

            return routeAuth(reqStub, null, (err) => {
                assert.isUndefined(err);
            });
        });

        test("merchSeller permission should be able to access admin", function() {
            // the session passes authentication
            const reqStub = {
                method: "POST",
                path: "/admin",
                user: accounts.merchSeller,
            };

            return routeAuth(reqStub, null, (err) => {
                assert.isUndefined(err);
            });
        });

        test("Admin permission should be able to access admin", function() {
            // the session passes authentication
            const reqStub = {
                method: "POST",
                path: "/admin",
                user: accounts.superAdmin,
            };

            return routeAuth(reqStub, null, (err) => {
                assert.isUndefined(err);
            });
        });

        test("newsletter permission should be able to access admin", function() {
            // the session passes authentication
            const reqStub = {
                method: "POST",
                path: "/admin",
                user: accounts.newsletter,
            };

            return routeAuth(reqStub, null, (err) => {
                assert.isUndefined(err);
            });
        });

        test("events permission should be able to access admin", function() {
            // the session passes authentication
            const reqStub = {
                method: "POST",
                path: "/admin",
                user: accounts.events,
            };

            return routeAuth(reqStub, null, (err) => {
                assert.isUndefined(err);
            });
        });
    });

    suite("none should be able to access pages they dont have permission for", function() {

        test("no permission should not be able to access admin/test", function() {
            // the session passes authentication
            const reqStub = {
                method: "POST",
                path: "/admin/test",
                user: accounts.none,
            };

            return routeAuth(reqStub, null, (err) => {
                assertIsApiv1ErrorResponse(403, err);
            });
        });

        test("seller permission should not be able to access admin/test", function() {
            // the session passes authentication
            const reqStub = {
                method: "POST",
                path: "/admin/test",
                user: accounts.seller,
            };

            return routeAuth(reqStub, null, (err) => {
                assertIsApiv1ErrorResponse(403, err);
            });
        });

        test("merchant permission should not be able to access admin/test", function() {
            // the session passes authentication
            const reqStub = {
                method: "POST",
                path: "/admin/test",
                user: accounts.merchant,
            };

            return routeAuth(reqStub, null, (err) => {
                assertIsApiv1ErrorResponse(403, err);
            });
        });

        test("merchSeller permission should not be able to access admin/test", function() {
            // the session passes authentication
            const reqStub = {
                method: "POST",
                path: "/admin/test",
                user: accounts.merchSeller,
            };

            return routeAuth(reqStub, null, (err) => {
                assertIsApiv1ErrorResponse(403, err);
            });
        });

        test("Admin permission should be able to access admin/test", function() {
            // the session passes authentication
            const reqStub = {
                method: "POST",
                path: "/admin/test",
                user: accounts.superAdmin,
            };

            return routeAuth(reqStub, null, (err) => {
                assert.isUndefined(err);
            });
        });

        test("newsletter permission should not be able to access admin/test", function() {
            // the session passes authentication
            const reqStub = {
                method: "POST",
                path: "/admin/test",
                user: accounts.newsletter,
            };

            return routeAuth(reqStub, null, (err) => {
                assertIsApiv1ErrorResponse(403, err);
            });
        });

        test("events permission should not be able to access admin/test", function() {
            // the session passes authentication
            const reqStub = {
                method: "POST",
                path: "/admin/test",
                user: accounts.events,
            };

            return routeAuth(reqStub, null, (err) => {
                assertIsApiv1ErrorResponse(403, err);
            });
        });
    });
});
