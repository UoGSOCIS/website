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
const Exec = source("models/exec");
const statusCodes = require("http-status-codes");

const connection = source("test/connection");
const check = source("test/router/api/assert");

chai.use(asPromised);

//FIXME: Need a way to authenticate a user for testing without using a real google account

suite("APIv1 exec routes", function() {
    suite("GET /api/v1/execs", function() {

        var pres1;
        var pres2;
        var admin1;
        var admin2;

        // create some execs here in the DB with different years
        suiteSetup(function() {

            pres1 = new Exec()
            .setEmail("pres@socis.ca")
            .setRole("president")
            .setName("Bob Marley")
            .setOrder(1)
            .setYear(new Date().getFullYear());

            admin1 = new Exec()
            .setEmail("admin@socis.ca")
            .setRole("System Admin")
            .setName("John Smith")
            .setOrder(2)
            .setYear(new Date().getFullYear());

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

        test("get exec for current year", function() {

            return request(app)
            .get("/api/v1/execs")
            .expect(statusCodes.OK)
            .then((res) => {
                check.api["v1"].isPagingObject(res.body);

                assert.lengthOf(res.body.items, 2);

                check.api["v1"].isExecObject(res.body.items[0]);
                check.api["v1"].isExecObject(res.body.items[1]);

                assert.equal(res.body.items[0].id, pres1.id);
                assert.equal(res.body.items[1].id, admin1.id);

            });
        });

        test("get exec for a different year", function() {

            return request(app)
            .get("/api/v1/execs?year=2008")
            .expect(statusCodes.OK)
            .then((res) => {
                check.api["v1"].isPagingObject(res.body);

                assert.lengthOf(res.body.items, 2);

                check.api["v1"].isExecObject(res.body.items[0]);
                check.api["v1"].isExecObject(res.body.items[1]);

                assert.equal(res.body.items[0].id, admin2.id);
                assert.equal(res.body.items[1].id, pres2.id);

            });
        });

        test("get exec for a year with no execs", function() {

            return request(app)
            .get("/api/v1/execs?year=2010")
            .expect(statusCodes.OK)
            .then((res) => {
                check.api["v1"].isPagingObject(res.body);

                assert.lengthOf(res.body.items, 0);
                assert.isNull(res.body.next);
                assert.isNull(res.body.previous);
            });
        });

        test("get exec with an limit", function() {

            return request(app)
            .get("/api/v1/execs?limit=1")
            .expect(statusCodes.OK)
            .then((res) => {
                check.api["v1"].isPagingObject(res.body);

                assert.lengthOf(res.body.items, 1);

                check.api["v1"].isExecObject(res.body.items[0]);
                assert.equal(res.body.limit, 1);
                assert.equal(res.body.total, 2);

                assert.equal(res.body.items[0].id, pres1.id);
            });
        });

        test("get exec with an limit and offset", function() {

            return request(app)
            .get("/api/v1/execs?limit=1&offset=1")
            .expect(statusCodes.OK)
            .then((res) => {
                check.api["v1"].isPagingObject(res.body);

                assert.lengthOf(res.body.items, 1);

                check.api["v1"].isExecObject(res.body.items[0]);

                assert.equal(res.body.limit, 1);
                assert.equal(res.body.total, 2);

                assert.equal(res.body.items[0].id, admin1.id);
            });
        });

        test("get exec with invalid year", function() {

            return request(app)
            .get("/api/v1/execs?year=abc")
            .expect(statusCodes.BAD_REQUEST)
            .then((res) => {
                check.api["v1"].isGenericResponse(statusCodes.BAD_REQUEST, res.body);
            });
        });

        test("get exec with invalid limit", function() {

            return request(app)
            .get("/api/v1/execs?limit=abc")
            .expect(statusCodes.BAD_REQUEST)
            .then((res) => {
                check.api["v1"].isGenericResponse(statusCodes.BAD_REQUEST, res.body);
            });
        });

        test("get exec with invalid offset", function() {

            return request(app)
            .get("/api/v1/execs?offset=-1")
            .expect(statusCodes.BAD_REQUEST)
            .then((res) => {
                check.api["v1"].isGenericResponse(statusCodes.BAD_REQUEST, res.body);
            });
        });

        // clear the execs DB
        suiteTeardown(function() {
            return connection.db.collections().then((collections) => {
                let drops = [];
                collections.forEach((collection) => {
                    drops.push(collection.deleteMany({}));
                });

                return Promise.all(drops);
            });
        });
    });

    suite("POST /api/v1/execs", function() {

    });

    suite("PATCH /api/v1/execs", function() {

    });

    suite("DELETE /api/v1/execs/:execId", function() {

    });
});