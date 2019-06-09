/**
 * Config module. Reads configuration file located at __projectdir/config.ini
 * and loads it into the exported object.
 * @file config.js
 * @module config
 */
const fs = require("fs");
const ini = require("ini");
const path = require("path");

const __projectdir = path.resolve(__dirname, "..");
let configFile = path.join(__projectdir, "/config.ini");
// eslint-disable-next-line no-process-env
if (process.env.NODE_ENV === "test") {
    configFile = path.join(__projectdir, "/test/config.ini");
}
const config = ini.parse(fs.readFileSync(configFile, "utf-8"));

function configure(file) {
    const newConfig = ini.parse(fs.readFileSync(file, "utf-8"));
    newConfig.file = file;

    return newConfig;
}

module.exports = {
    /**
     * __projectdir is a string that denotes the installation path of the eNuk
     * web application. This is useful for any modules that require access to
     * static resource paths.
     * @type {string}
     * @see module:app/router
     */
    __projectdir: __projectdir,
    /**
     * configFile is the path to the config.ini file
     * @type {string}
     */
    file: configFile,
    /**
     * database is an object that contains the database connection parameters
     * @property {string} db
     * @property {Number} connections
     * @property {string} host
     * @property {string} user
     * @property {string} passwd
     */
    database: config.database,
    /**
     * logs is an object that contains configuration parameters for the logger
     * @property {string}  logdir      - the absolute path where log files are
     *                                   stored
     * @property {boolean} stacktraces - indicates if traces should be logged
     */
    logs: config.logs,
    /**
     * mail is an object that contains configuration parameters for an SMTP
     * server which is used to send email confirmations
     * @property {string}  host
     * @property {number}  port
     * @property {boolean} ignore_tls
     * @property {boolean} reject_unauthorized_certificates
     * @property {boolean} auth
     * @property {string}  user
     * @property {string}  passwd
     */
    mail: config.mail,
    /**
     * server is an object that contains runtime parameters for the express
     * server
     * @property {number} port      - default: 3000
     * @property {string} mode      - "development", "test", or "production"
     * @property {string} jwtsecret - the secret used to sign JSON Web Tokens
     */
    server: config.server,
    /**
     * session is an object that contains configuration parameters for express
     * sessions.
     * @property {string} secret
     */
    session: config.session,
    /**
     * configure() is a function that creates a new configuration object
     * using settings from the specified file. This function can be used to
     * supply a custom configuration at run time, if for some reason the default
     * config which is loaded upon initializing this module does not meet
     * requirements.
     * @function
     * @param {string} file - path to configuration ini file
     * @return {Object} the new configuration loaded from the file
     */
    jwt: config.jwt,
    google: config.google,
    configure: configure,
};
