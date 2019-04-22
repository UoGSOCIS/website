/**
 * Authentication middleware functions for express routes.
 *
 * @author Marshall Asch <masch@uoguelph.ca>
 * @module middleware/routeauth
 */

"use strict";

var source = require("rfr");
const error = source("models/http-errors");

/**
 * routeAuth is an express middleware that checks a user is logged into the
 * application before allowing  access to protected routes.
 * @function
 * @param {express.Request}  req - the request object for any given route
 * @param {express.Response} res - the response object for any given route
 * @param {function} next        - express' callback to proceed to next req
 */
function routeAuth(req, res, next) {
    // check if current path requires pre-existing authentication (e.g. session)
    if (/^\/api\/.*/.test(req.path) === false && /^\/admin(\/.*)?/.test(req.path) === false) {
        return next();
    }

    if (!req.session || !req.session.token) {
        const err = error.Error.Unauthorized("You need to be authenticated");
        next(err);
        return;
    }

    next();
}

module.exports = routeAuth;
