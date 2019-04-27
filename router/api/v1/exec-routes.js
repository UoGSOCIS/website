/**
 * This file sets the exec-related route handlers for APIv1.
 *
 * @module router/api/v1
 */
"use strict";

const express = require("express");

/**
 * r is the express Router that sets the exec-related routes.
 */
const r = express.Router();

r.route("/")
/**
 * Retrieve a paged list of execs
 * @name get exec list
 * @route {GET} /api/v1/execs
 * @authentication none
 */
.get(function(req, res) {
    res.status(501).json({status: 501, message: "Not Implemented", });
})

/**
 * Create a new cohort of execs
 * @name create new exec
 * @route {POST} /api/v1/execs
 * @authentication either a JWT token or an existing session.
 */
.post(function(req, res) {
    res.status(501).json({status: 501, message: "Not Implemented", });
})

/**
 * update a list of execs
 * @name update execs
 * @route {PATCH} /api/v1/execs
 * @authentication either a JWT token or an existing session.
 */
.patch(function(req, res) {
    res.status(501).json({status: 501, message: "Not Implemented", });
});

r.route("/:execId")
/**
 * Delete an exec
 * @name delete exec
 * @route {DELETE} /api/v1/execs/:execId
 * @authentication either a JWT token or an existing session.
 * @routeparams {string} :execId - the id of the exec object to delete
 */
.delete(function(req, res) {
    res.status(501).json({status: 501, message: "Not Implemented", });
});

module.exports = r;
