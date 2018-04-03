"use strict";

function makeRouter(
    router,
    authController,
    citiesController,
    streetsController,
    usersController,
    authMiddleware
) {

    router.post("/auth/token", authController.getAuthToken);

    router.post("/auth/register", authController.createUser);

    router.get("/users/:id", authMiddleware.verifyToken, usersController.getUser);

    router.get("/cities/:cityId/streets", streetsController.searchCityStreets);

    router.get("/streets", streetsController.searchStreetsByCoordinates);

    router.get("/cities/:id", authMiddleware.verifyToken, citiesController.getCity);

    router.get("/cities", citiesController.searchCities);

    router.post("/cities", authMiddleware.verifyToken, citiesController.createCity);

    return router;
}

module.exports = makeRouter;