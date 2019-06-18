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

        test("Missing reruired fields", function() {
            
        })
    });
});
