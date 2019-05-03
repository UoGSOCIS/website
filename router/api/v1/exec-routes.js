/**
 * This file sets the exec-related route handlers for APIv1.
 *
 * @module router/api/v1
 */
"use strict";

const express = require("express");
const source = require("rfr");
const execs = source("models/exec");
const statusCodes = require("http-status-codes");

const response = source("models/responses");
const Error = response.Error;
const PagingObject = response.PagingObject;

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
.get(function(req, res, next) {

    let offset;
    let limit;
    let year;

    if (!req.query.offset) {
        offset = Offset.Default;
    } else if (req.query.offset < Offset.Min || isNaN(req.query.offset)) {
        //since the offset validation failed the API should return a bad request.
        return next(Error.BadRequest("Offset is invalid"));
    } else {
        offset = parseInt(req.query.offset);
    }

    if (!req.query.limit) {
        limit = Limit.Default;
    } else if (req.query.limit < Limit.Min || req.query.limit > Limit.Max || isNaN(req.query.limit)) {
        //Since the limit validation failed the API should return a bad request.
        return next(Error.BadRequest("Limit is invalid"));
    } else {
        limit = parseInt(req.query.limit);
    }

    if (!req.query.year) {
        const date = new Date();
        year = date.getFullYear() - (date.getMonth() < 4 ? 1 : 0);  // current -1 if it is Jan  - april else current
    } else {
        year = req.query.year;
    }

    let po = new PagingObject()
    .setHref(PagingObject.getCurrentUrl(req))
    .setOffset(offset)
    .setLimit(limit);

    execs.count(year)
    .then((count) => {
        po.setTotal(count)
        .setPrevious(PagingObject.getPreviousUrl(req, po.offset, po.limit))
        .setNext(PagingObject.getNextUrl(req, po.offset, po.limit, po.total));

        return execs.getExecForYear(year, {
            limit: limit,
            offset: offset,
        });
    })
    .then((execList) => {

        for (let exec of execList) {
            po.addItems(exec.toApiV1());
        }

        res.status(statusCodes.OK).json(po);
    })
    .catch((err) => {
        next(err);
    });
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
