/**
 * Express error object for the website.
 *
 * @module middleware
 */
"use strict";

const error = require("./error.js");
const pagingObject = require("./pagingObject.js");

module.exports = {
    Error: error.Error,
    PagingObject: pagingObject.PagingObject,

};
