"use strict";

const db = require("../../data/models/index");
const makeUserService = require("./userService");
const makeStreetService = require("./streetService");
const makeCityService = require("./cityService");
const makePersonService = require("./personService");

/**
 * Default data services provider
 * @type {{getUserService(): *, getStreetService(): *, getCityService(): *, getPersonService(): *}}
 */
module.exports = {
    get userService() {
        return makeUserService(db);
    },

    get streetService() {
        return makeStreetService(db);
    },

    get cityService() {
        return makeCityService(db);
    },

    get personService() {
        return makePersonService(db);
    }
};