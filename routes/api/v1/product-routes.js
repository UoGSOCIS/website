/**
 * This file sets the product-related route handlers for APIv1.
 *
 * @module router/api/v1
 */
"use strict";

const express = require("express");

/**
 * r is the express Router that sets the product-related routes.
 */
const r = express.Router();

r.route("/")

/**
 * Create a new product for the store
 * @name create a new product
 * @route {POST} /api/v1/products
 * @authentication either a JWT token or an existing session.
 */
.post(function(req, res) {
    res.status(501).json({status: 501, message: "Not Implemented", });
});

r.route("/:productId([0-9a-fA-F]{24})")

/**
 * update a product
 * @name update a product
 * @route {PATCH} /api/v1/products/:productId
 * @authentication either a JWT token or an existing session.
 * @routeparams {string} :productId - this is a 24 character hex string of the store product
 */
.patch(function(req, res) {
    res.status(501).json({status: 501, message: "Not Implemented", });
})
/**
 * Delete a product from the store
 * @name delete a product
 * @route {DELETE} /api/v1/products/:productId
 * @authentication either a JWT token or an existing session.
 * @routeparams {string} :productId - this is a 24 character hex string of the store product
 */
.delete(function(req, res) {
    res.status(501).json({status: 501, message: "Not Implemented", });
});

module.exports = r;
