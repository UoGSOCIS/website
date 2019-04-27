/**
 * Router middleware. This module defines all routes for the socis web application.
 *
 * @author Marshall Asch <masch@uoguelph.ca>
 * @module router
 */
"use-strict";

const source = require("rfr");
const express = require("express");

const staticPaths = require("./static.js");
const uiRoutes = require("./ui-routes.js");
const apiRoutes = source("router/api");

const error = source("models/http-errors");


/* Add all routes to the router middleware, which will be exported by this
 * module. Routes should be added via
 *
 *     router.get("/endpoint", function(req, res, next) {});
 *     router.post("/endpoint", function(req, res, next) {});
 *     router.put("/endpoint", function(req, res, next) {});
 *     router.deleter("/endpoint", function(req, res, next) {});
 *
 * etc, as long as the method makes sense semantically.
 */
/**
 * router is an express.Router() middleware stack which contains all the
 * web-facing server endpoints and logic.
 */
let router = express.Router();

/* add static resource paths */
router.use(staticPaths);

/* add API routes */
router.use("/api", apiRoutes);

/* add routes that render a web page */
router.use(uiRoutes);

router.use(function (req, res, next) {
    next(error.Error.NotFound());
});


// export the router with its paths and endpoints set
module.exports = router;
