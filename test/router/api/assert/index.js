/**
 * Custom assertion statements for unit tests.
 * @author Marshall Asch <masch@uoguelph.ca>
 * @module test/router/api/assert
 */
"use strict";

const api = {};
api.v1 = require("./apiv1.js");

module.exports = {
    /**
     * api contains assertions on objects for each version of the API.
     * @property {Object} v1 - assertions for APIv1 objects
     *                         see module:test/router/api/assert/v1
     */
    api: api,
};
