

const fs = require("fs");
const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");
const source = require("rfr");
const logger = source("logger");
const config = source("config");
const path = require("path");


const projectdir = path.resolve(__dirname, "..");
const jwtPrivateKeyFile = path.join(projectdir, config.jwt.privateKey);
const jwtPublicKeyFile = path.join(projectdir, config.jwt.publicKey);


const jwtPrivate = fs.readFileSync(jwtPrivateKeyFile);
const jwtPublic = fs.readFileSync(jwtPublicKeyFile);


// check to see if a public key path was given for a mock key
let mockGoogleKey = null;
if (config.google.publicKey) {

    const mockGoogleKeyFile = path.join(projectdir, config.google.publicKey);
    try {
        mockGoogleKey = fs.readFileSync(mockGoogleKeyFile);
    } catch (err) {
        if (err.code === "ENOENT") {
            logger.error("File not found!");
        }
    }
}

/**
 * This will verify that the token has been signed using the correct certificate, that the iss, exp, iat, aud, hd
 * claims are valid.
 *
 * @param token the JWT token to validate
 * @returns {Promise} resolves the decoded payload on success
 *                    rejects with an error if it is not valid
 */
function verify(token) {

    return new Promise((resolve, reject) => {

        if (!jwtPublic) {
            logger.error(`public key "${config.jwt.publicKey}" not found!`);
            return reject(new Error("No public key file was given"));
        }

        jwt.verify(token, jwtPublic, {
            algorithms: ["RS256"],
            audience: config.jwt.aud,
            issuer: config.jwt.iss,
            ignoreExpiration: false,
        }, (err, decoded) => {

            if (err) {
                return reject(err);
            }
            resolve(decoded);
        });
    });
}

/**
 * This will verify that the token has been signed using the correct certificate, that the iss, exp, iat, aud
 * claims are valid.
 *
 * @param token the JWT token to validate
 * @returns {Promise} resolves the decoded payload on success
 *                    rejects with an error if it is not valid
 */
function verifyGoogle(token) {

    // Verify using getKey callback
    // Example uses https://github.com/auth0/node-jwks-rsa as a way to fetch the keys.
    const client = jwksClient({
        cache: true,
        rateLimit: true,
        jwksUri: config.google.keyURL,
    });

    function getKey(header, callback){
        client.getSigningKey(header.kid, function(err, key) {
            const signingKey = key.publicKey || key.rsaPublicKey;
            callback(null, signingKey);
        });
    }

    const cert = mockGoogleKey || getKey;


    return new Promise((resolve, reject) => {
        jwt.verify(token, cert, {
            algorithms: ["RS256"],
            audience: config.google.aud,
            issuer: config.google.iss,
            ignoreExpiration: false,
        }, (err, decoded) => {

            if (err) {
                return reject(err);
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

        if (!jwtPrivate) {
            logger.error(`private key "${config.jwt.privateKey}" not found!`);
            return reject(new Error("No private key file was given"));
        }

        // turn it into a promise
        return jwt.sign(payload, jwtPrivate, {
            algorithm: "RS256",
            expiresIn: "1h",
            audience: config.jwt.aud,
            issuer: config.jwt.iss,

        }, (err, token) => {
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
    verifyGoogle: verifyGoogle,
};
