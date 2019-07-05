/**
 * Mocha unit tests for APIv1 roboticon routes. Note that this file does not require
 * mocha. API tests facilitates by supertest.
 *
 * @file test/router/api/v1/roboticon-routes.js
 * @author Parth Miglani <pmiglani@uoguelph.ca>
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
const Rob = source("models/roboticon");

const statusCodes = require("http-status-codes");

const connection = source("test/connection");
const check = source("test/router/api/assert");

const authentication = source("authentication");
const config = source("config");


chai.use(asPromised);

suite("APIv1 roboticon routes", function() {

    let validToken;

    suiteSetup(function() {

        const newUser = new users.User()
        .setAccountId("435678uhgr4567ui")
        .setName("Test User")
        .setEmail("roboticonUser@example.com")
        .setPermissions(users.Permission.ADMIN);

        return newUser.save()
        .then((saved) => {
            return authentication.sign(saved.toApiV1());
        })
        .then((token) => {
            validToken = token;
        })
        .catch((err) => {
            logger.error("Error creating user test token", err);
        });

    });

    suite("POST api/v1/roboticon", function() {

        test("Valid challenge wrong content type", function() {
            return request(app)
            .post("/api/v1/roboticon")
            .set("Content-Type", "x-www-form-urlencoded")
            .set("Authorization", `Bearer ${userToken}`)
            .send("year=2019")
            .send("challenge_number=1")
            .send("hidden=false")
            .send("description=This is a bit of information about the first challenge.")
            .send("goal=- To drive the robot to the other side\n- To win it all!!")
            .send("parameters=- Arena will be 3', by 12'\n- If the robot crosses the black border line then the run will end")
            .send("points=- 2 points for making it to the end zone.\n- Every checkpoint line the robot passes will gain 1 point.")
            .send("image=https://socis.ca/files/15EA71AB4F5D6308A3F810DDB5B50D75513E6857")
            .send("map=https://socis.ca/files/CB0848CBC4426AA79D71709D62E0EDAB554B4E21")
            .expect(statusCodes.BAD_REQUEST)
            .then((res) => {
                check.api["v1"].isGenericResponse(statusCodes.BAD_REQUEST, res.body);
            });
        });

        test("Valid challenge with correct content type", function() {
            return request(app)
            .post("/api/v1/roboticon")
            .set("Content-Type", "application/json")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                id: "507f1f77bcf86cd799439011",
                year: 2019,
                challenge_number: 1,
                hidden: false,
                description: "This is a bit of information about the first challenge.",
                goal: "- To drive the robot to the other side\n- To win it all!!",
                parameters: "- Arena will be 3', by 12'\n- If the robot crosses the black border line then the run will end",
                points: "- 2 points for making it to the end zone.\n- Every checkpoint line the robot passes will gain 1 point.",
                image: "https://socis.ca/files/15EA71AB4F5D6308A3F810DDB5B50D75513E6857",
                map: "https://socis.ca/files/CB0848CBC4426AA79D71709D62E0EDAB554B4E21"
            })
            .expect(statusCodes.CREATED)
            .then((res) => {
                check.api["v1"].isChallenge(res.body);
            });
        });

        test("A valid object no authorization token", function() {
            return request(app)
            .post("/api/v1/roboticon")
            .set("Content-Type", "application/json")
            .send({
                id: "507f1f77bcf86cd799439011",
                year: 2019,
                challenge_number: 1,
                hidden: false,
                description: "This is a bit of information about the first challenge.",
                goal: "- To drive the robot to the other side\n- To win it all!!",
                parameters: "- Arena will be 3', by 12'\n- If the robot crosses the black border line then the run will end",
                points: "- 2 points for making it to the end zone.\n- Every checkpoint line the robot passes will gain 1 point.",
                image: "https://socis.ca/files/15EA71AB4F5D6308A3F810DDB5B50D75513E6857",
                map: "https://socis.ca/files/CB0848CBC4426AA79D71709D62E0EDAB554B4E21"
            })
            .expect(statusCodes.UNAUTHORIZED)
            .then((res) => {
                check.api["v1"].isGenericResponse(statusCodes.UNAUTHORIZED, res.body);
            });
        });

        test("Extra fields should be ignored", function() {
            return request(app)
            .post("/api/v1/roboticon")
            .set("Content-Type", "application/json")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                id: "507f1f77bcf86cd799439011",
                year: 2019,
                challenge_number: 1,
                hidden: false,
                description: "This is a bit of information about the first challenge.",
                goal: "- To drive the robot to the other side\n- To win it all!!",
                parameters: "- Arena will be 3', by 12'\n- If the robot crosses the black border line then the run will end",
                points: "- 2 points for making it to the end zone.\n- Every checkpoint line the robot passes will gain 1 point.",
                image: "https://socis.ca/files/15EA71AB4F5D6308A3F810DDB5B50D75513E6857",
                map: "https://socis.ca/files/CB0848CBC4426AA79D71709D62E0EDAB554B4E21"
            })
            .expect(statusCodes.CREATED)
            .then((res) => {

                check.api["v1"].isChallenge(res.body);
                assert.notEqual(res.body.id, "5ce07aba7d20c5c791d35826");
            });
        });

        test("Missing required fields", function() {
            return request(app)
            .post("/api/v1/roboticon")
            .set("Content-Type", "application/json")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                year: 2019,
                challenge_number: 1,
                hidden: false,
                description: "This is a bit of information about the first challenge.",
                goal: "- To drive the robot to the other side\n- To win it all!!",
                parameters: "- Arena will be 3', by 12'\n- If the robot crosses the black border line then the run will end",
                points: "- 2 points for making it to the end zone.\n- Every checkpoint line the robot passes will gain 1 point.",
                image: "https://socis.ca/files/15EA71AB4F5D6308A3F810DDB5B50D75513E6857",
                map: "https://socis.ca/files/CB0848CBC4426AA79D71709D62E0EDAB554B4E21"
            })
            .expect(statusCodes.BAD_REQUEST)
            .then((res) => {
                check.api["v1"].isGenericResponse(statusCodes.BAD_REQUEST, res.body);
            });
        });

        //clear the challenges db
        suiteTeardown(function() {
            return new Promise((resolve, reject) => {

                return connection.db.dropCollection("challenge", (err, result) => {

                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
        });
    });

    suite("PATCH api/v1/roboticon/:year/:challengeNum", function() {

        var chal1;
        var chal2;
        var chal3;
        var chal4;

        suiteSetup(function() {

            chal1 = new Rob()
            .setYear("2019")
            .setChallenge_number("1")
            .setDescription("A very good description")
            .setGoal("A grand goal")
            .setParameters("- A few parameters \n - Another one")
            .setPoints("- 2 points for gryffindor.\n - 0 to slytherin");
            //.setImage("")
            //.setMap("")

            chal2 = new Rob()
            .setYear("2020")
            .setChallenge_number("4")
            .setDescription("Another good description")
            .setGoal("Another grand goal")
            .setParameters("- More parameters \n - And another one")
            .setPoints("- Another one for gryffindor.\n - Nothing to slytherin");

            chal3 = new Rob()
            .setYear("2021")
            .setChallenge_number("7")
            .setDescription("Good descriptions cont.")
            .setGoal("Grand goals cont.")
            .setParameters("- Another parameter \n - Parameters don't end")
            .setPoints("- 5 points for apple\n - 0 to samsung");

            chal4 = new Rob()
            .setYear("2021")
            .setChallenge_number("8")
            .setDescription("Last good description")
            .setGoal("Last grand goal")
            .setParameters("- Last few parameters \n - Last one")
            .setPoints("- 5 points for comp.\n - Nothing to engg");

            // save the challenge to the db
            chal1.save()
            .then((challenge) => {
                chal1 = challenge;
                return chal2.save();
            })
            .then((challenge) => {
                chal2 = challenge;
                return chal3.save();
            })
            .then((challenge) => {
                chal3 = challenge;
                return chal4.save();
            })
            .then((challenge) => {
                chal4 = challenge;
            })
            .catch((err) => {
                logger.error("Unexpected error", err);
            });
        });

        test("Valid event wrong content type", function() {

            return request(app)
            .patch(`/api/v1/roboticon/${chal1.id}`)
            .set("Content-Type", "x-www-form-urlencoded")
            .set("Authorization", `Bearer ${validToken}`)
            .send("description=This description should not be changed")
            .expect(statusCodes.BAD_REQUEST)
            .then((res) => {
                check.api["v1"].isGenericResponse(statusCodes.BAD_REQUEST, res.body);
            });
        });

        test("update a challenge that does not exist in the db", function() {

            return request(app)
            .patch("/api/v1/roboticon/5ce087e883c678fd2d3d034a")
            .set("Content-Type", "application/json")
            .set("Authorization", `Bearer ${validToken}`)
            .send({description: "this also wont get updated", })
            .expect(statusCodes.NOT_FOUND)
            .then((res) => {
                check.api["v1"].isGenericResponse(statusCodes.NOT_FOUND, res.body);
            });
        });

        test("Missing authentication", function() {

            return request(app)
            .patch(`/api/v1/roboticon/${chal1.id}`)
            .set("Content-Type", "application/json")
            .send({description: "this also wont get updated because of bad auth", })
            .expect(statusCodes.UNAUTHORIZED)
            .then((res) => {
                check.api["v1"].isGenericResponse(statusCodes.UNAUTHORIZED, res.body);
            });
        });

        test("Not all fields are set", function() {

            let update1 = {
                description: "this should be set",
                goal: "achievable goal",
            };

            return request(app)
            .patch(`/api/v1/roboticon/${chal2.id}`)
            .set("Authorization", `Bearer ${validToken}`)
            .set("Content-Type", "application/json")
            .send(update1)
            .expect(statusCodes.OK)
            .then((res) => {

                check.api["v1"].isChallenge(res.body);
                assert.equal(res.body.id, chal2.id);
                assert.equal(res.body.year, chal2.year.toISOString());
                assert.equal(res.body.challenge_number, chal2.challenge_number.toISOString());
                assert.equal(res.body.description, update1.description);
                assert.equal(res.body.goal, chal2.goal);
            });

        });

        test("Valid full set of changes", function() {

            let update1 = {
                year: 2019,
                challenge_number: 1,
                hidden: false,
                description: "This is a bit of information about the first challenge.",
                goal: "- To drive the robot to the other side\n- To win it all!!",
                parameters: "- Arena will be 3', by 12'\n- If the robot crosses the black border line then the run will end",
                points: "- 2 points for making it to the end zone.\n- Every checkpoint line the robot passes will gain 1 point.",
                image: "https://socis.ca/files/15EA71AB4F5D6308A3F810DDB5B50D75513E6857",
                map: "https://socis.ca/files/CB0848CBC4426AA79D71709D62E0EDAB554B4E21"
            };

            return request(app)
            .patch(`/api/v1/roboticon/${chal4.id}`)
            .set("Authorization", `Bearer ${validToken}`)
            .set("Content-Type", "application/json")
            .send(update1)
            .expect(statusCodes.OK)
            .then((res) => {

                check.api["v1"].isChallenge(res.body);
                assert.equal(res.body.id, chal4.id);
                assert.equal(res.body.year, update1.year);
                assert.equal(res.body.challenge_number, update1.challenge_number);
                assert.equal(res.body.goal, update1.goal);
                assert.equal(res.body.description, update1.description);
                assert.equal(res.body.parameters, update1.parameters);
                assert.equal(res.body.points, update1.points);
                //assert.equal ?? image / map ??
            });
        });

        // clear the challenges DB
        suiteTeardown(function() {
            return new Promise((resolve, reject) => {

                return connection.db.dropCollection("challenge", (err, result) => {

                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
        });
    });

    suite("DELETE /api/v1/roboticon/:year/:challengeNum", function() {

        var chal1;
        var chal2;
        var chal3;

        suiteSetup(function() {

            chal1 = new Rob()
            .setYear("2019")
            .setChallenge_number("1")
            .setDescription("A very good description")
            .setGoal("A grand goal")
            .setParameters("- A few parameters \n - Another one")
            .setPoints("- 2 points for gryffindor.\n - 0 to slytherin");
            //.setImage("")
            //.setMap("")  

            chal2 = new Rob()
            .setYear("2020")
            .setChallenge_number("4")
            .setDescription("Another good description")
            .setGoal("Another grand goal")
            .setParameters("- More parameters \n - And another one")
            .setPoints("- Another one for gryffindor.\n - Nothing to slytherin");

            chal3 = new Rob()
            .setYear("2021")
            .setChallenge_number("7")
            .setDescription("Good descriptions cont.")
            .setGoal("Grand goals cont.")
            .setParameters("- Another parameter \n - Parameters don't end")
            .setPoints("- 5 points for apple\n - 0 to samsung");

             // save the challenges to the db
             chal1.save()
            .then((challenge) => {
                chal1 = challenge;
                return chal2.save();
            })
            .then((challenge) => {
                chal2 = challenge;
                return chal3.save();
            })
            .then((challenge) => {
                chal3 = challenge;
            })
            .catch((err) => {
                logger.error("Unexpected error", err);
            });
        });

        test("Missing authentication", function() {

            return request(app)
            .delete(`/api/v1/roboticon/${chal1.id}`)
            .expect(statusCodes.UNAUTHORIZED)
            .then((res) => {
                check.api["v1"].isGenericResponse(statusCodes.UNAUTHORIZED, res.body);
            });

        });

        test("deleting non existent challnege Id, valid format id", function() {
            return request(app)
            .delete("/api/v1/roboticon/5ce07f989c3aabe99abf309e")
            .set("Authorization", `Bearer ${validToken}`)
            .expect(statusCodes.NOT_FOUND)
            .then((res) => {
                check.api["v1"].isGenericResponse(statusCodes.NOT_FOUND, res.body);
            });
        });

        test("deleting non existent challenge Id, invalid format id", function() {
            return request(app)
            .delete("/api/v1/roboticon/badChallengeId")
            .set("Authorization", `Bearer ${validToken}`)
            .expect(statusCodes.NOT_FOUND)
            .then((res) => {
                check.api["v1"].isGenericResponse(statusCodes.NOT_FOUND, res.body);
            });
        });

        test("deleting a challenge that has already been deleted", function () {
            return request(app)
            .delete(`/api/v1/roboticon/${chal2.id}`)
            .set("Authorization", `Bearer ${validToken}`)
            .expect(statusCodes.NO_CONTENT)
            .then(() => {

                // try deleting it again
                return request(app)
                .delete(`/api/v1/roboticon/${chal2.id}`)
                .set("Authorization", `Bearer ${validToken}`)
                .expect(statusCodes.NOT_FOUND)
                .then((res) => {
                    check.api["v1"].isGenericResponse(statusCodes.NOT_FOUND, res.body);
                });
            });
        });

        test("deleting a valid event", function() {

            return request(app)
            .delete(`/api/v1/roboticon/${chal3.id}`)
            .set("Authorization", `Bearer ${validToken}`)
            .expect(statusCodes.NO_CONTENT);
        });

        // clear the challenges DB
        suiteTeardown(function() {
            return new Promise((resolve, reject) => {

                return connection.db.dropCollection("challenge", (err, result) => {

                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
        });
    });

    //clear the users DB
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
