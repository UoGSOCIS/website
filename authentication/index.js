/**
 * This module is responsible for verifying the JWT signatures for authentication tokens.
 * This is so that the app does not depend on google tokens to allow for automatic testing.
 *
 * @author Marshall Asch <masch@uoguelph.ca>
 * @module authentication
 */


const jwt = require("./jwt.js");

module.exports = {
    sign: jwt.sign,
    verify: jwt.verify,
    verifyGoogle: jwt.verifyGoogle,
};