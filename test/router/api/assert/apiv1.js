/**
 * These assert functions can be used to ensure that the response objects are as expected.
 * @module test/router/api/assert
 * @author Marshall Asch <masch@uoguelph.ca>
 */
"use strict";

const chai = require("chai");
const validator = require("validator");
const asPromised = require("chai-as-promised");
const assert = chai.assert;

chai.use(asPromised);

function isDateString(s, propName) {
    if (propName == null) {
        propName = "date string";
    }
    assert.isString(s, `${propName} is not a string`);
    assert.equal(new Date(s).toISOString(), s, `${propName} is not a valid date`);
}

/**
 * isSaleObject() asserts that the supplied object conforms to the definition of
 * a the sale for a product object.
 *
 * @param {Object} obj - the object to check
 * @throws AssertionError if the assertions fail
 */
function isSaleObject(obj) {

    let hasAtt = false;
    for (const key in Object.keys(obj)) {
        switch (key) {
        case "percent":
            assert.isFalse(hasAtt, "Can not contain both 'percent' and 'discount' attributes");
            assert.isString(obj.id, "id is a not a string");
            assert.isTrue(validator.isMongoId(obj.id), "id is not a valid mongoId");
            hasAtt = true;
            break;
        case "discount":
            assert.isFalse(hasAtt, "Can not contain both 'percent' and 'discount' attributes");
            assert.isNumeric(obj.discount, "discount is not a number");
            assert.isAtLeast(obj.discount, 0, "discount can not be negative");
            assert.isTrue(validator.isDecimal(obj.discount.toString(), {force_decimal: true, decimal_digits: "2", }), "discount is not a valid value");
            hasAtt = true;
            break;
        default:
            assert.isUndefined(obj[key]);
            break;
        }
    }

    assert.isTrue(hasAtt, "must contain either 'percent' or 'discount' attributes");
}

/**
 * isGenericResponse() asserts that the body of the response conforms to the
 * definition of the Generic Response Object.
 *
 * @param {number}  code  - the response code to check
 * @param {Object}  obj   - the object to check
 * @param {boolean} [any] - if true, then any code will be accepted
 * @throws Error if the assertions fail
 */
function isGenericResponse(code, obj, any) {
    if (any !== true) {
        assert.isOk(Number.isInteger(code));
        assert.equal(obj.status, code);
    }
    assert.isString(obj.message);
}

/**
 * isExecObject() asserts that the body of the response conforms to the
 * definition of the Exec Object.
 *
 * @param {Object} obj  - the object to check
 * @throws AssertionError if the assertions fail
 */
function isExecObject(obj) {
    for (const key in Object.keys(obj)) {
        switch (key) {
        case "id":
            assert.isString(obj.id, "id is a not a string");
            assert.isTrue(validator.isMongoId(obj.id), "id is not a valid mongoId");
            break;
        case "name":
            assert.isString(obj.name, "name is not a string");
            break;
        case "email":
            assert.isString(obj.email, "email is not a string");
            assert.isTrue(validator.isEmail(obj.email), "email not a valid email");
            break;
        case "year":
            assert.isOk(Number.isInteger(obj.year));
            break;
        case "role":
            assert.isString(obj.role, "role is not a string");
            break;
        case "order":
            assert.isOk(Number.isInteger(obj.order));
            break;
        default:
            assert.isUndefined(obj[key]);
            break;
        }
    }
}

/**
 * isChallengeObject() asserts that supplied object conforms to the definition of
 * the Roboticon Challenge Object.
 *
 * @param {Object} obj  - the object to check
 * @throws AssertionError if the assertions fail
 */
function isChallengeObject(obj) {
    for (const key in Object.keys(obj)) {
        switch (key) {
        case "id":
            assert.isString(obj.id, "id is a not a string");
            assert.isTrue(validator.isMongoId(obj.id), "id is not a valid mongoId");
            break;
        case "year":
            assert.isOk(Number.isInteger(obj.year));
            break;
        case "challenge_number":
            assert.isOk(Number.isInteger(obj.challenge_number));
            break;
        case "description":
            assert.isString(obj.description, "description is not a string");
            break;
        case "goal":
            assert.isString(obj.goal, "goal is not a string");
            break;
        case "parameters":
            assert.isString(obj.parameters, "parameters is not a string");
            break;
        case "points":
            assert.isString(obj.points, "points is not a string");
            break;
        case "hidden":
            assert.isBooleanObject(obj.hidden);
            break;
        case "image":
            assert.isString(obj.image, "image url is not a string");
            break;
        case "map":
            assert.isString(obj.map, "map url is not a string");
            break;
        default:
            assert.isUndefined(obj[key]);
            break;
        }
    }
}

/**
 * isEvent() asserts that the supplied object conforms to the definition of an Event object.
 *
 * @param {Object} obj - the object to check
 * @throws AssertionError if the assertions fail
 */
function isEvent(obj) {
    for (const key in Object.keys(obj)) {
        switch (key) {
        case "id":
            assert.isString(obj.id, "id is a not a string");
            assert.isTrue(validator.isMongoId(obj.id), "id is not a valid mongoId");
            break;
        case "start_time":
            isDateString(obj.start_time, "start_time");
            break;
        case "end_time":
            isDateString(obj.end_time, "end_time");
            break;
        case "title":
            assert.isString(obj.title, "title is not a string");
            break;
        case "description":
            assert.isString(obj.description, "description is not a string");
            break;
        case "location":
            assert.isString(obj.location, "location is not a string");
            break;
        case "tags":
            assert.isArray(obj.tags, "tags is not an array");
            obj.tags.forEach((tag) => {
                assert.isString(tag, "tag is not a string");
            });
            break;
        default:
            assert.isUndefined(obj[key]);
            break;
        }
    }
}

/**
 * isProduct() asserts that the supplied object conforms to the definition of
 * a Product object.
 *
 * @param {Object} obj - the object to check
 * @throws AssertionError if the assertions fail
 */
function isProduct(obj) {

    for (const key in Object.keys(obj)) {
        switch (key) {
        case "id":
            assert.isString(obj.id, "id is a not a string");
            assert.isTrue(validator.isMongoId(obj.id), "id is not a valid mongoId");
            break;
        case "name":
            assert.isString(obj.name, "name is not a string");
            break;
        case "type":
            assert.isString(obj.type, "type is not a string");
            break;
        case "price":
            assert.isNumeric(obj.price, "price is not a number");
            assert.isAtLeast(obj.price, 0, "price can not be negative");
            assert.isTrue(validator.isDecimal(obj.price.toString(), {force_decimal: true, decimal_digits: "2", }), "Price is not a valid value");
            break;
        case "description":
            assert.isString(obj.description, "description is not a string");
            break;
        case "tags":
            assert.isArray(obj.tags, "tags is not an array");
            obj.tags.forEach((tag) => {
                assert.isString(tag, "tag is not a string");
            });
            break;
        case "images":
            assert.isArray(obj.images, "images is not an array");
            obj.images.forEach((img) => {
                assert.isString(img, "img is not a string");
            });
            break;
        case "available":
            assert.isBooleanObject(obj.available);
            break;
        case "sale":
            if (obj.sale !== null) {
                isSaleObject(obj.sale);
            }
            break;
        default:
            assert.isUndefined(obj[key]);
            break;
        }
    }
}

/**
 * isPagingObject() asserts that the supplied response conforms to the definition of a Post object.
 *
 * @param {Object} obj - the response body
 * @throws AssertionError if the assertions fail
 */
function isPagingObject(obj) {
    Object.keys(obj).forEach((key) => {
        switch (key) {
        case "href":
            assert.isString(obj.href, "href is not a string");
            break;
        case "next":
            if (obj.next !== null) {
                assert.isString(obj.next, "next is not a string or null");
            }

            break;
        case "previous":
            if (obj.previous !== null) {
                assert.isString(obj.previous, "previous is not a string or null");
            }

            break;
        case "items":            
            assert.isArray(obj.items, "items is not an array");
            break;
        case "limit":
            assert.isNumber(obj.limit, "limit is not a number");
            break;
        case "offset":
            assert.isNumber(obj.offset, "offset is not a number");
            break;
        case "total":
            assert.isNumber(obj.total, "total is not a number");
            break;
        default:
            assert.isUndefined(obj[key]);
            break;
        }
    });
}

module.exports = {
    isGenericResponse: isGenericResponse,
    isProduct: isProduct,
    isEvent: isEvent,
    isChallengeObject: isChallengeObject,
    isExecObject: isExecObject,
    isPagingObject: isPagingObject,
};
