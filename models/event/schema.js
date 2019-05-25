"use strict";

const mongoose = require("mongoose");


/**
 * For the purposes of this the year is the current school year,
 * for the school year 2018/2019 the year would be 2018
 */
module.exports = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    start_time: {
        type: Date,
        required: true,
    },
    end_time: {
        type: Date,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    tags: {
        type: [String],
        required: false,
    },
});