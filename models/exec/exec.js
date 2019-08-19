
"use strict";

const mongoose = require("mongoose");
const validator = require("validator");
const source = require("rfr");
const schema = source("models/exec/schema");
const errors = source("models/error");
const logger = source("logger");


const ExecModel = mongoose.model("Exec", schema);


class Exec {

    constructor() {
        this._model = new ExecModel({});
    }

    get _mongoId() {
        return this._model._id;
    }

    get id() {
        return this._model._id.toString();
    }

    get name() {
        return this._model.name;
    }

    get role() {
        return this._model.role;
    }

    get email() {
        return this._model.email;
    }

    get year() {
        return this._model.year;
    }

    get order() {
        return this._model.order;
    }

    setOrder(order) {
        this._model.order = order;
        return this;
    }

    setName(name) {
        this._model.name = name;
        return this;
    }

    setRole(role) {
        this._model.role = role;
        return this;
    }

    setEmail(email) {
        this._model.email = email;
        return this;
    }

    setYear(year) {
        this._model.year = year;
        return this;
    }

    static isValid(exec) {
        let err = new errors.exec.InvalidFormatError();

        if (exec.order && !Number.isInteger(exec.order)) {
            err.message = `Exec order  (${exec.order}) is not valid, must be an integer.`;
            return Promise.reject(err);
        }

        if (typeof exec.email !== "string" || !validator.isEmail(exec.email)) {
            err.message = `Exec email (${exec.email}) is not valid.`;
            return Promise.reject(err);
        }

        if (typeof exec.name !== "string") {
            err.message = `Exec name (${exec.name}) is not a String.`;
            return Promise.reject(err);
        }

        if (typeof exec.role !== "string") {
            err.message = `Exec role (${exec.role}) is not a String.`;
            return Promise.reject(err);
        }

        if (typeof exec.year !== "number" || exec.year < 2000 || exec.year > new Date().getFullYear() + 2) {
            err.message = `Exec year (${exec.year}) is not valid.`;
            return Promise.reject(err);
        }

        return Promise.resolve(exec);
    }

    /**
     * count() retrieves the number of exces from the database.
     *
     * @param {Number} year   - The year of the cohort
     * @return {Promise} resolves with the number of execs in the database;
     *                   rejects with Error
     */
    static count(year) {
        let mongooseQuery = ExecModel.countDocuments({year: year, });

        return mongooseQuery.exec();
    }

    /**
     * getExecForYear(year, searchParams) retrieves the exces from the database.
     *
     * @param {Number} year - The year of the cohort
     * @param {Object} searchParams - An object containing query parameters
     * @param {Number} [searchParams.offset] - The offset into the results
     * @param {Number} [searchParams.limit]  - The limit to the number to count
     * @return {Promise} resolves with the list of execs in the database;
     *                   rejects with Error
     */
    static getExecForYear(year, searchParams) {

        let limit = 20;
        let offset = 0;

        if (searchParams && searchParams.limit) {
            limit = searchParams.limit;
        }

        if (searchParams && searchParams.offset) {
            offset = searchParams.offset;
        }

        return ExecModel.find({year: year, })
        .sort({order: "asc", })
        .skip(offset)
        .limit(limit)
        .then((results) => {

            let execs = [];
            results.forEach((result) => {
                let exec = new Exec();
                exec._model = result;
                execs.push(exec);
            });

            return execs;
        });
    }

    static find(query, searchParams) {
        const limit = searchParams && searchParams.limit ? searchParams.limit : 20;
        const offset = searchParams && searchParams.offset ? searchParams.offset : 0;
        const params = Object.assign({}, query);

        return ExecModel.find(params)
        .sort({order: "asc", })
        .skip(offset)
        .limit(limit)
        .then((results) => {
            let execs = [];
            results.forEach((result) => {
                let exec = new Exec();
                exec._model = result;
                execs.push(exec);
            });

            return execs;
        });
    }

    static getById(id) {

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return Promise.reject(new errors.exec.InvalidFormatError(`id ${id} is not valid.`));
        }

        return ExecModel.findById(id).then((found) => {
            if (!found) {
                const err = new errors.exec.NotFoundError(`Exec ${id} was not found.`);
                return Promise.reject(err);
            }

            let exec = new Exec();
            exec._model = found;

            return Promise.resolve(exec);
        });
    }


    save() {
        return Exec.isValid(this).then(() => {
            return this._model.save();
        }).then(() => {
            return this;
        });
    }

    /**
     * delete() removes an exec from the database.
     * @return {Promise} resolves with the exec if removed successfully
     *                   rejects with error on failure
     */
    delete() {
        return ExecModel.findOneAndDelete({
            _id: this.id,
        }).then((exec) => {
            if (!exec) {

                logger.warn("The exec could not be deleted because it doesn't exist");
                return Promise.reject(new errors.exec.NotFoundError(`Exec ${this.id} was not found.`));
            }

            return Promise.resolve(exec);
        }).catch((err) => {
            logger.error("exec (" + this.id + ") could not be deleted.", err);

            return Promise.reject(err);
        });
    }

    toApiV1() {
        return {
            id: this.id,
            email: this.email,
            name: this.name,
            role: this.role,
            year: this.year,
            order: this.order,
        };
    }
}


module.exports = Exec;