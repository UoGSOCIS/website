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

//const request = require("supertest");
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


        test("test1", function() {

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