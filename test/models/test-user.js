/**
 * Mocha unit tests for user module. Note that this file does not require mocha.
 * Asserts provided via the chai framework. All test should return Promises.
 *
 * @file test-exec.js
 * @see module:models/exec
 */
"use strict";

const source = require("rfr");
const chai = require("chai");

const asPromised = require("chai-as-promised");
const assert = chai.assert;

const users = source("models/user");
const connection = source("test/connection");
const logger = source("logger");
const errors = source("models/error");


chai.use(asPromised);

/* User class test suite */
suite("User", function() {

    suite("#init()", function() {

        test("make sure that all the fields can be set", function() {

            const timeBefore = new Date();
            const user = new users.User()
            .setAccountId("8765yu97865rtcfvgbiu78")
            .setName("user with admin")
            .setEmail("email@example.com")
            .setPermissions(users.Permission.ADMIN);
            const timeAfter = new Date();

            assert.equal(user.accountId, "8765yu97865rtcfvgbiu78");
            assert.equal(user.name, "user with admin");
            assert.equal(user.email, "email@example.com");
            assert.equal(user.permissions, users.Permission.ADMIN);

            assert.isAtLeast(user.createdAt, timeBefore);
            assert.isAtMost(user.createdAt, timeAfter);

        });

        test("check that the created at and permissions default values are set", function() {
            const user = new users.User()
            .setAccountId("nui76tyu786")
            .setName("another user")
            .setEmail("email2@example.com");

            assert.equal(user.accountId, "nui76tyu786");
            assert.equal(user.name, "another user");
            assert.equal(user.email, "email2@example.com");
            assert.equal(user.permissions, users.Permission.NONE);
        });
    });

    suite("Check that the user only has the permissions that were set", function() {

        test("Admin should have all permissions", function() {
            const user = new users.User()
            .setAccountId("8765yu97865rtcfvgbiu78")
            .setName("user with admin")
            .setEmail("email@example.com")
            .setPermissions(users.Permission.ADMIN);

            assert.isTrue(user.hasAdminPermission());
            assert.isTrue(user.hasSuperAdminPermission());
            assert.isTrue(user.hasMerchantPermission());
            assert.isTrue(user.hasEventPermission());
            assert.isTrue(user.hasNewsletterPermission());
            assert.isTrue(user.hasSellerPermission());
        });

        test("events permission", function() {
            const user = new users.User()
            .setAccountId("8765yu97865rtcfvgbiu78")
            .setName("user with admin")
            .setEmail("email@example.com")
            .setPermissions(users.Permission.EVENTS);

            assert.isTrue(user.hasAdminPermission());
            assert.isFalse(user.hasSuperAdminPermission());
            assert.isFalse(user.hasMerchantPermission());
            assert.isTrue(user.hasEventPermission());
            assert.isFalse(user.hasNewsletterPermission());
            assert.isFalse(user.hasSellerPermission());
        });

        test("merchant permission", function() {
            const user = new users.User()
            .setAccountId("8765yu97865rtcfvgbiu78")
            .setName("user with admin")
            .setEmail("email@example.com")
            .setPermissions(users.Permission.MERCHANT);

            assert.isTrue(user.hasAdminPermission());
            assert.isFalse(user.hasSuperAdminPermission());
            assert.isTrue(user.hasMerchantPermission());
            assert.isFalse(user.hasEventPermission());
            assert.isFalse(user.hasNewsletterPermission());
            assert.isFalse(user.hasSellerPermission());
        });

        test("newsletter permission", function() {
            const user = new users.User()
            .setAccountId("8765yu97865rtcfvgbiu78")
            .setName("user with admin")
            .setEmail("email@example.com")
            .setPermissions(users.Permission.NEWSLETTER);

            assert.isTrue(user.hasAdminPermission());
            assert.isFalse(user.hasSuperAdminPermission());
            assert.isFalse(user.hasMerchantPermission());
            assert.isFalse(user.hasEventPermission());
            assert.isTrue(user.hasNewsletterPermission());
            assert.isFalse(user.hasSellerPermission());
        });

        test("seller permission", function() {
            const user = new users.User()
            .setAccountId("8765yu97865rtcfvgbiu78")
            .setName("user with admin")
            .setEmail("email@example.com")
            .setPermissions(users.Permission.SELLER);

            assert.isTrue(user.hasAdminPermission());
            assert.isFalse(user.hasSuperAdminPermission());
            assert.isFalse(user.hasMerchantPermission());
            assert.isFalse(user.hasEventPermission());
            assert.isFalse(user.hasNewsletterPermission());
            assert.isTrue(user.hasSellerPermission());
        });

        test("multiple permissions", function() {
            const user = new users.User()
            .setAccountId("8765yu97865rtcfvgbiu78")
            .setName("user with admin")
            .setEmail("email@example.com")
            .setPermissions(users.Permission.NEWSLETTER | users.Permission.EVENTS);

            assert.isTrue(user.hasAdminPermission());
            assert.isFalse(user.hasSuperAdminPermission());
            assert.isFalse(user.hasMerchantPermission());
            assert.isTrue(user.hasEventPermission());
            assert.isTrue(user.hasNewsletterPermission());
            assert.isFalse(user.hasSellerPermission());
        });

        test("no permissions", function() {
            const user = new users.User()
            .setAccountId("8765yu97865rtcfvgbiu78")
            .setName("user with admin")
            .setEmail("email@example.com")
            .setPermissions(users.Permission.NONE);

            assert.isFalse(user.hasAdminPermission());
            assert.isFalse(user.hasSuperAdminPermission());
            assert.isFalse(user.hasMerchantPermission());
            assert.isFalse(user.hasEventPermission());
            assert.isFalse(user.hasNewsletterPermission());
            assert.isFalse(user.hasSellerPermission());
        });
    });

    suite("validate(user)", function() {

        test("valid all fields set", function() {

            const user = new users.User()
            .setAccountId("8765yu97865rtcfvgbiu78")
            .setName("user with admin")
            .setEmail("email@example.com")
            .setPermissions(users.Permission.ADMIN);

            return assert.isFulfilled(users.User.isValid(user));
        });

        test("valid default permissions", function() {

            const user = new users.User()
            .setAccountId("8765yu97865rtcfvgbiu78")
            .setName("user with admin")
            .setEmail("email@example.com");

            return assert.isFulfilled(users.User.isValid(user));
        });

        test("invalid email address", function() {
            const user = new users.User()
            .setAccountId("8765yu97865rtcfvgbiu78")
            .setName("user with admin")
            .setEmail("hahahaha")
            .setPermissions(users.Permission.ADMIN);

            return assert.isRejected(users.User.isValid(user));
        });

        test("missing name", function() {
            const user = new users.User()
            .setAccountId("8765yu97865rtcfvgbiu78")
            .setEmail("email@example.com")
            .setPermissions(users.Permission.ADMIN);

            return assert.isRejected(users.User.isValid(user));
        });

        test("missing accountId", function() {
            const user = new users.User()
            .setName("user with admin")
            .setEmail("email@example.com")
            .setPermissions(users.Permission.ADMIN);

            return assert.isRejected(users.User.isValid(user));
        });
    });

    suite("save()", function() {

        test("Saving valid user", function() {
            const user = new users.User()
            .setAccountId("8765yu97865rtcfvgbiu78")
            .setName("user with admin")
            .setEmail("email@example.com")
            .setPermissions(users.Permission.ADMIN);

            return assert.isFulfilled(user.save());
        });

        test("Should not save an invalid user", function() {

            // missing name so its not valid
            const user = new users.User()
            .setAccountId("78f6tycviu78vy")
            .setEmail("email@example.com")
            .setPermissions(users.Permission.ADMIN);

            return assert.isRejected(user.save());
        });

        suiteTeardown(function() {

            if (!connection.db) {
                return;
            }

            return connection.db.dropCollection("users", () => {});
        });
    });

    suite("getByAccountId(id)", function() {

        let user1;

        suiteSetup(function() {
            const userA = new users.User()
            .setAccountId("876vugy4ver")
            .setName("the first user")
            .setEmail("john@example.com")
            .setPermissions(users.Permission.NONE);

            return userA.save()
            .then((user) => {
                user1 = user;
            })
            .catch((err) => {
                logger.error(err);
            });
        });


        test("get a valid userId", function() {

            return users.User.getByAccountId(user1.accountId)
            .then((user) => {

                assert.equal(user.accountId, user1.accountId);
                assert.equal(user.name, user1.name);
                assert.equal(user.email, user1.email);
            })
            .catch((err) => {
                logger.error(err);
                assert.fail("there was an error");
            });
        });

        test("get a non existent user", function() {

            return users.User.getByAccountId("ThisFakeUser")
            .then(() => {

                assert.fail("This does not actually exist");
            })
            .catch((err) => {
                assert.instanceOf(err, errors.user.NotFoundError);
            });
        });

        suiteTeardown(function() {

            if (!connection.db) {
                return;
            }

            return connection.db.dropCollection("users", () => {});
        });
    });

    suite("delete()", function() {

        let user1;
        let user2;

        suiteSetup(function() {
            const userA = new users.User()
            .setAccountId("876vugy4ver")
            .setName("the first user")
            .setEmail("john@example.com")
            .setPermissions(users.Permission.NONE);

            user2 = new users.User()
            .setAccountId("3456yghji8u7y6t")
            .setName("The second")
            .setEmail("bobbert.joe@example.com")
            .setPermissions(users.Permission.NONE);

            return userA.save()
            .then((user) => {
                user1 = user;
            })
            .catch((err) => {
                logger.error(err);
            });
        });

        test("delete a valid userId", function() {

            return user1.delete()
            .then((user) => {
                assert.equal(user.accountId, user1.accountId);
            })
            .catch((err) => {
                logger.error(err);
                assert.fail("Failed to delete");
            });
        });

        test("delete a non existent user ", function() {

            return user2.delete()
            .then(() => {
                assert.fail("This should not have deleted because its not in the db");

            })
            .catch((err) => {
                assert.instanceOf(err, errors.user.NotFoundError);
            });
        });

        test("delete a user that has already been deleted", function() {

            return user1.delete()
            .then(() => {
                assert.fail("This should not have deleted because its has already been removed");

            })
            .catch((err) => {
                assert.instanceOf(err, errors.user.NotFoundError);
            });
        });

        suiteTeardown(function() {

            if (!connection.db) {
                return;
            }

            return connection.db.dropCollection("users", () => {});
        });
    });

    suite("toApiV1()", function() {
        test("check that only the correct fields are present", function() {
            const user = new users.User()
            .setAccountId("8765yu97865rtcfvgbiu78")
            .setName("user with admin")
            .setEmail("email@example.com")
            .setPermissions(users.Permission.NONE);

            assert.hasAllKeys(user.toApiV1(), [
                "id",
                "email",
                "created_at",
                "name",
                "permissions",
            ]);
        });
    });
});
