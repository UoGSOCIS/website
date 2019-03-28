
"use strict";

const mongoose = require("mongoose");
const source = require("rfr");
const schema = source("models/roboticon/schema");
const errors = source("models/error");


const ChallengeModel = mongoose.model("RoboticonChallenge", schema);


class Challenge {

    constructor() {
        this._model = new ChallengeModel({});
    }

    get _mongoId() {
        return this._model._id;
    }

    get description() {
        return this._model.description;
    }

    get imagePath() {
        return this._model.imagePath;
    }

    get goal() {
        return this._model.goal;
    }

    get parameters() {
        return this._model.parameters;
    }

    get points() {
        return this._model.points;
    }

    get mapPath() {
        return this._model.mapPath;
    }

    get challengeNumber() {
        return this._model.challengeNumber;
    }

    get hidden() {
        return this._model.hidden;
    }

    get year() {
        return this._model.year;
    }

    setDescription(description) {
        this._model.description = description;
        return this;
    }

    setImagePath(imagePath) {
        this._model.imagePath = imagePath;
        return this;
    }

    setGoal(goal) {
        this._model.goal = goal;
        return this;
    }

    setParameters(parameters) {
        this._model.parameters = parameters;
        return this;
    }

    setPoints(points) {
        this._model.points = points;
        return this;
    }

    setMapPath(mapPath) {
        this._model.mapPath = mapPath;
        return this;
    }

    setChallengeNumber(challengeNumber) {
        this._model.challengeNumber = challengeNumber;
        return this;
    }

    setHidden(hidden) {
        this._model.hidden = hidden;
        return this;
    }

    setYear(year) {
        this._model.year = year;
        return this;
    }

    static isValid(challenge) {
        let err = new errors.roboticon.InvalidFormatError();

        if (typeof challenge.description !== "string") {
            err.message = "Challenge description is not valid.";
            return Promise.reject(err);
        }

        if (typeof challenge.goal !== "string") {
            err.message = "Challenge goal is not valid.";
            return Promise.reject(err);
        }

        if (typeof challenge.parameters !== "string") {
            err.message = "Challenge parameters is not a String.";
            return Promise.reject(err);
        }

        if (typeof challenge.points !== "string") {
            err.message = "Challenge points is not a String.";
            return Promise.reject(err);
        }

        if (typeof challenge.challengeNumber !== "number" || challenge.challengeNumber < 1) {
            err.message = "Challenge number is not a Number.";
            return Promise.reject(err);
        }

        if (challenge.mapPath && typeof challenge.mapPath !== "string") {
            err.message = "Challenge map path is not a String.";
            return Promise.reject(err);
        }

        if (challenge.imagePath && typeof challenge.imagePath !== "string") {
            err.message = "Challenge image path is not a String.";
            return Promise.reject(err);
        }

        if (typeof challenge.hidden !== "boolean") {
            err.message = "Challenge hidden is not a Boolean.";
            return Promise.reject(err);
        }

        if (typeof challenge.year !== "number" || challenge.year < 2000 || challenge.year > new Date().getFullYear() + 2) {
            err.message = `Challenge year (${challenge.year}) is not valid.`;
            return Promise.reject(err);
        }

        return Promise.resolve(challenge);
    }

    static getChallengesForYear(year, isPublic) {

        var conditions = {year: year, };

        if (isPublic) {
            conditions.hidden = false;
        }

        return ChallengeModel.find(conditions)
        .sort({challengeNumber: 1, })
        .then((results) => {

            let challenges = [];
            results.forEach((result) => {
                let challenge = new Challenge();
                challenge._model = result;
                challenges.push(challenge);
            });

            return challenges;
        });
    }

    static getChallengesYears() {


        return ChallengeModel.find({})

        .distinct("year")
        .then((results) => {

            let years = [];
            results.forEach((result) => {
                let challenge = new Challenge();
                years._model = result;
                years.push(challenge.year);
            });

            return years;
        });
    }

    save() {
        return Challenge.isValid(this).then(() => {
            return this._model.save();
        }).then(() => {
            return this;
        });
    }

}


module.exports = Challenge;