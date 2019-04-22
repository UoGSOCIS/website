/**
 * Express error object for the website.
 *
 * @module middleware
 */
"use strict";

const error = require("./error.js");

module.exports = {
    Error: error.Error,
};
