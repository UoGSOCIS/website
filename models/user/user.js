
"use strict";

const mongoose = require("mongoose");
const source = require("rfr");
const schema = source("models/user/schema");
const errors = source("models/error");
const logger = source("logger");
const validator = source("validator");

const UserModel = mongoose.model("User", schema);


const Permission = {
    NONE:        0b000000,
    EVENTS:      0b000001,
    SELLER:      0b000010,
    NEWSLETTER:  0b000100,
    MERCHANT:    0b001000,
    ADMIN:       0b010000,
};
Object.freeze(Permission);


class User {

    constructor() {
        this._model = new UserModel({});
    }

    get accountId() {
        return this._model.accountId;
    }

    get name() {
        return this._model.name;
    }

    get email() {
        return this._model.email;
    }

    get permissions() {
        return this._model.permissions;
    }

    get createdAt() {
        return this._model.created_at;
    }

    setAccountId(accountId) {
        this._model.accountId = accountId;
        return this;
    }

    setName(name) {
        this._model.name = name;
        return this;
    }

    setEmail(email) {
        this._model.email = email;
        return this;
    }

    setPermissions(permissions) {
        this._model.permissions = permissions;
        return this;
    }

    hasAdminPermission() {
        return this.permissions !== Permission.NONE;
    }

    hasSuperAdminPermission() {
        return (this.permissions & Permission.ADMIN) === Permission.ADMIN;
    }

    hasMerchantPermission() {
        return this.hasSuperAdminPermission() || (this.permissions & Permission.MERCHANT) === Permission.MERCHANT;
    }

    hasEventPermission() {
        return this.hasSuperAdminPermission() || (this.permissions & Permission.EVENTS) === Permission.EVENTS;
    }

    hasNewsletterPermission() {
        return this.hasSuperAdminPermission() || (this.permissions & Permission.NEWSLETTER) === Permission.NEWSLETTER;
    }

    hasSellerPermission() {
        return this.hasSuperAdminPermission() || (this.permissions & Permission.SELLER) === Permission.SELLER;
    }


    static isValid(user) {
        let err = new errors.user.InvalidFormatError();


        if (typeof user.name !== "string") {
            err.message = `User name (${user.name}) is not a String.`;
            return Promise.reject(err);
        }

        if (!validator.isEmail(user.email)) {
            err.message = `User email (${user.email}) is not a valid email.`;
            return Promise.reject(err);
        }

        if (!(user.createdAt instanceof Date)) {
            err.message = `User creation time (${user.createdAt}) is not a valid date.`;
            return Promise.reject(err);
        }

        return Promise.resolve(user);
    }

    static getByAccountId(id) {

        return UserModel.findOne({accountId: id, }).then((found) => {
            if (!found) {
                const err = new errors.user.NotFoundError(`User ${id} was not found.`);
                return Promise.reject(err);
            }

            let user = new User();
            user._model = found;

            return Promise.resolve(user);
        });
    }

    save() {
        return User.isValid(this).then(() => {
            return this._model.save();
        }).then(() => {
            return this;
        });
    }

    /**
     * delete() removes a user from the database.
     * @return {Promise} resolves with the event if removed successfully
     *                   rejects with error on failure
     */
    delete() {
        return UserModel.deleteOne({
            accountId: this.accountId,
        }).then((result) => {

            if (!result || result.deletedCount === 0) {
                logger.warn("The user could not be deleted because it doesn't exist");
                return Promise.reject(new errors.user.NotFoundError(`User ${this.id} was not found.`));
            }

            return Promise.resolve(this);
        });
    }

    toApiV1() {
        return {
            id: this.accountId,
            name: this.name,
            email: this.email,
            permissions: this.permissions,
            created_at: this.createdAt,
        };
    }
}

module.exports = {
    User: User,
    Permission: Permission,
};