/**
 * Authentication middleware functions for express routes.
 *
 * @author Marshall Asch <masch@uoguelph.ca>
 * @module middleware/routeauth
 */

"use strict";

const source = require("rfr");
const Error = source("models/responses").Error;

const authentication = source("authentication");

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

    // can GET api routes without auth
    if (/^\/api\/.*/.test(req.path) === true && req.method === "GET") {
        return next();
    }

    // pass through if the user has a session
    if (req.session && req.session.token) {
        next();
        return;
    }

    // try checking for a bearer token
    var token = req.get("authorization");
    if (token) {
        token = token.substring(7);
    } else {
        return next(Error.Unauthorized("You need to be authenticated"));
    }

    authentication.verify(token)
    .then((decoded) => {
        req.session.token = decoded;

        next();
    })
    .catch((err) => {
        next(Error.Unauthorized(err.message));
    });
}

module.exports = routeAuth;
