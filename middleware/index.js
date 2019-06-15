/**
 * Express middleware functions for the website.
 *
 * @module middleware
 */
"use strict";

const errorHandler = require("./errorhandler.js");
const requireHeaders = require("./requireheaders.js");
const routeAuth = require("./routeauth.js");
const deserialize =  require("./deserialize.js");

module.exports = {
    errorHandler: errorHandler,
    requireHeaders: requireHeaders,
    routeAuth: routeAuth,
    deserialize: deserialize,
};
