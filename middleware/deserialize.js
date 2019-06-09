/**
 * This middleware is responsible for deserializing the user object from the session or from the authentication token
 * and adding it to the request.
 *
 * @author Marshall Asch <masch@uoguelph.ca>
 * @module middleware/deserialize
 */
"use strict";

const source = require("rfr");
const users = source("models/user");
const logger = source("logger");
const authentication = source("authentication");


const deserialize = function (req, res, next) {

    if (req.session && req.session.user) {

        users.User.getByAccountId(req.session.user.id)
        .then((user) => {
            req.user = user;
            next();
        }).catch((err) => {
            logger.error(err);
            next();
        });
    } else {

        // try checking for a bearer token
        var token = req.get("authorization");
        if (token) {
            token = token.substring(7);
        } else {
            return next();
        }

        return authentication.verify(token)
        .then((decoded) => {
            return users.User.getByAccountId(decoded.id);
        })
        .then((user) => {
            req.user = user;
            next();
        })
        .catch((err) => {
            logger.error(err);
            next(err);
        });
    }
};


module.exports = deserialize;
