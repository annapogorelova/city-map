const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const authController = require("../controllers/authController");
const usersController = require("../controllers/usersController");
const citiesController = require("../controllers/citiesController");
const streetsController = require("../controllers/streetsController");

router.post("/auth/token", authController.getAuthToken);

router.post("/auth/register", authController.createUser);

router.get("/users/:id", auth.verifyToken, usersController.getUser);

router.get("/cities/:cityId/streets", streetsController.searchCityStreets);

router.get("/streets", streetsController.searchStreetsByCoordinates);

router.get("/cities/:id", auth.verifyToken, citiesController.getCity);

router.get("/cities", citiesController.searchCities);

router.post("/cities", auth.verifyToken, citiesController.createCity);

module.exports = router;