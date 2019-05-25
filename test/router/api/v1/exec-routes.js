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

const authentication = source("authentication");
const config = source("config");


chai.use(asPromised);

suite("APIv1 exec routes", function() {

    let userToken;

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
            userToken = token;
        })
        .catch((err) => {
            logger.error("Error creating user test token", err);
        });
    });

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

        test("a valid exec object, wong content type", function() {
            return request(app)
            .post("/api/v1/execs")
            .set("Content-Type", "x-www-form-urlencoded")
            .set("Authorization", `Bearer ${userToken}`)
            .send("name=test user1")
            .send("email=user1@socis.ca")
            .send("order=2")
            .send("year=2019")
            .send("role=admin")
            .expect(statusCodes.BAD_REQUEST)
            .then((res) => {
                check.api["v1"].isGenericResponse(statusCodes.BAD_REQUEST, res.body);
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
            return pres1.save()
            .then((exec) => {
                pres1 = exec.toApiV1();
                return admin1.save();
            })
            .then((exec) => {
                admin1 = exec.toApiV1();
                return pres2.save();
            })
            .then((exec) => {
                pres2 = exec.toApiV1();
                return admin2.save();
            })
            .then((exec) => {
                admin2 = exec.toApiV1();
            })
            .catch((err) => {
                logger.error("Unexpected error", err);
            });

        });

        test("update a single exec that is not in a list", function() {

            let update1 = JSON.parse(JSON.stringify(pres1));

            update1.name = "The greatest president";
            return request(app)
            .patch("/api/v1/execs")
            .set("Content-Type", "application/json")
            .set("Authorization", `Bearer ${userToken}`)
            .send(update1)
            .expect(statusCodes.BAD_REQUEST)
            .then((res) => {
                check.api["v1"].isGenericResponse(statusCodes.BAD_REQUEST, res.body);
            });
        });

        test("update a single exec, wong content type", function() {
            return request(app)
            .patch("/api/v1/execs")
            .set("Content-Type", "x-www-form-urlencoded")
            .set("Authorization", `Bearer ${userToken}`)
            .send("id=5ccf449cd0c3a1ac66636b64")
            .send("name=test user1")
            .send("email=user1@socis.ca")
            .send("order=2")
            .send("year=2019")
            .send("role=admin")
            .expect(statusCodes.BAD_REQUEST)
            .then((res) => {
                check.api["v1"].isGenericResponse(statusCodes.BAD_REQUEST, res.body);
            });
        });

        test("update an exec that does not exist in the db, valid format", function() {
            let update1 = JSON.parse(JSON.stringify(pres1));

            update1.id = "5ccf449cd0c3a1ac66636b64";
            return request(app)
            .patch("/api/v1/execs")
            .set("Content-Type", "application/json")
            .set("Authorization", `Bearer ${userToken}`)
            .send([update1])
            .expect(statusCodes.NOT_FOUND)
            .then((res) => {
                check.api["v1"].isGenericResponse(statusCodes.NOT_FOUND, res.body);
            });
        });

        test("update an exec that does not exist in the db,invalid format", function() {
            let update1 = JSON.parse(JSON.stringify(pres1));

            update1.id = "execId";
            return request(app)
            .patch("/api/v1/execs")
            .set("Content-Type", "application/json")
            .set("Authorization", `Bearer ${userToken}`)
            .send([update1])
            .expect(statusCodes.BAD_REQUEST)
            .then((res) => {
                check.api["v1"].isGenericResponse(statusCodes.BAD_REQUEST, res.body);
            });
        });

        test("missing authentication", function() {

            let update1 = JSON.parse(JSON.stringify(pres1));

            update1.name = "The worst president";
            return request(app)
            .patch("/api/v1/execs")
            .set("Content-Type", "application/json")
            .send([update1])
            .expect(statusCodes.UNAUTHORIZED)
            .then((res) => {
                check.api["v1"].isGenericResponse(statusCodes.UNAUTHORIZED, res.body);
            });
        });

        test("not all the fields are set", function() {

            let update1 = {
                id: pres1.id,
                name: "mediocre president",
            };

            return request(app)
            .patch("/api/v1/execs")
            .set("Authorization", `Bearer ${userToken}`)
            .set("Content-Type", "application/json")
            .send([update1])
            .expect(statusCodes.OK)
            .then((res) => {

                assert.isArray(res.body);
                assert.lengthOf(res.body, 1);
                check.api["v1"].isExecObject(res.body[0]);
                assert.equal(res.body[0].id, pres1.id);
                assert.equal(res.body[0].email, pres1.email);
                assert.equal(res.body[0].name, update1.name);
                assert.equal(res.body[0].role, pres1.role);
                assert.equal(res.body[0].order, pres1.order);
                assert.equal(res.body[0].year, pres1.year);
            });
        });

        test("multiple updates, one set is valid the other is not", function() {

            let update1 = JSON.parse(JSON.stringify(admin1));
            let update2 = JSON.parse(JSON.stringify(admin2));

            update1.name = "The best system admin ever!";
            update2.email = "invalid@125.3.2.5";

            return request(app)
            .patch("/api/v1/execs")
            .set("Authorization", `Bearer ${userToken}`)
            .set("Content-Type", "application/json")
            .send([update1, update2])
            .expect(statusCodes.BAD_REQUEST)
            .then((res) => {
                check.api["v1"].isGenericResponse(statusCodes.BAD_REQUEST, res.body);

                return Exec.getById(admin1.id);
            })
            .then((execFromDb) => {
                assert.equal(execFromDb.id, admin1.id);
                assert.equal(execFromDb.email, admin1.email);
                assert.equal(execFromDb.name, admin1.name);
                assert.equal(execFromDb.role, admin1.role);
                assert.equal(execFromDb.order, admin1.order);
                assert.equal(execFromDb.year, admin1.year);

                return Exec.getById(admin2.id);
            })
            .then((execFromDb) => {

                assert.equal(execFromDb.id, admin2.id);
                assert.equal(execFromDb.email, admin2.email);
                assert.equal(execFromDb.name, admin2.name);
                assert.equal(execFromDb.role, admin2.role);
                assert.equal(execFromDb.order, admin2.order);
                assert.equal(execFromDb.year, admin2.year);
            })
            .catch(() => {
                assert.fail("Something went wrong");
            });
        });

        test("valid full set of changes", function() {

            let update1 = {
                id: pres2.id,
                name: "mediocre president",
                email: "el-presidente@socis.ca",
                order: 34,
                year: 2017,
                role: "President",
            };

            return request(app)
            .patch("/api/v1/execs")
            .set("Authorization", `Bearer ${userToken}`)
            .set("Content-Type", "application/json")
            .send([update1])
            .expect(statusCodes.OK)
            .then((res) => {
                assert.isArray(res.body);
                assert.lengthOf(res.body, 1);
                check.api["v1"].isExecObject(res.body[0]);
                assert.equal(res.body[0].id, pres2.id);
                assert.equal(res.body[0].email, update1.email);
                assert.equal(res.body[0].name, update1.name);
                assert.equal(res.body[0].role, update1.role);
                assert.equal(res.body[0].order, update1.order);
                assert.equal(res.body[0].year, update1.year);
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

    suite("DELETE /api/v1/execs/:execId", function() {

        var exec1;
        var exec2;

        suiteSetup(function() {
            exec1 = new Exec()
            .setEmail("pres@socis.ca")
            .setRole("president")
            .setName("Bob Marley")
            .setOrder(1)
            .setYear(2016);

            exec2 = new Exec()
            .setEmail("admin@socis.ca")
            .setRole("System Admin")
            .setName("John Smith")
            .setOrder(2)
            .setYear(2016);

            // save the execs to the db
            return exec1.save()
            .then((exec) => {
                exec1 = exec;
                return exec2.save();
            })
            .then((exec) => {
                exec2 = exec;
            })
            .catch((err) => {
                logger.error("Unexpected error", err);
            });

        });

        test("missing authentication", function() {

            return request(app)
            .delete(`/api/v1/execs/${exec1.id}`)
            .expect(statusCodes.UNAUTHORIZED)
            .then((res) => {
                check.api["v1"].isGenericResponse(statusCodes.UNAUTHORIZED, res.body);
            });
        });

        test("deleting non existent exec, correct id format", function() {
            return request(app)
            .delete("/api/v1/execs/5ccf7ab78caf96e09f00ab22")
            .set("Authorization", `Bearer ${userToken}`)
            .expect(statusCodes.NOT_FOUND)
            .then((res) => {
                check.api["v1"].isGenericResponse(statusCodes.NOT_FOUND, res.body);
            });
        });

        test("deleting non existent exec, bad id format", function() {
            return request(app)
            .delete("/api/v1/execs/execId")
            .set("Authorization", `Bearer ${userToken}`)
            .expect(statusCodes.NOT_FOUND)
            .then((res) => {
                check.api["v1"].isGenericResponse(statusCodes.NOT_FOUND, res.body);
            });
        });
        
        test("deleting an exec that has already been deleted", function () {
            return request(app)
            .delete(`/api/v1/execs/${exec2.id}`)
            .set("Authorization", `Bearer ${userToken}`)
            .expect(statusCodes.NO_CONTENT)
            .then(() => {

                // try deleting it again
                return request(app)
                .delete(`/api/v1/execs/${exec2.id}`)
                .set("Authorization", `Bearer ${userToken}`)
                .expect(statusCodes.NOT_FOUND)
                .then((res) => {
                    check.api["v1"].isGenericResponse(statusCodes.NOT_FOUND, res.body);
                });
            });
        });

        test("deleting a valid exec", function() {

            return request(app)
            .delete(`/api/v1/execs/${exec1.id}`)
            .set("Authorization", `Bearer ${userToken}`)
            .expect(statusCodes.NO_CONTENT);
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
});