/**
 * Authentication middleware functions for express routes.
 *
 * This module Must be called after the deserialize middleware which is responsible for pulling the user out of the
 * session or out of a Bearer token and adding it to the request object.
 *
 * @author Marshall Asch <masch@uoguelph.ca>
 * @module middleware/routeauth
 */

"use strict";

const source = require("rfr");
const Error = source("models/responses").Error;

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
    if (req.user) {

        if (checkAdminPermissions(req.user, req.path)) {
            next();
        } else {
            next(Error.Forbidden(`User ${req.user.name} is not authorized to access ${req.path}`));
        }
    } else {
        next(Error.Unauthorized("You need to be authenticated"));
    }
}

/**
 * This function will make sure that the user has valid permission to access the api or admin route
 * @param user the user object
 * @param path the path that the user is trying to request
 * @returns {boolean|*} true if permission is allowed false otherwise
 */
function checkAdminPermissions(user, path) {

    if (!user) {
        return false;
    }

    // the admin can do anything
    if (user.hasSuperAdminPermission()) {
        return true;
    }

    // check if the user has events permissions
    if (/^\/api\/v1\/events(\/.*)?/.test(path) === true || /^\/admin\/events(\/.*)?/.test(path) === true) {
        return user.hasEventPermission();
    }

    // check if the user has exec permissions
    if (/^\/api\/v1\/execs(\/.*)?/.test(path) === true || /^\/admin\/exec(\/.*)?/.test(path) === true) {
        return user.hasSuperAdminPermission();
    }

    // check if the user has newsletter permissions
    if (/^\/api\/v1\/newsletter(\/.*)?/.test(path) === true || /^\/admin\/newsletter(\/.*)?/.test(path) === true) {
        return user.hasNewsletterPermission();
    }

    // check if the user has can edit items in the store permissions
    if (/^\/api\/v1\/products(\/.*)?/.test(path) === true || /^\/admin\/products(\/.*)?/.test(path) === true) {
        return user.hasMerchantPermission();
    }

    // check if the user can see who has bought things and make sales
    if (/^\/admin\/store(\/.*)?/.test(path) === true) {
        return user.hasSellerPermission();
    }

    if (path === "/admin") {
        return user.hasAdminPermission();
    }

    return false;
}

module.exports = routeAuth;
