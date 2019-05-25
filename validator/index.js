/**
 * ValidatorWrapper module. This is a wrapper around the validator module so that it
 * can accept input that is not a string.
 *
 * @module validator
 */
const validator = require("validator");

/**
 * This is a wrapper around validator.isRFC3339().
 *
 * It will make sure sure that the input given is a valid date string.
 * Can optionally allow an empty date value to be validated as true. This is used when
 * updated date values that are optional.
 *
 * @link{https://www.npmjs.com/package/validator}
 * @param date - the date string to validate
 * @param canBeEmpty - if true then undefined values are allowd
 * @returns boolean - true if the date is valid, false otherwise
 */
function dateValidator(date, canBeEmpty) {

    if (canBeEmpty && typeof date === "undefined") {
        return true;
    }

    return typeof date === "string" && validator.isRFC3339(date);
}

/**
 * This is a wrapper around validator.isEmail().
 *
 * It will make sure sure that the input given is a valid email address.
 * options are optional. See https://www.npmjs.com/package/validator for mor information.
 *
 * @link{https://www.npmjs.com/package/validator}
 * @param email - the email address to validate
 * @param options - options that get passed through to validator
 * @returns boolean - true if the email is valid, false otherwise
 */
function emailValidator(email, options) {

    if (typeof email !== "string") {
        return false;
    }
    return validator.isEmail(email, options);
}


module.exports = {

    isEmail: emailValidator,
    isRFC3339: dateValidator,

};
