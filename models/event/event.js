
"use strict";

const mongoose = require("mongoose");
const source = require("rfr");
const schema = source("models/event/schema");
const errors = source("models/error");
const logger = source("logger");


const EventModel = mongoose.model("Event", schema);

class Event {

    constructor() {
        this._model = new EventModel({});
    }

    get id() {
        return this._model._id.toString();
    }

    get title() {
        return this._model.title;
    }

    get description() {
        return this._model.description;
    }

    get location() {
        return this._model.location;
    }

    get startTime() {
        return this._model.start_time;
    }

    get endTime() {
        return this._model.end_time;
    }

    get tags() {
        return this._model.tags;
    }

    setTitle(title) {
        this._model.title = title;
        return this;
    }

    setDescription(description) {
        this._model.description = description;
        return this;
    }

    setStartTime(start) {
        this._model.start_time = start;
        return this;
    }

    setEndTime(end) {
        this._model.end_time = end;
        return this;
    }

    setLocation(location) {
        this._model.location = location;
        return this;
    }

    setTags(tags) {
        this._model.tags = tags;
        return this;
    }

    static isValid(event) {
        let err = new errors.event.InvalidFormatError();


        if (typeof event.title !== "string") {
            err.message = `Event title (${event.title}) is not a String.`;
            return Promise.reject(err);
        }

        if (typeof event.location !== "string") {
            err.message = `Event name (${event.location}) is not a String.`;
            return Promise.reject(err);
        }

        if (typeof event.description !== "string") {
            err.message = `Event description (${event.description}) is not a String.`;
            return Promise.reject(err);
        }

        if (!(event.startTime instanceof Date)) {
            err.message = `Event start (${event.startTime}) is not a valid date.`;
            return Promise.reject(err);
        }

        if (!(event.endTime instanceof Date)) {
            err.message = `Event end (${event.endTime}) is not a valid date.`;
            return Promise.reject(err);
        }

        if (event.startTime >= event.endTime) {
            err.message = `Event must start before it begins (${event.startTime}) > (${event.endTime}).`;
            return Promise.reject(err);
        }

        if (!Array.isArray(event.tags)) {
            err.message = `Event tags (${event.tags}) is not an array.`;
            return Promise.reject(err);
        }

        return Promise.resolve(event);
    }

    static getById(id) {

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return Promise.reject(new errors.exec.InvalidFormatError(`id ${id} is not valid.`));
        }

        return EventModel.findById(id).then((found) => {
            if (!found) {
                const err = new errors.event.NotFoundError(`Event ${id} was not found.`);
                return Promise.reject(err);
            }

            let event = new Event();
            event._model = found;

            return Promise.resolve(event);
        });
    }

    static getUpcoming(tag) {

        const now = new Date();

        return EventModel.find({
            tags: tag,
            start_time: {$gt: now, },
        })
        .sort({start_time: "asc", })
        .then((results) => {

            let events = [];
            results.forEach((result) => {
                let event = new Event();
                event._model = result;
                events.push(event);
            });

            return events;
        });
    }

    static getPast(tag) {

        const now = new Date();

        return EventModel.find({
            tags: tag,
            start_time: {$lt: now, },
        })
        .sort({start_time: "desc", })
        .then((results) => {

            let events = [];
            results.forEach((result) => {
                let event = new Event();
                event._model = result;
                events.push(event);
            });

            return events;
        });
    }

    save() {
        return Event.isValid(this).then(() => {
            return this._model.save();
        }).then(() => {
            return this;
        });
    }

    /**
     * delete() removes an event from the database.
     * @return {Promise} resolves with the event if removed successfully
     *                   rejects with error on failure
     */
    delete() {
        return EventModel.deleteOne({
            _id: this.id,
        }).then((result) => {

            if (!result || result.deletedCount === 0) {
                logger.warn("The event could not be deleted because it doesn't exist");
                return Promise.reject(new errors.event.NotFoundError(`Event ${this.id} was not found.`));
            }

            return Promise.resolve(this);
        });
    }

    toApiV1() {
        return {
            id: this.id,
            start_time: this.startTime.toISOString(),
            end_time: this.endTime.toISOString(),
            location: this.location,
            title: this.title,
            description: this.description,
            tags: this.tags,
        };
    }
}

module.exports = Event;