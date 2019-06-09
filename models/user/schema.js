"use strict";

const mongoose = require("mongoose");


module.exports = new mongoose.Schema({
    accountId: {
        type: String,
        required: true,
        unique: true,
    },
    created_at: {
        type: Date,
        required: true,
        default: Date.now,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    permissions: {
        type: Number,
        default: 0,
        min: 0,
    },
});