/**
 * This file sets the roboticon-related route handlers for APIv1.
 *
 * @module router/api/v1
 */
"use strict";

const express = require("express");

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
    res.status(501).json({status: 501, message: "Not Implemented", });
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
    res.status(501).json({status: 501, message: "Not Implemented", });
});

module.exports = r;
