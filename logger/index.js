/**
 * Logger module. Handles leveled logging. Uses <code>winston@3.0.0-rc3</code>.
 * Upgrade to stable <code>winston@^3.0.0</code> when it's available.
 *
 * @author Keefer Rourke <krourke@uoguelph.ca>
 * @module app/logger
 * @see module:config.logs
 */
"use strict";

var source = require("rfr");

const mkdirp = require("mkdirp");
const winston = require("winston");
const logform = require("logform");
const path = require("path");

const config = source("config");

const LOGDIR = config.logs != null ? config.logs.logdir : "/tmp/socis/logs";
mkdirp.sync(LOGDIR);

// uses the default logging levels as:
// 0 - error
// 1 - warning
// 2 - info
// 3 - verbose
// 4 - debug
// 5 - silly
//
// files specified in the transport will contain all logs of the specified level
// and all levels below it; ex if 'warn' is specified as the level, then all
// logs of level 'error' and 'warn' are logged to that transport
const logger = winston.createLogger({
    level: "info", // log info level and lower
    format: logform.format.json(),
    transports: [
        // write all 'error' level logs to error.log
        new winston.transports.File({
            filename: path.join(LOGDIR, "error.log"),
            level: "error",
        }),
        // write all 'info' level and below (includes 'warn', 'error', etc..)
        // to combined.log
        new winston.transports.File({
            filename: path.join(LOGDIR, "combined.log"),
            level: "info",
        }),
    ],
});

let mode = config.server != null ? config.server.mode : "production";
if (mode === "production") {
    // limit logging only warnings and errors to the console if in production
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
        level: "warn",
    }));
} else if (mode === "test") {
    // limit logging only errors to the console if running test configuration
    // (this is here to quiet output for unit tests)
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
        level: "error",
    }));
} else {
    // write all 'debug' level and below to debug.log if not in production
    logger.add(new winston.transports.File({
        filename: path.join(LOGDIR, "debug.log"),
        format: winston.format.json(),
        level: "debug",
    }));
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
        level: "debug",
    }));
}

function shortPath(path) {
    let parts;

    if (process.platform === "win32") {
        path.slice(3).split("\\");
    } else {
        parts = path.split("/");
    }

    const file = parts.pop();
    let shortPath = parts.reduce((newPath, part) => {
        return newPath + part[0] + "/";
    });
    return shortPath + file;
}

function parseStackFrame(err, frameOffset) {
    const frame = err.stack.split("\n")[frameOffset];
    let file;
    let line;
    let func;

    if (frame.indexOf("(") > -1) {
        // if error raised from a function
        func = frame.split(" ")[5];
        func = func.includes("anonymous") ? "??" : func;
        [file, line] = frame.split("(")[1].split(":");
    } else {
        // if error not raised from a function
        func = "??";
        [file, line] = frame.split(" ")[5].split(":");
    }
    return `${new Date().toISOString()} at (${shortPath(file)}:${line}#${func})`;
}

// log wrapper function; prepends date, file, and line number
function log(level, info, ...rest) {
    // parse the stacktrace:
    // note: this function is always called by one of the wrappers (info, debug, error, warn),
    // so the stack indexing accounts for the frame created by those wrappers
    const e = new Error();
    const logPrefix = parseStackFrame(e, 3);
    let msg = null;

    if (info instanceof Error) {
        msg = info.name + ": " + info.message;
        if (config.logs && config.logs.stacktraces === true) {
            msg += "\n" + info.stack;
        }
    } else if (typeof info === "string") {
        msg = info;
    } else {
        // print indented JSON string if info is not Error or string
        msg = JSON.stringify(info, null, 2);
    }

    if (rest.length > 0) {
        msg = rest.reduce((accumulator, arg) => {
            let extraInfo;
            if (typeof arg === "string") {
                extraInfo = arg;
            } else {
                extraInfo = JSON.stringify(arg, null, 2);
            }

            return accumulator + " " + extraInfo;
        }, msg);
    }

    // perform the log action
    logger.log({
        level: level,
        message: `${logPrefix} ${msg}`,
    });

    return;
}
// high priority leveled log
function error(err, ...rest) {
    log("error", err, ...rest);
}
// medium priority leveled log
function warn(msg, ...rest) {
    log("warn", msg, ...rest);
}
// low priority leveled log
function info(msg, ...rest) {
    log("info", msg, ...rest);
}
// just for debugging
function debug(msg, ...rest) {
    log("debug", msg, ...rest);
}

// export the logging functions
module.exports = {
    /**
     * debug() is to be used to log debugging information <b>only</b>.
     * If the server is running in "production" mode, then statements logged by
     * this function are <em>not saved</em>.
     * If the server is running "development" mode, then statements are logged
     * to the console and to <em>LOGDIR/debug.log</em>
     * @function
     * @param {string} msg - the log message
     */
    debug: debug,
    /**
     * error() is to be used to log error information <b>only</b>.
     * All errors are saved to <em>LOGDIR/error.log</em>
     * @function
     * @param {Error|string} err - the error to log
     */
    error: error,
    /**
     * info() is to be used to log miscellaneous information, like events or
     * other interactions and actions on the server.
     * All info messages are saved to <em>LOGDIR/combined.log</em>
     * @function
     * @param {string} msg - the log message
     */
    info: info,
    /**
     * warn() is to be used to log warnings or non-critical errors <b>only</b>.
     * All errors are saved to <em>LOGDIR/error.log</em>
     * @function
     * @param {Error|string} err - the error to log
     */
    warn: warn,
};
