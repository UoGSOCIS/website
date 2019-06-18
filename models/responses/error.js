const statusCodes = require("http-status-codes");


class Error {
    /**
     * Error constructor. Creates a new Error.
     * @param {number} status - the HTTP status of the response
     * @param {string} [message] - the message associated with the response
     */
    constructor(status, message) {
        this._status = status;

        // this will throw an exception if it is not a valid status code
        this._message = statusCodes.getStatusText(status);

        if (message) {
            this._message = message;
        }
    }

    get status() {
        return this._status;
    }

    get message() {
        return this._message;
    }

    set message(msg) {
        this._message = msg;
    }

    set status(status) {
        this._status = status;
    }

    toJSON() {
        return {
            status: this.status,
            message: this.message,
        };
    }

    static NotFound(message) {
        return new Error(statusCodes.NOT_FOUND, message);
    }

    static BadRequest(message) {
        return new Error(statusCodes.BAD_REQUEST, message);
    }

    static Unauthorized(message) {
        return new Error(statusCodes.UNAUTHORIZED, message);
    }

    static Forbidden(message) {
        return new Error(statusCodes.FORBIDDEN, message);
    }

    static InternalServerError(message) {
        return new Error(statusCodes.INTERNAL_SERVER_ERROR, message);
    }
}


module.exports = {
    Error,
};