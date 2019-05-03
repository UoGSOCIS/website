/**
 * Header checker middleware function for express routes.
 *
 * @author Keefer Rourke <krourke@uoguelph.ca>
 * @module app/middleware/requireheaders
 */
"use strict";

var source = require("rfr");

const logger = source("logger");
const Error = source("models/responses").Error;


/**
 * requireHeaders() is a configurable express middleware that verifies the
 * request has set the correct headers. If they are not set, the error 400 is
 * sent with an Error Response Object.
 * @function
 * @param {Array} headers  - array of {key, value} where values are optional
 * @example
 * // a route requires the content-type to be application/json
 * app.post("/echo", requireHeaders([{
 *   key: "Content-Type",
 *   value: "application/json",
 * }]), function(req, res, next) {
 *   // echo the request body's json back as the response if the Content-Type is
 *   // set correctly; otherwise the middleware will send back a 400
 *   res.status(202).json(req.body);
 * });
 * @example
 * // a route that requires the client to declare the format and language of
 * // the response; if the headers are not set then the middleware will send
 * // a 404 response.
 * app.post("/foo", requireHeaders([{
 *   key: "Accept",
 * }, {
 *   key: "Accept-Language",
 * }], function(req, res, next) {
 *  let fmt = req.get("Accept");
 *  let lang = req.get("Accept-Language");
 *  backend.getResponse(lang, fmt).then((response) => {
 *    res.set("Content-Type", fmt);
 *    res.set("Content-Language", lang);
 *    res.status(200).send(response);
 *  }).catch((err) => {
 *    if (err instanceof NotTranslatedError) {
 *      return res.status(400).send({
 *        message: `Content is not translated to request language ${lang}.`,
 *        supportedLanguages: backend.getSupportedLangs(),
 *      });
 *    }
 *    if (err instanceof UnsupportedContentTypeError) {
 *      return res.status(400).send({
 *        message: `Requested content-type ${fmt} is not supported.`,
 *        supportedFormats: backend.getSupportedFormats(),
 *      });
 *    }
 *    return res.status(500).send("Internal server error");
 *  });
 * });
 */
function requireHeaders(headers) {
    return function(req, res, next) {
        if (!headers) {
            return next();
        }
        for (const header of headers) {
            if (!header.key) {
                logger.error(`Wrong configuration for ${req.method}: ${req.path}.\n`
                    + "Object provided to requireHeaders is missing property 'key'", header);
            }
            let h = req.get(header.key);
            // send a bad request response if:
            //  - the header is not defined
            //  - the value is not what is expected, if there is an expected value
            if (!h || (typeof header.value !== "undefined" && h !== header.value)) {
                logger.warn("Received bad request missing expected header:", header);

                let response = Error.BadRequest(`Bad request. Header ${h} is missing or invalid.`);
                return next(response);
            }
        }

        return next();
    };
}

module.exports = requireHeaders;
