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

        let userToken;

        suiteSetup(function() {

            //FIXME Need to automatically generate this token
            userToken = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjVkODg3ZjI2Y2UzMjU3N2M0YjVhOGExZTFhNTJlMTlkMzAxZjgxODEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXpwIjoiMzM5MjE4MzM0MzU5LTNqZDQ4MzQ4bzF0cmR2bTc1dXEzaDFxZXJpdDNpOGhjLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXVkIjoiMzM5MjE4MzM0MzU5LTNqZDQ4MzQ4bzF0cmR2bTc1dXEzaDFxZXJpdDNpOGhjLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTE3OTc1OTY5NDQyMTQ3MTY1NDQ4IiwiaGQiOiJzb2Npcy5jYSIsImVtYWlsIjoiYWRtaW5Ac29jaXMuY2EiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6IllvUjFMMXFsQkRZenEwTUJ0N0FlNlEiLCJuYW1lIjoiU29jaXMgU3lzQWRtaW4iLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDUuZ29vZ2xldXNlcmNvbnRlbnQuY29tLy1uaUs0eFNucVRwQS9BQUFBQUFBQUFBSS9BQUFBQUFBQUFBQS9BQ0hpM3JkX0JHdW9fcGhwUWtYbUYtakdaa2xuQ2JhUmNBL3M5Ni1jL3Bob3RvLmpwZyIsImdpdmVuX25hbWUiOiJTb2NpcyIsImZhbWlseV9uYW1lIjoiU3lzQWRtaW4iLCJsb2NhbGUiOiJlbiIsImlhdCI6MTU1NzA4MTQzMCwiZXhwIjoxNTU3MDg1MDMwLCJqdGkiOiJmMDdkMGYzNDk0NGExZDVjNWYxMWIxY2U3ZWNiNzg1NWY2NWEyYTQwIn0.umYVwujTr0Swg6ePgZ0-SyWb7hvG_K2gGWLuTIivJiFBhv_W4vCofzTDxe-LmctrX3d68Vh1Sne3mAeH76sl6YEZGbpFW_ge1CWHVnHhgafCvrgq_lnk00lLujxo5M0bof5WT2DfrTtRNZ3AZWqPegPqNmZ7RcbUUrblwbV5nicsS1zr716PgutYFzItYXK99UAgkL5Y2zzc0DbGcUCHSnuevwFiNFU3No6u9OyTjADYTnOKb8o1j-c3qQV1UIFs-n-087ifnFCK95jU405Vc3692XGEsheo530EJU6YeB7HsLugrhqz3qwmcSnmou6CqpUmLwsktjccOG8aCr5pig";
        });

        test("a single exec not in a list", function() {
            return request(app)
            .post("/api/v1/execs")
            .set("Content-Type", "application/json")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                name: "test Exec",
                email: "admin@socis.ca",
                order: 3,
                year: 2019,
                role: "system admin",
            })
            .expect(statusCodes.BAD_REQUEST)
            .then((res) => {

                check.api["v1"].isGenericResponse(statusCodes.BAD_REQUEST, res.body);
            });
        });

        test("a valid exec object in a list", function() {
            return request(app)
            .post("/api/v1/execs")
            .set("Content-Type", "application/json")
            .set("Authorization", `Bearer ${userToken}`)
            .send([{
                name: "test Exec",
                email: "admin@socis.ca",
                order: 3,
                year: 2019,
                role: "system admin",
            }])
            .expect(statusCodes.CREATED)
            .then((res) => {

                assert.isArray(res.body);
                assert.lengthOf(res.body, 1);

                check.api["v1"].isExecObject(res.body[0]);
            });
        });

        test("a valid object and an invalid object", function() {

            return request(app)
            .post("/api/v1/execs")
            .set("Content-Type", "application/json")
            .set("Authorization", `Bearer ${userToken}`)
            .send([
                {
                    name: "test Exec1",
                    email: "pres@socis.ca",
                    order: 2,
                    year: 2019,
                    role: "president",
                },
                {
                    name: "test Exec2",
                    email: "year-rep@socis.ca",
                    order: "a",
                    year: 2019,
                    role: "year rep",
                }
            ])
            .expect(statusCodes.BAD_REQUEST)
            .then((res) => {
                check.api["v1"].isGenericResponse(statusCodes.BAD_REQUEST, res.body);
            });
        });

        test("a non authorized user making the request", function() {

            return request(app)
            .post("/api/v1/execs")
            .set("Content-Type", "application/json")
            .send([{
                name: "test Exec",
                email: "admin@socis.ca",
                order: 3,
                year: 2019,
                role: "system admin",
            }])
            .expect(statusCodes.UNAUTHORIZED)
            .then((res) => {
                check.api["v1"].isGenericResponse(statusCodes.UNAUTHORIZED, res.body);
            });
        });

        test("incorrect field type", function() {
            return request(app)
            .post("/api/v1/execs")
            .set("Content-Type", "application/json")
            .set("Authorization", `Bearer ${userToken}`)
            .send([
                {
                    name: "test Exec1",
                    email: "pres@191.168.3.3",  // this email should fail the validation
                    order: 2,
                    year: 2019,
                    role: "president",
                }])
            .expect(statusCodes.BAD_REQUEST)
            .then((res) => {
                check.api["v1"].isGenericResponse(statusCodes.BAD_REQUEST, res.body);
            });
        });

        test("extra fields should be ignored", function() {

            return request(app)
            .post("/api/v1/execs")
            .set("Content-Type", "application/json")
            .set("Authorization", `Bearer ${userToken}`)
            .send([
                {
                    name: "test Exec1",
                    email: "pres@socis.ca",
                    order: 2,
                    year: 2019,
                    role: "president",
                    id: "507f1f77bcf86cd799439011", //this is a extra field
                }])
            .expect(statusCodes.CREATED)
            .then((res) => {
                assert.isArray(res.body);
                assert.lengthOf(res.body, 1);
                check.api["v1"].isExecObject(res.body[0]);
                assert.notEqual(res.body[0].id, "507f1f77bcf86cd799439011");
            });
        });

        test("missing required fields", function() {
            return request(app)
            .post("/api/v1/execs")
            .set("Content-Type", "application/json")
            .set("Authorization", `Bearer ${userToken}`)
            .send([
                {
                    name: "test Exec1",
                    email: "pres@socis.ca",
                    order: 2,
                    year: 2019,
                }])
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

    suite("PATCH /api/v1/execs", function() {

    });

    suite("DELETE /api/v1/execs/:execId", function() {

    });
});