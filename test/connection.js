/**
 * Provides a connection to MongoDB for testing.
 *
 * @file connection.js
 */
"use strict";

var source = require("rfr");
const mongoose = require("mongoose");

const config = source("config");

let mongoUri = "mongodb://" + config.database.host + "/" + config.database.db;
mongoose.connect(mongoUri, {
    user: config.database.user,
    pass: config.database.passwd,
    useNewUrlParser: true,
});

module.exports = mongoose.connection;
