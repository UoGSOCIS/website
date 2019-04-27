/**
 * This file sets the event-related route handlers for APIv1.
 *
 * @module router/api/v1
 */
"use strict";

const express = require("express");

/**
 * r is the express Router that sets the event-related routes.
 */
const r = express.Router();

r.route("/")

/**
 * Create a new event
 * @name create a new event
 * @route {POST} /api/v1/events
 * @authentication either a JWT token or an existing session.
 */
.post(function(req, res) {
    res.status(501).json({status: 501, message: "Not Implemented", });
});

r.route("/:eventId")

/**
 * update an event
 * @name update an event
 * @route {PATCH} /api/v1/events/:eventId
 * @authentication either a JWT token or an existing session.
 * @routeparams {string} :eventId - the id of the event object to update
 */
.patch(function(req, res) {
    res.status(501).json({status: 501, message: "Not Implemented", });
})
/**
 * Delete an event
 * @name delete an event
 * @route {DELETE} /api/v1/events/:eventId
 * @authentication either a JWT token or an existing session.
 * @routeparams {string} :eventId - the id of the event object to delete
 */
.delete(function(req, res) {
    res.status(501).json({status: 501, message: "Not Implemented", });
});

module.exports = r;
