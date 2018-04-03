const makeAuthController = require("./authController");
const makeCitiesController = require("./citiesController");
const makeStreetsController = require("./streetsController");
const makeUsersController = require("./usersController");

module.exports = {
    authController: makeAuthController,
    citiesController: makeCitiesController,
    streetsController: makeStreetsController,
    usersController: makeUsersController
};