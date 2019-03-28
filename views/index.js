/**
 * Views module. This module defines the view engine, helper functions, and
 * houses the HTML templates used throughout the application.
 *
 * @author Keefer Rourke <krourke@uoguelph.ca>
 * @module views
 */
"use strict";

const fs = require("fs");
const path = require("path");
const expresshbs = require("express-handlebars");
const handlebars = require("handlebars");

const source = require("rfr");
const config = source("config");

const renderer = expresshbs.create({
    // see http://handlebarsjs.com/expressions.html#helpers
    defaultLayout: "main",
    extname: ".hbs",
});


module.exports = {
    /**
     * engine is an instance of an express-handlebars view engine, with custom
     * template helper functions.
     */
    engine: renderer.engine,
    /**
     * templateParts is an object of partial templates which can be used to
     * render the view.
     */
};
