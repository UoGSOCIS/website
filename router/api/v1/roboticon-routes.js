/**
 * This file sets the roboticon-related route handlers for APIv1.
 *
 * @module router/api/v1
 */
"use strict";

const express = require("express");
const source = require("rfr");
const Rob = source("models/roboticon");

const statusCodes = require("http-status-codes");
const logger = source("logger");

const errors = source("models/error");
const response = source("models/responses");
const Error = response.Error;
const PagingObject = response.PagingObject;

const mongoose = require("mongoose");
const ValidationError = mongoose.Error.ValidationError;

/**
 * Offset is an enum defining the ranges for the offset query parameter (Min and Default).
 * @enum {number}
 * @readonly
 */
const Offset = {
    /**
     * Min - The lowest value you can set the offset to
     */
    Min: 0,

    /**
     * Default - The default value if the offset is not set
     */
    Default: 0,
};
Object.freeze(Offset);

/**
 * Limit is an enum defining the ranges for the limit query parameter (Min, Max, and Default).
 * @enum {number}
 * @readonly
 */
const Limit = {
    /**
     * Min - The lowest value you can set the limit to
     */
    Min: 1,

    /**
     * Max - The highest value you can set the limit to
     */
    Max: 50,

    /**
     * Default - The default value if the limit is not set
     */
    Default: 20,
};
Object.freeze(Limit);


/**
 * r is the express Router that sets the roboticon-related routes.
 */
const r = express.Router();

r.route("/")

/**
 * Create a new roboticon challenge
 * @name create a new challenge
 * @route {POST} /api/v1/roboticon
 * @authentication either a JWT token or an existing session.
 */
.post(function(req, res) {

    // if the body is not an array, send bad request
    if (!Array.isArray(req.body)) {
        return next(Error.BadRequest("The request is not an array"));
    }

    let robToSave = [];

    req.body.forEach((reqRob) => {

        const robot = new Rob()
        .setChallenge(reqRob.challenge)

        robToSave.push(robot);

    });

    // validate the challenge
    let validations = [];
    robToSave.forEach((robot) => {
        validations.push(Rob.isValid(robot));
    });

    Promise.all(validations)
    .then((robots) => {
        // if the challenge passes validation save it
        let promises = [];

        robots.forEach((robot) => {
            promises.push(robot.save());
        });

        return Promise.all(promises);
    })
    .then((robots) => {

        let created = [];
        robots.forEach((robot) => {
            created.push(robot.toApiV1());
        });

        res.status(statusCodes.CREATED).json(created);
    })
    .catch((err) => {

        if (err instanceof errors.robot.InvalidFormatError
        || err instanceof ValidationError) {
            return next(Error.BadRequest(err.message));
        }

        next(err);
    });
});

r.route("/:year([0-9]{4})/:challengeNum([0-9]+)")

/**
 * update a challenge
 * @name update a roboticon challenge
 * @route {PATCH} /api/v1/roboticon/:year/:challengeNum
 * @authentication either a JWT token or an existing session.
 * @routeparams {number} :year - the year of the roboticon challenge, must be a 4 digit year
 * @routeparams {number} :challengeNum - the challenge number for that year, must be a number
 */
.patch(function(req, res) {
    res.status(501).json({status: 501, message: "Not Implemented", });
})

/**
 * Delete a challenge
 * @name delete a challenge
 * @route {DELETE} /api/v1/roboticon/:year/:challengeNum
 * @authentication either a JWT token or an existing session.
 * @routeparams {number} :year - the year of the roboticon challenge, must be a 4 digit year
 * @routeparams {number} :challengeNum - the challenge number for that year, must be a number
 */
.delete(function(req, res) {
    res.status(501).json({status: 501, message: "Not implemented", });
});

module.exports = r;
