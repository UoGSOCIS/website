/**
 * Package for API routers. Provides the routers for all subroutes of "/api".
 *
 * @module router/api
 */
"use strict";

const source = require("rfr");

const express = require("express");
const router = express.Router();

const v1 = require("./v1");
const error = source("models/http-errors");


router.use("/v1", v1);
router.use(function (req, res, next) {
    next(error.Error.NotFound());
});

module.exports = router;
