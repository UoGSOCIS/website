/**
 * Error handling middleware. Should be the *last* middleware added to the
 * server.
 *
 * @module middleware/errorhandler
 */
"use strict";

var source = require("rfr");
const error = source("models/http-errors");

/**
 * errorHandler is an express middleware that ends the middleware chain and
 * displays unrecoverable errors. It is generally called via `next(err)` in
 * other middlewares.
 *
 * MUST be loaded into the middleware chain *last*.
 *
 * @function
 * @param {Object}           err - the error to handle
 * @param {express.Request}  req - the request object for any given route
 * @param {express.Response} res - the response object for any given route
 * @param {function} next        - express' callback to proceed to next req
 */
// eslint-disable-next-line no-unused-vars
function errorHandler (err, req, res, next) {
    // Handle parsing errors in malformed JSON as Bad Requests.
    if (err instanceof SyntaxError) {
        err = error.Error.BadRequest("Bad JSON format");
    }

    // All errors not returned by our application will be treated as
    // Server Errors by default. If a new error is uncovered which should *not*
    // be a 500 Server Error, then add a case above where the error is cast to
    // a http.Response as is done with SyntaxError.
    if (err && !(err instanceof error.Error)) {
        err = error.Error.InternalServerError();
    }

    // If there was an error, then render an error page.
    if (err) {
        var segments = req.path.split("/").filter((segment) => {
            return segment !== "";
        });

        // redirect if it is not on the API router
        if (segments[0] === "api") {
            res.status(err.status).json(err);
        } else if (err.status === 401) {
            res.redirect("/");
        } else {
            res.render("error", {whiteBackground: true, status: err.status, message: err.message, });

        }
    }
}


module.exports = errorHandler;
