const execErrors = require("./exec-errors.js");
const eventErrors = require("./event-errors.js");
const userErrors = require("./user-errors.js");
const roboticonErrors = require("./roboticon-errors.js");

module.exports = {
    /**
     * All errors that pertain to Execs accounts.
     */
    exec: execErrors,
    event: eventErrors,
    roboticon: roboticonErrors,
    user: userErrors,
};