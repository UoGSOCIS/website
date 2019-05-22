/**
 * Mocha unit tests for APIv1 roboticon routes. Note that this file does not require
 * mocha. API tests facilitates by supertest.
 *
 * @file test/router/api/v1/roboticon-routes.js
 * @author Parth Miglani <pmiglani@uoguelph.ca>
 * @see module:router
 */
"use strict";

const source = require("rfr");

const request = require("supertest");
const chai = require("chai");
const asPromised = require("chai-as-promised");
const assert = chai.assert;

const app = source("server");
const logger = source("logger");

const statusCodes = require("http-status-codes");

const connection = source("test/connection");
const check = source("test/router/api/assert");

const authentication = source("authentication");
const config = source("config");


chai.use(asPromised);

