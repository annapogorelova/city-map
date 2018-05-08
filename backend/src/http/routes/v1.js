"use strict";

const apiRoutes = require("../../app/constants/httpConstants").apiRoutes;

function makeRouter(
    router,
    authController,
    citiesController,
    streetsController,
    usersController,
    namedEntitiesController,
    authMiddleware
) {

    router.post(apiRoutes.AUTH, authController.postAuth);

    router.delete(apiRoutes.AUTH,
        authMiddleware.extractAuth,
        authMiddleware.verifyAuth,
        authController.expireAuth);

    router.get(`${apiRoutes.USERS}/:id`,
        authMiddleware.extractAuth,
        authMiddleware.verifyAuth,
        usersController.getUser);

    router.get(`${apiRoutes.CITIES}/:cityId/${apiRoutes.STREETS}`, streetsController.searchCityStreets);

    router.get(`/${apiRoutes.STREETS}`, streetsController.searchStreetsByCoordinates);

    router.put(`/${apiRoutes.STREETS}/:id`,
        authMiddleware.extractAuth,
        authMiddleware.verifyAuth,
        streetsController.update);

    router.get(`${apiRoutes.CITIES}/:id`,
        authMiddleware.extractAuth,
        authMiddleware.verifyAuth,
        citiesController.getCity);

    router.get(apiRoutes.CITIES,
        authMiddleware.extractAuth,
        citiesController.searchCities);

    router.post(apiRoutes.CITIES,
        authMiddleware.extractAuth,
        authMiddleware.verifyAuth,
        citiesController.createCity);

    router.post(apiRoutes.NAMED_ENTITIES,
        authMiddleware.extractAuth,
        authMiddleware.verifyAuth,
        namedEntitiesController.create);

    router.put(`${apiRoutes.NAMED_ENTITIES}/:id`,
        authMiddleware.extractAuth,
        authMiddleware.verifyAuth,
        namedEntitiesController.update);

    router.delete(`${apiRoutes.NAMED_ENTITIES}/:id`,
        authMiddleware.extractAuth,
        authMiddleware.verifyAuth,
        namedEntitiesController.remove);

    router.get(apiRoutes.NAMED_ENTITIES,
        authMiddleware.extractAuth,
        authMiddleware.verifyAuth,
        namedEntitiesController.search);

    return router;
}

module.exports = makeRouter;