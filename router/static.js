/**
 * This file sets the static file route handlers.
 *
 * @author Marshall Asch <masch@uoguelph.ca>
 * @module router
 */
"use-strict";

var source = require("rfr");
const express = require("express");
const path = require("path");

const config = source("config");
const logger = source("logger");


/**
 * r is the express Router that sets the routes for static resources.
 */
const r = express.Router();

r.use(express.static(path.join(config.__projectdir, "/public/")));
r.use("/js", express.static(path.join(config.__projectdir, "/public/js/")));
r.use("/css", express.static(path.join(config.__projectdir, "/public/css/")));
r.use("/img", express.static(path.join(config.__projectdir, "/public/img/")));
r.use("/docs", express.static(path.join(config.__projectdir, "/public/docs/")));

logger.info("Added static resource paths");


module.exports = r;