"use strict";

const mongoose = require("mongoose");


/**
 * For the purposes of this the year is the current school year,
 * for the school year 2018/2019 the year would be 2018
 */
module.exports = new mongoose.Schema({
    description: {
        type: String,
        required: true,
    },
    imagePath: {
        type: String,
    },
    goal: {
        type: String,
        required: true,
    },
    parameters: {
        type: String,
        required: true,
    },
    points: {
        type: String,
        required: true,
    },
    mapPath: {
        type: String,
    },
    challengeNumber: {
        type: Number,
        required: true,
    },
    hidden: {
        type: Boolean,
        default: false,
    },
    year: {
        type: Number,
        required: true,
        default: new Date().getFullYear(),
    },
});