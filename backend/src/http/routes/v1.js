"use strict";

function makeRouter(
    router,
    authController,
    citiesController,
    streetsController,
    usersController,
    namedEntitiesController,
    authMiddleware
) {

    router.post("/auth/token", authController.getAuthToken);

    router.post("/auth/register", authController.createUser);

    router.get("/users/:id",
        authMiddleware.extractAuth,
        authMiddleware.verifyAuth,
        usersController.getUser);

    router.get("/cities/:cityId/streets", streetsController.searchCityStreets);

    router.get("/streets", streetsController.searchStreetsByCoordinates);

    router.get("/cities/:id",
        authMiddleware.extractAuth,
        authMiddleware.verifyAuth,
        citiesController.getCity);

    router.get("/cities",
        authMiddleware.extractAuth,
        citiesController.searchCities);

    router.post("/cities",
        authMiddleware.extractAuth,
        authMiddleware.verifyAuth,
        citiesController.createCity);

    router.put("/namedEntities/:id",
        authMiddleware.extractAuth,
        authMiddleware.verifyAuth,
        namedEntitiesController.update);

    router.get("/namedEntities",
        authMiddleware.extractAuth,
        authMiddleware.verifyAuth,
        namedEntitiesController.search);

    return router;
}

module.exports = makeRouter;