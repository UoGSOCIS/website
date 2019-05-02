/**
 * Authentication middleware functions for express routes.
 *
 * @author Marshall Asch <masch@uoguelph.ca>
 * @module middleware/routeauth
 */

"use strict";

const source = require("rfr");
const error = source("models/http-errors");

const auth = require("google-auth-library");
const logger = source("logger");

const config = source("config");
const client = new auth.OAuth2Client(config.google.client_id);
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
        next(error.Error.Unauthorized("You need to be authenticated"));
        return;
    }

    client.verifyIdToken({
        idToken: token,
        audience: config.google.client_id,
    }).then((ticket) => {

        const payload = ticket.getPayload();
        const aud = payload["aud"];
        const domain = payload["hd"];

        if (aud !== config.google.client_id) {
            logger.error("The token is not for the correct audience");
            next(error.Error.Unauthorized("The token is not for the correct audience"));
            return;
        }

        // verify that the domain name was from the socis organization
        if (domain !== "socis.ca") {
            logger.error("The user is not a SOCIS email address. ");
            next(error.Error.Unauthorized("The user is not a SOCIS email address."));
            return;
        }

        // probably going to want to create our own user account data here
        req.session.token = payload;

        next();
    }).catch((err) => {
        logger.error("Something when horribly wrong: " + err);
        next(error.Error.InternalServerError(err.message));
    });
}

module.exports = routeAuth;
