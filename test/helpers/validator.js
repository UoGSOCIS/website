/**
 * Mocha unit tests for validator wrapper module. Note that this file does not require mocha.
 * Asserts provided via the chai framework. All test should return Promises.
 *
 * @file test/helpers/validator.js
 * @see module:validator
 */
"use strict";

const source = require("rfr");
const validator = source("validator");

const chai = require("chai");
const asPromised = require("chai-as-promised");
const assert = chai.assert;

chai.use(asPromised);

/* User class test suite */
suite("Validator", function() {

    suite("isEmail", function() {
        test("incorrect type for the email", function() {
            assert.isFalse(validator.isEmail(43));
            assert.isFalse(validator.isEmail(4.2));
            assert.isFalse(validator.isEmail(new Date()));
            assert.isFalse(validator.isEmail(true));
            assert.isFalse(validator.isEmail());
            assert.isFalse(validator.isEmail(null));
        });

        test("email uses an ip address", function() {
            assert.isFalse(validator.isEmail("bob@192.168.0.6"));
        });

        test("email is from localhost", function() {
            assert.isFalse(validator.isEmail("bob@localhost"));
        });

        test("email has no TLD", function() {
            assert.isFalse(validator.isEmail("bob@mailserver"));
        });

        test("invalid addresses", function() {
            assert.isFalse(validator.isEmail("bob@localhost"));
            assert.isFalse(validator.isEmail("emailaddress"));
            assert.isFalse(validator.isEmail("email@"));
            assert.isFalse(validator.isEmail("@address.net"));
            assert.isFalse(validator.isEmail("email@address@example.com"));
            assert.isFalse(validator.isEmail(".bob@localhost.org"));
            assert.isFalse(validator.isEmail("bob.@localhost.org"));
            assert.isFalse(validator.isEmail("bob@localhost..org"));
            assert.isFalse(validator.isEmail("a\"b(c)d,e:f;gi[j\\k]l@example.com "));
            assert.isFalse(validator.isEmail("this\\ still\\\"not\\allowed@example.com"));
            assert.isFalse(validator.isEmail("1234567890123456789012345678901234567890123456789012345678901234+x@example.com"));
            assert.isFalse(validator.isEmail("john..doe@example.com"));
        });

        test("valid email address", function() {
            assert.isTrue(validator.isEmail("email@domain.com"));
            assert.isTrue(validator.isEmail("\"email\"@domain.com"));
            assert.isTrue(validator.isEmail("234567890@domain.com"));
            assert.isTrue(validator.isEmail("email@domain-one.com"));
            assert.isTrue(validator.isEmail("email.address@domainone.com"));
            assert.isTrue(validator.isEmail("_______@domain.com"));
            assert.isTrue(validator.isEmail("email@domain.one.com"));
            assert.isTrue(validator.isEmail("firstname-lastname@domain.com"));
            assert.isTrue(validator.isEmail("あいうえお@domain.com"));
            assert.isTrue(validator.isEmail("firstname+lastname@domain.com"));
            assert.isTrue(validator.isEmail("\"very.(),:;<>[]\\\".VERY.\\\"very@\\ \\\"very\\\".unusual\"@strange.example.com"));
            assert.isTrue(validator.isEmail("/#!$%&'*+-/=?^_`{}|~@example.org"));
            assert.isTrue(validator.isEmail("\" \"@example.org"));
        });
    });

    suite("isRFC3339", function() {
        test("incorrect type for the date", function() {
            assert.isFalse(validator.isRFC3339(43));
            assert.isFalse(validator.isRFC3339(Date.now()));
            assert.isFalse(validator.isRFC3339(4.2));
            assert.isFalse(validator.isRFC3339(new Date()));
            assert.isFalse(validator.isRFC3339(true));
            assert.isFalse(validator.isRFC3339());
            assert.isFalse(validator.isRFC3339(null));
        });

        test("invalid date strings", function() {
            assert.isFalse(validator.isRFC3339(""));
            assert.isFalse(validator.isRFC3339("985-04-12T23:20:50.52Z"), "3 digit year");
            assert.isFalse(validator.isRFC3339("85-04-12T23:20:50.52Z"), "2 digit year");
            assert.isFalse(validator.isRFC3339("1985-4-12T23:20:50.52Z"), "1 digit month");
            assert.isFalse(validator.isRFC3339("1985-04-1T23:20:50.52Z"), "1 digit day");
            assert.isFalse(validator.isRFC3339("1985-04-12M23:20:50.52Z"), "M instead of T for time seperator");
            assert.isFalse(validator.isRFC3339("1985-04-12"));
        });


        test("valid date strings", function() {
            assert.isTrue(validator.isRFC3339("1985-04-12T23:20:50.52Z"));
            assert.isTrue(validator.isRFC3339("1985-04-12T23:20:50Z"));
            assert.isTrue(validator.isRFC3339("1985-04-12t23:20:50.52z"));
            assert.isTrue(validator.isRFC3339("1985-04-12T23:20:50.52+12:21"));
            assert.isTrue(validator.isRFC3339("1985-04-12T23:20:50.52-20:32"));
        });

        test("allow unset date", function() {
            assert.isTrue(validator.isRFC3339(undefined, true));
        });

    });
});
