"use strict";

const mongoose = require("mongoose");


/**
 * For the purposes of this the year is the current school year,
 * for the school year 2018/2019 the year would be 2018
 */
module.exports = new mongoose.Schema({
    order: {
        type: Number,
        default: 0,
    },
    name: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    year: {
        type: Number,
        required: true,
        default: new Date().getFullYear(),
    },
});