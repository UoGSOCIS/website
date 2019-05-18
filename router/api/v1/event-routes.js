/**
 * This file sets the event-related route handlers for APIv1.
 *
 * @module router/api/v1
 */
"use strict";

const express = require("express");

const source = require("rfr");
const Event = source("models/event");
const statusCodes = require("http-status-codes");
const logger = source("logger");
const validator = require("validator");

const errors = source("models/error");
const response = source("models/responses");
const Error = response.Error;

const middleware = source("middleware");
const requireHeaders = middleware.requireHeaders;

const mongoose = require("mongoose");
const ValidationError = mongoose.Error.ValidationError;

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
.post(requireHeaders([{
    key: "Content-Type",
    value: "application/json",
}]), function(req, res, next) {

    if (typeof req.body.start_time !== "string" || !validator.isRFC3339(req.body.start_time)) {
        return next(Error.BadRequest("start_time is not a valid time string."));
    }

    if (typeof req.body.end_time !== "string" || !validator.isRFC3339(req.body.end_time)) {
        return next(Error.BadRequest("end_time is not a valid time string."));
    }

    let event = new Event()
    .setStartTime(req.body.start_time)
    .setEndTime(req.body.end_time)
    .setLocation(req.body.location)
    .setTitle(req.body.location)
    .setDescription(req.body.description)
    .setTags(req.body.tags);

    return event.save()
    .then((created) => {

        //TODO add in the call to add the event to google calender here

        res.status(statusCodes.CREATED).json(created);
    })
    .catch((err) => {

        if (err instanceof errors.event.InvalidFormatError
            || err instanceof ValidationError) {
            return next(Error.BadRequest(err.message));
        }

        logger.error("Fatal error", err);
        next(err);
    });


});

r.route("/:eventId([0-9a-fA-F]{24})")

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
.delete(function(req, res, next) {
    Event.getById(req.params.eventId)
    .then((event) => {

        return event.delete();
    })
    .then(() => {
        res.status(statusCodes.NO_CONTENT).send();
    })
    .catch((err) => {

        if (err instanceof errors.event.NotFoundError) {
            return next(Error.NotFound(err.message));
        }

        logger.error("fatal error: ", err);
        next(err);
    });
});

module.exports = r;
