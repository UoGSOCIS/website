/**
 * Router for "/api/v1" subroutes.
 *
 * @module router/api/v1
 */
"use strict";

const express = require("express");

const events = require("./event-routes.js");
const exec = require("./exec-routes.js");
const roboticon = require("./roboticon-routes.js");
const products = require("./product-routes.js");

const router = express.Router();

router.use("/events", events);
router.use("/execs", exec);
router.use("/roboticon", roboticon);
router.use("/products", products);

module.exports = router;
