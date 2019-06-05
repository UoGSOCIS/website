/**
 * This file sets the roboticon-related route handlers for APIv1.
 *
 * @module router/api/v1
 */
"use strict";

const express = require("express");
const source = require("rfr");
const Challenge = source("models/roboticon");

const statusCodes = require("http-status-codes");
const logger = source("logger");

const errors = source("models/error");
const response = source("models/responses");
const Error = response.Error;
const requireHeaders = middleware.requireHeaders;

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
.post(requireHeaders([{
    key: "Content-Type",
    value: "application/json",
}]), function(req, res) {

    if (!validator.isInteger(req.body.year)) {
        return next(Error.BadRequest("Year is not an integer"));
    }
    if (!validator.isInteger(req.body.challenge_number)) {
        return next(Error.BadRequest("challenge number is not an integer"));
    }

    let challenge = new Challenge()
    .setYear(req.body.year)
    .setChallenge_number(req.body.challenge_number)
    .setDescription(req.body.description)
    .setGoal(req.body.goal)
    .setParameters(req.body.parameters)
    .setPoints(req.body.points)
    .setImage(req.body.image)
    .setMap(req.body.map);

    return challenge.save()
    .then((created) => {
        res.status(statusCodes.CREATED).json(created.toApiV1());
    })
    .catch((err) => {

        if (err instanceof errors.challenge.InvalidFormatError
            || err instanceof ValidationError) {
            return next(Error.BadRequest(err.message));
        }

        logger.error("Fatal error", err);
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
.patch(requireHeaders([{
    key: "Content-Type",
    value: "application/json",
}]), function(req, res) {

    const update = req.body;

    // validations
    if (!validator.isInteger(update.year, true)) {
        return next(Error.BadRequest(`year ${update.year} is not a valid year`));
    }
    if (!validator.isInteger(update.challenge_number, true)) {
        return next(Error.BadRequest(`challenge_number ${update.challenge_number} is not a valid challenge number`));
    }

    Challenge.getById(req.params.challengeId)
    .then((challenge) => {
        
        if(update.description) {
            challenge.setDescription(update.description);
        }

        if(update.goal) {
            challenge.setGoal(update.goal);
        }

        if(update.parameters) {
            challenge.setParameters(update.parameters);
        }

        if(update.points) {
            challenge.setPoints(update.points);
        }

        if(update.image) {
            challenge.setImage(update.image);
        }

        if(update.map) {
            challenge.setMap(update.map);
        }

        return challenge.save();
    })
    .then((challenge) => {

        res.status(statusCodes.OK).json(event.toApiV1());
    })
    .catch((err) => {

        if (err instanceof errors.event.NotFoundError) {
            return next(Error.NotFound(err.message));
        }

        if (err instanceof errors.event.InvalidFormatError
            || err instanceof ValidationError) {
            return next(Error.BadRequest(err.message));
        }

        logger.error("fatal error: ", err);
        next(err);
    });
   
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
