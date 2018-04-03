"use strict";

const makeUserService = require("./userService");
const makeStreetService = require("./streetService");
const makeCityService = require("./cityService");
const makePersonService = require("./personService");

/**
 * Default data services provider
 * @type {{userService(): *, streetService(): *, cityService(): *, personService(): *}}
 */
module.exports = {
    userService: makeUserService,
    streetService: makeStreetService,
    cityService: makeCityService,
    personService: makePersonService
};