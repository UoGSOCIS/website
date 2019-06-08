"use strict";


/**
 * NotFoundError describes an error where the user do not exist.
 * @property {string} message - the error message (default: "User does not exist")
 */
class NotFoundError extends Error {
    /**
     * NotFoundError constructor. Used to create a new user does not exist error.
     * @param {string} message - the error message
     */
    constructor(...args) {
        super(...args);
        this.name = "NotFoundError";
        if (!this.message) {
            this.message = "User does not exist";
        }
    }
}

/**
 * InvalidFormatError describes an error where the users object format is not valid.
 * @property {string} message - the error message (default: "Invalid format for User")
 */
class InvalidFormatError extends Error {
    /**
     * InvalidFormatError constructor.
     * @param {string} [message] - the error message
     */
    constructor(...args) {
        super(...args);
        this.name = "InvalidFormatError";
        if (!this.message) {
            this.message = "Invalid format for User";
        }
    }
}

/**
 * InvalidPermissionsError describes an error where the user does not have permission to do a task.
 * @property {string} message - the error message (default: "Invalid format for User")
 */
class InvalidPermissionsError extends Error {
    /**
     * InvalidPermissionsError constructor.
     * @param {string} [message] - the error message
     */
    constructor(...args) {
        super(...args);
        this.name = "InvalidPermissionsError";
        if (!this.message) {
            this.message = "Invalid permissions User";
        }
    }
}


module.exports = {
    NotFoundError,
    InvalidFormatError,
    InvalidPermissionsError,
};
