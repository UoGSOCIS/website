
"use strict";

const mongoose = require("mongoose");
const validator = require("validator");
const source = require("rfr");
const schema = source("models/exec/schema");
const errors = source("models/error");


const ExecModel = mongoose.model("Exec", schema);


class Exec {

    constructor() {
        this._model = new ExecModel({});
    }

    get _mongoId() {
        return this._model._id;
    }

    get uuid() {
        return this._model.uuid;
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

    setUuid(uuid) {
        this._model.uuid = uuid;
        return this;
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


        if (exec.order && Number.isInteger(exec.order)) {
            err.message = `Exec order  (${exec.order}) is not valid, must be an integer.`;
            return Promise.reject(err);
        }

        if (typeof exec.uuid !== "string" || !validator.isUUID(exec.uuid, 4)) {
            err.message = `Exec UUID (${exec.uuid}) is not valid.`;
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

    static getExecForYear(year) {

        return ExecModel.find({year: year, })
        .sort({order: "asc", })
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

    save() {
        return Exec.isValid(this).then(() => {
            return this._model.save();
        }).then(() => {
            return this;
        });
    }

}


module.exports = Exec;