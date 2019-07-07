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
const validator = source("validator");

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

    if (!validator.isRFC3339(req.body.start_time)) {
        return next(Error.BadRequest("start_time is not a valid time string."));
    }

    if (!validator.isRFC3339(req.body.end_time)) {
        return next(Error.BadRequest("end_time is not a valid time string."));
    }

    let event = new Event()
    .setStartTime(req.body.start_time)
    .setEndTime(req.body.end_time)
    .setLocation(req.body.location)
    .setTitle(req.body.title)
    .setDescription(req.body.description)
    .setTags(req.body.tags);

    return event.save()
    .then((created) => {

        //TODO add in the call to add the event to google calender here

        res.status(statusCodes.CREATED).json(created.toApiV1());
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
.patch(requireHeaders([{
    key: "Content-Type",
    value: "application/json",
}]), function(req, res, next) {

    const update = req.body;

    // validate that the time is either a valid date string or is not set
    if (!validator.isRFC3339(update.start_time, true)) {
        return next(Error.BadRequest(`start_time ${update.start_time} is not a valid date`));
    }

    if (!validator.isRFC3339(update.end_time, true)) {
        return next(Error.BadRequest(`end_time ${update.end_time} is not a valid date`));
    }

    Event.getById(req.params.eventId)
    .then((event) => {

        if (update.start_time) {
            event.setStartTime(update.start_time);
        }

        if (update.end_time) {
            event.setEndTime(update.end_time);
        }

        if (update.title) {
            event.setTitle(update.title);
        }

        if (update.description) {
            event.setDescription(update.description);
        }

        if (update.location) {
            event.setLocation(update.location);
        }

        if (update.tags) {
            event.setTags(update.tags);
        }

        return event.save();
    })
    .then((event) => {

        //TODO should also update the event in the google calender here

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

        //TODO should also delete the event from the google calender here

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
