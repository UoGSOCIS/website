

const fs = require("fs");
const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");
const source = require("rfr");
const logger = source("logger");
const config = source("config");
const path = require("path");


/**
 * This will verify that the token has been signed using the correct certificate, that the iss, exp, iat, aud, hd
 * claims are valid.
 *
 * @param token the JWT token to validate
 * @returns {Promise} resolves the decoded payload on success
 *                    rejects with an error if it is not valid
 */
function verify(token) {


    // Verify using getKey callback
    // Example uses https://github.com/auth0/node-jwks-rsa as a way to fetch the keys.
    const client = jwksClient({
        cache: true,
        rateLimit: true,
        jwksUri: config.jwt.keyURL,
    });

    function getKey(header, callback){
        client.getSigningKey(header.kid, function(err, key) {
            var signingKey = key.publicKey || key.rsaPublicKey;
            callback(null, signingKey);
        });
    }

    // check to see if a public key path was given
    let pubKey = null;
    if (config.jwt.publicKey) {

        try {
            const projectdir = path.resolve(__dirname, "..");
            const keyFile = path.join(projectdir, config.jwt.publicKey);

            pubKey = fs.readFileSync(keyFile);
        } catch (err) {
            if (err.code === "ENOENT") {
                logger.error("File not found!");
            }
        }
    }

    const cert = pubKey || getKey;


    return new Promise((resolve, reject) => {
        jwt.verify(token, cert, {
            algorithms: ["RS256"],
            audience: config.jwt.aud,
            issuer: config.jwt.iss,
            ignoreExpiration: true,
        }, (err, decoded) => {

            if (err) {
                return reject(err);
            }

            if (!decoded.hd || decoded.hd !== "socis.ca") {
                reject(new Error("Token is not for the correct domain"));
            }

            resolve(decoded);
        });
    });
}

/**
 * This will sign a JSON Web Token using the specified private key.
 * If no key is given in the config file then it will reject with an error.
 *
 * @param payload, the payload to sign, the iss, aud, iat, and exp must be set by the caller.
 *  @return {Promise} resolves with the signed token on success
 *                   rejects with error on failure
 */
function sign(payload) {

    return new Promise((resolve, reject) => {

        if (!config.jwt.privateKey) {
            return reject(new Error("No private key file was given"));
        }

        let privateKey;
        try {
            const projectdir = path.resolve(__dirname, "..");
            const keyFile = path.join(projectdir, config.jwt.privateKey);

            privateKey = fs.readFileSync(keyFile);
        } catch (err) {
            if (err.code === "ENOENT") {
                logger.log("File not found!");
            }
            reject(err);
        }

        // turn it into a promise
        return jwt.sign(payload, privateKey, { algorithm: "RS256", }, (err, token) => {
            if (token) {
                return resolve(token);
            }

            return reject(err);
        });
    });
}


module.exports = {
    sign: sign,
    verify: verify,
};