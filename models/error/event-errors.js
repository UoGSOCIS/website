"use strict";


/**
 * NotFoundError describes an error where the event do not exist.
 * @property {string} message - the error message (default: "Event does not exist")
 */
class NotFoundError extends Error {
    /**
     * NotFoundError constructor. Used to create a new event does not exist error.
     * @param {string} message - the error message
     */
    constructor(...args) {
        super(...args);
        this.name = "NotFoundError";
        if (!this.message) {
            this.message = "Event does not exist";
        }
    }
}

class InvalidFormatError extends Error {
    /**
     * InvalidFormatError constructor.
     * @param {string} [message] - the error message
     */
    constructor(...args) {
        super(...args);
        this.name = "InvalidFormatError";
        if (!this.message) {
            this.message = "Invalid format for Event";
        }
    }
}


module.exports = {
    NotFoundError,
    InvalidFormatError,
};
