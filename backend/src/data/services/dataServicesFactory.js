"use strict";

const makeUserService = require("./userService");
const makeStreetService = require("./streetService");
const makeCityService = require("./cityService");
const makeNamedEntityService = require("./namedEntityService");

/**
 * Default data services provider
 * @type {{userService(): *, streetService(): *, cityService(): *, namedEntityService(): *}}
 */
module.exports = {
    userService: makeUserService,
    streetService: makeStreetService,
    cityService: makeCityService,
    namedEntityService: makeNamedEntityService
};