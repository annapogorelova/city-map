"use strict";

const apiRoutes = require("../../app/constants/httpConstants").apiRoutes;

function makeRouter(
    router,
    authController,
    citiesController,
    streetsController,
    usersController,
    namedEntitiesController,
    contactController,
    authMiddleware
) {

    /**
     * @api {post} /api/v1/auth/ Log in user
     * @apiVersion 1.0.0
     * @apiName PostAuth
     * @apiGroup UserAPI
     * @apiDescription Post user credentials, request the HTTP-only cookie, and user data.
     * @apiParamExample {json} Request Body Example:
     *  {
     *      "email": "test@gmail.com",
     *      "password": "test"
     *  }
     *  @apiHeaderExample {json} Header-Example:
     *  {
     *      "Content-Type": "application/json; charset=utf-8"
     *  }
     *  @apiSuccess {Number} data.user.id User id
     *  @apiSuccess {String} data.user.email User email
     *  @apiSuccess {String} data.user.expiresAt authentication expiration date
     *  @apiSuccessExample {json} Success-Response:
     *  HTTP/1.1 200 OK
     *  {
     *      "data": {
     *          "user": {
     *              "id": 1
     *              "email": "test@gmail.com",
     *              "expiresAt": "2018-07-20T23:55:51.954Z",
     *          }
     *      }
     *  }
     */
    router.post(apiRoutes.AUTH, authController.postAuth);

    /**
     * @api {delete} /api/v1/auth/ Log out user
     * @apiVersion 1.0.0
     * @apiName DeleteAuth
     * @apiGroup UserAPI
     * @apiDescription Request server to log out the user.
     */
    router.delete(apiRoutes.AUTH,
        authMiddleware.extractAuth,
        authMiddleware.verifyAuth,
        authController.expireAuth);

    /**
     * @api {get} /api/v1/users/:id Get user's data by id
     * @apiVersion 1.0.0
     * @apiName GetUser
     * @apiGroup UserAPI
     * @apiParam {Number} id User id
     * @apiDescription Retrieve user data.
     * @apiSuccess {Number} data.id User id
     * @apiSuccess {String} data.email User email
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK {
     *      "data": {
     *          "id": 1,
     *          "email": "test@gmail.com"
     *      }
     * }
     */
    router.get(`${apiRoutes.USERS}/:id`,
        authMiddleware.extractAuth,
        authMiddleware.verifyAuth,
        usersController.getUser);

    /**
     * @api {get} /api/v1/cities/:id/streets?search=:search&offset=:offset&limit=:limit Search city streets by name
     * @apiVersion 1.0.0
     * @apiName GetCityStreets
     * @apiGroup StreetsAPI
     * @apiParam {Number} id City id
     * @apiParam {String} search Street name search string
     * @apiParam {Number} offset Pagination zero-based offset
     * @apiParam {Number} limit Page size, defaults to 5
     * @apiDescription Retrieve streets by the city.
     * @apiSuccess {Array} data Array of streets found by the specified criteria
     * @apiSuccess {Number} count Total count of streets found by the specified criteria
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK {
     *      "data": [
     *          {
     *              "id": 9834,
     *              "cityId": 1,
     *              "name": "Івана Франка вулиця",
     *              "nameEn": "Ivana Franka Street",
     *              "oldName": null,
     *              "description": null,
     *              "namedEntities": [
     *                  {
     *                      "id": 5211,
     *                      "name": "Франко Іван Якович",
     *                      "description": "Іван Якович Франко - український письменник",
     *                      "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/6/60/%D0%86%D0%B2%D0%B0%D0%BD_%D0%A4%D1%80%D0%B0%D0%BD%D0%BA%D0%BE.jpg",
     *                      "wikiUrl": "https://uk.wikipedia.org/wiki/%D0%A4%D1%80%D0%B0%D0%BD%D0%BA%D0%BE_%D0%86%D0%B2%D0%B0%D0%BD_%D0%AF%D0%BA%D0%BE%D0%B2%D0%B8%D1%87",
     *                      "tags": [
     *                          {
     *                              "id": 1,
     *                              "name": "письменники"
     *                          },
     *                          {
     *                              "id": 31,
     *                              "name": "публіцисти"
     *                          },
     *                     ],
     *                     "updatedAt": "2018-05-15T11:04:49.000Z",
     *                     "isLockedForParsing": true
     *            }],
     *            "wikiUrl": "https://uk.wikipedia.org/wiki/%D0%92%D1%83%D0%BB%D0%B8%D1%86%D1%8F_%D0%86%D0%B2%D0%B0%D0%BD%D0%B0_%D0%A4%D1%80%D0%B0%D0%BD%D0%BA%D0%B0_(%D0%9B%D1%8C%D0%B2%D1%96%D0%B2)",
     *            "ways": [
     *                  [
     *                      [49.8302409,24.0317359],
     *                      [49.8304874,24.032091],
     *                      [49.8306188,24.0322804],
     *                      [49.8307031,24.0324018]
     *                  ]
     *            ],
     *            "updatedAt":"2018-06-14T07:48:19.000Z"
     *          }
     *      ],
     *      "count":2
     * }
     */
    router.get(`${apiRoutes.CITIES}/:cityId/${apiRoutes.STREETS}`,
        authMiddleware.extractAuth,
        streetsController.searchCityStreets);

    /**
     * @api {get} /api/v1/streets?cityId=:cityId&lat=:lat&lng=:lng Search streets by coordinates
     * @apiVersion 1.0.0
     * @apiName GetStreetByCoordinates
     * @apiGroup StreetsAPI
     * @apiParam {Number} cityId City id
     * @apiParam {Number} lat Latitude
     * @apiParam {Number} lng Longitude
     * @apiDescription Retrieve street by coordinates.
     * @apiSuccess {Object} data Found street data
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK {
     *      "data": {
     *              "id":9834,
     *              "cityId":1,
     *              "name":"Івана Франка вулиця",
     *              "nameEn":"Ivana Franka Street",
     *              "oldName":null,
     *              "description":null,
     *              "namedEntities": [
     *                  {
     *                      "id": 5211,
     *                      "name": "Франко Іван Якович",
     *                      "description": "Іван Якович Франко - український письменник",
     *                      "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/6/60/%D0%86%D0%B2%D0%B0%D0%BD_%D0%A4%D1%80%D0%B0%D0%BD%D0%BA%D0%BE.jpg",
     *                      "wikiUrl": "https://uk.wikipedia.org/wiki/%D0%A4%D1%80%D0%B0%D0%BD%D0%BA%D0%BE_%D0%86%D0%B2%D0%B0%D0%BD_%D0%AF%D0%BA%D0%BE%D0%B2%D0%B8%D1%87",
     *                      "tags": [
     *                          {
     *                              "id": 1,
     *                              "name": "письменники"
     *                          },
     *                          {
     *                              "id": 31,
     *                              "name": "публіцисти"
     *                          },
     *                     ],
     *                     "updatedAt": "2018-05-15T11:04:49.000Z",
     *                     "isLockedForParsing": true
     *            }],
     *            "wikiUrl": "https://uk.wikipedia.org/wiki/%D0%92%D1%83%D0%BB%D0%B8%D1%86%D1%8F_%D0%86%D0%B2%D0%B0%D0%BD%D0%B0_%D0%A4%D1%80%D0%B0%D0%BD%D0%BA%D0%B0_(%D0%9B%D1%8C%D0%B2%D1%96%D0%B2)",
     *            "ways": [
     *                  [
     *                       [49.8302409,24.0317359],
     *                       [49.8304874,24.032091],
     *                       [49.8306188,24.0322804],
     *                       [49.8307031,24.0324018]
     *                  ]
     *            ],
     *            "updatedAt":"2018-06-14T07:48:19.000Z"
     *      }
     * }
     */
    router.get(`/${apiRoutes.STREETS}`,
        authMiddleware.extractAuth,
        streetsController.searchStreetsByCoordinates);

    /**
     * @api {put} /api/v1/streets/:id Update the existing street
     * @apiVersion 1.0.0
     * @apiName PutStreet
     * @apiGroup StreetsAPI
     * @apiParam {Number} id Street id
     * @apiParamExample {json} Request Body Example:
     *  {
     *      "name": "Нова вулиця",
     *      "nameEn": "Nova vulytsya",
     *      "description": "Нова вулиця - вулиця у Франківському районі Львова"
     *  }
     *  @apiHeaderExample {json} Header-Example:
     *  {
     *      "Content-Type": "application/json; charset=utf-8"
     *  }
     * @apiDescription Update the existing street.
     * @apiSuccess {Object} data Updated street message
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK {
     *      "data": {
     *          "message": "Street was successfully updated."
     *      }
     * }
     */
    router.put(`/${apiRoutes.STREETS}/:id`,
        authMiddleware.extractAuth,
        authMiddleware.verifyAuth,
        streetsController.update);

    /**
     * @api {get} /api/v1/cities/:id Get city by id
     * @apiVersion 1.0.0
     * @apiName GetCity
     * @apiGroup CitiesAPI
     * @apiParam {Number} id City id
     * @apiDescription Get city by id.
     * @apiSuccess {Number} data.id City id
     * @apiSuccess {String} data.name City name in Ukrainian
     * @apiSuccess {String} data.nameEn City name in English
     * @apiSuccess {Array} data.coordinates Array of city center coordinates; first latitude, second - longitude
     * @apiSuccess {Array} data.bounds Array of arrays of city bounds coordinates; first latitude, second - longitude
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK {
     *      "data": {
     *          "id": 1,
     *          "name": "Львів",
     *          "nameEn": "Lviv",
     *          "coordinates": [49.843088, 24.026284],
     *          "bounds": [
     *              [
     *                  [49.76783,23.857346],
     *                  [49.76783,24.162016],
     *                  [49.928009,24.162016],
     *                  [49.928009,23.857346],
     *                  [49.76783,23.857346]
     *              ]
     *          ]
     *      }
     * }
     */
    router.get(`${apiRoutes.CITIES}/:id`,
        authMiddleware.extractAuth,
        authMiddleware.verifyAuth,
        citiesController.getCity);

    /**
     * @api {get} /api/v1/cities?offset=:offset&limit=:limit&search=:search Get cities
     * @apiVersion 1.0.0
     * @apiName GetCities
     * @apiGroup CitiesAPI
     * @apiDescription Get cities (optionally search by name).
     * @apiParam {Number} offset Pagination zero-based offset
     * @apiParam {Number} limit Page size, defaults to 5
     * @apiParam {String} search City name search string
     * @apiSuccess {Array} data Array of cities found by the specified criteria
     * @apiSuccess {Number} count Total number of cities found by the specified criteria
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK {
     *      "data": [
     *          {
     *              "id": 1,
     *              "name": "Львів",
     *              "nameEn": "Lviv",
     *              "coordinates": [49.843088, 24.026284],
     *              "bounds": [
     *                  [
     *                      [49.76783,23.857346],
     *                      [49.76783,24.162016],
     *                      [49.928009,24.162016],
     *                      [49.928009,23.857346],
     *                      [49.76783,23.857346]
     *                  ]
     *               ]
     *          },
     *          {
     *              "id": 2,
     *              "name": "Володимир-Волинський",
     *              "nameEn": "Volodymyr-Volynskyi",
     *              "coordinates": [50.845935, 24.318773],
     *              "bounds": [
     *                  [
     *                      [50.816284, 24.264795],
     *                      [50.816284, 24.384825],
     *                      [50.87785, 24.384825],
     *                      [50.87785, 24.264795],
     *                      [50.816284, 24.264795]
     *                  ]
     *              ]
     *          }
     *      ]
     * }
     */
    router.get(apiRoutes.CITIES,
        authMiddleware.extractAuth,
        citiesController.searchCities);

    /**
     * @api {post} /api/v1/cities/ Post city
     * @apiVersion 1.0.0
     * @apiName PostCity
     * @apiGroup CitiesAPI
     * @apiDescription Create a new city.
     * @apiParamExample {json} Request Body Example:
     * {
     *      "name": "Львів",
     *      "nameEn": "Lviv",
     *      "coordinates": [49.843088, 24.026284],
     *      "bounds": [
     *          [
     *              [50.816284, 24.264795],
     *              [50.816284, 24.384825],
     *              [50.87785, 24.384825],
     *              [50.87785, 24.264795],
     *              [50.816284, 24.264795]
     *          ]
     *       ]
     * }
     * @apiHeaderExample {json} Header-Example:
     * {
     *      "Content-Type": "application/json; charset=utf-8"
     * }
     * @apiSuccess {Object} data Created city object
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK {
     *      "data": {
     *          "id": 1,
     *          "name": "Львів",
     *          "nameEn": "Lviv",
     *          "coordinates": [49.843088, 24.026284],
     *          "bounds": [
     *              [
     *                  [50.816284, 24.264795],
     *                  [50.816284, 24.384825],
     *                  [50.87785, 24.384825],
     *                  [50.87785, 24.264795],
     *                  [50.816284, 24.264795]
     *              ]
     *          ]
     *      }
     * }
     */
    router.post(apiRoutes.CITIES,
        authMiddleware.extractAuth,
        authMiddleware.verifyAuth,
        citiesController.createCity);

    /**
     * @api {post} /api/v1/namedEntities/ Post named entity
     * @apiVersion 1.0.0
     * @apiName PostNamedEntity
     * @apiGroup NamedEntitiesAPI
     * @apiDescription Create a named entity.
     * @apiHeaderExample {json} Header-Example:
     * {
     *      "Content-Type": "application/json; charset=utf-8"
     * }
     * @apiParamExample {json} Request Body Example:
     * {
     *      "name": "Іван Франко",
     *      "description": "Іван Франко - український письменник",
     *      "wikiUrl": "https://uk.wikipedia.org/wiki/%D0%A4%D1%80%D0%B0%D0%BD%D0%BA%D0%BE_%D0%86%D0%B2%D0%B0%D0%BD_%D0%AF%D0%BA%D0%BE%D0%B2%D0%B8%D1%87",
     *      "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/a/ab/%D0%A4%D1%80%D0%B0%D0%BD%D0%BA%D0%BE_%D0%86%D0%B2%D0%B0%D0%BD.jpg",
     *      "isLockedForParsing": true,
     *      "tags": [
     *          {
     *              "name": "письменники"
     *          }
     *      ]
     * }
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK {
     *      "data": {
     *          "message": "Named entity was successfully created."
     *      }
     * }
     */
    router.post(apiRoutes.NAMED_ENTITIES,
        authMiddleware.extractAuth,
        authMiddleware.verifyAuth,
        namedEntitiesController.create);

    /**
     * @api {put} /api/v1/namedEntities/:id Put named entity
     * @apiVersion 1.0.0
     * @apiName PutNamedEntity
     * @apiGroup NamedEntitiesAPI
     * @apiParam {Number} id Named entity id
     * @apiHeaderExample {json} Header-Example:
     * {
     *      "Content-Type": "application/json; charset=utf-8"
     * }
     * @apiParamExample {json} Request Body Example:
     * {
     *      "id": 1,
     *      "name": "Іван Якович Франко",
     *      "description": "Іван Франко - український письменник",
     *      "wikiUrl": "https://uk.wikipedia.org/wiki/%D0%A4%D1%80%D0%B0%D0%BD%D0%BA%D0%BE_%D0%86%D0%B2%D0%B0%D0%BD_%D0%AF%D0%BA%D0%BE%D0%B2%D0%B8%D1%87",
     *      "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/a/ab/%D0%A4%D1%80%D0%B0%D0%BD%D0%BA%D0%BE_%D0%86%D0%B2%D0%B0%D0%BD.jpg",
     *      "isLockedForParsing": true,
     *      "tags": [
     *          {
     *              "id": 101,
     *              "name": "письменники"
     *          },
     *          {
     *              "id": 102,
     *              "name": "поети"
     *          },
     *          {
     *              "name": "культурні діячі"
     *          }
     *      ]
     * }
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK {
     *      "data": {
     *          "message": "Named entity was successfully updated."
     *      }
     * }
     */
    router.put(`${apiRoutes.NAMED_ENTITIES}/:id`,
        authMiddleware.extractAuth,
        authMiddleware.verifyAuth,
        namedEntitiesController.update);

    /**
     * @api {delete} /api/v1/namedEntities/:id Delete named entity
     * @apiVersion 1.0.0
     * @apiName DeleteNamedEntity
     * @apiGroup NamedEntitiesAPI
     * @apiParam {Number} id Named entity id
     */
    router.delete(`${apiRoutes.NAMED_ENTITIES}/:id`,
        authMiddleware.extractAuth,
        authMiddleware.verifyAuth,
        namedEntitiesController.remove);

    /**
     * @api {get} /api/v1/namedEntities?offset=:offset&limit=:limit&search=:search Get named entities
     * @apiVersion 1.0.0
     * @apiName GetNamedEntities
     * @apiGroup NamedEntitiesAPI
     * @apiParam {Number} offset Pagination zero-based offset
     * @apiParam {Number} limit Page size, defaults to 5
     * @apiParam {String} search Named entity name search phrase
     * @apiSuccess {Array} data Array of named entities found by the specified criteria
     * @apiSuccess {Number} count Total count of named entities found by the specified criteria
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK {
     *      "data": [
     *          {
     *              "id": 1,
     *              "name": "Цинкаловський Олександр Миколайович",
     *              "description": "Олександр Миколайович Цинкаловський (пол. Aleksander Cynkaowski, рос. Александр Цинкаловский, 9 січня 1898, Володимир-Волинський, Волинська губернія — 19 квітня 1983, Краків, Польська Народна Республіка) — історик, музеолог, археолог, етнограф, дослідник Волині.",
     *              "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/1/11/%D0%9E%D0%BB%D0%B5%D0%BA%D1%81%D0%B0%D0%BD%D0%B4%D1%80_%D0%A6%D0%B8%D0%BD%D0%BA%D0%B0%D0%BB%D0%BE%D0%B2%D1%81%D1%8C%D0%BA%D0%B8%D0%B9_%D1%81%D0%BF%D1%83%D0%B4%D0%B5%D0%B9.PNG",
     *              "wikiUrl": "https://uk.wikipedia.org/wiki/%D0%A6%D0%B8%D0%BD%D0%BA%D0%B0%D0%BB%D0%BE%D0%B2%D1%81%D1%8C%D0%BA%D0%B8%D0%B9_%D0%9E%D0%BB%D0%B5%D0%BA%D1%81%D0%B0%D0%BD%D0%B4%D1%80_%D0%9C%D0%B8%D0%BA%D0%BE%D0%BB%D0%B0%D0%B9%D0%BE%D0%B2%D0%B8%D1%87",
     *              "isLockedForParsing": true,
     *              "tags": [
     *                  {
     *                      "id": 1,
     *                      "name": "історики"
     *                  },
     *                  {
     *                      "id": 2,
     *                      "name": "археологи"
     *                  }
     *              ]
     *          },
     *          {
     *              "id": 2,
     *              "name": "Єфремов Сергій Олександрович",
     *              "description": "Єфремов Сергій Олександрович (колишнє прізвище предків — Охріменко; 6 18 жовтня 1876, Пальчик, тепер Катеринопільського району Черкаської області — 10 березня 1939) — український громадсько-політичний і державний діяч, літературний критик, історик літератури, академік Української академії наук (з 1919), віце-президент ВУАН (з 1922), дійсний член Наукового товариства ім. Т. Шевченка у Львові, публіцист, один із творців української журналістики.",
     *              "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/d/d4/%D0%84%D1%84%D1%80%D0%B5%D0%BC%D0%BE%D0%B2_%D0%A12.jpg",
     *              "wikiUrl": "https://uk.wikipedia.org/wiki/%D0%84%D1%84%D1%80%D0%B5%D0%BC%D0%BE%D0%B2_%D0%A1%D0%B5%D1%80%D0%B3%D1%96%D0%B9_%D0%9E%D0%BB%D0%B5%D0%BA%D1%81%D0%B0%D0%BD%D0%B4%D1%80%D0%BE%D0%B2%D0%B8%D1%87",
     *              "isLockedForParsing": true,
     *              "tags": [
     *                  {
     *                      "id": 3,
     *                      "name": "науковці"
     *                  }
     *              ]
     *          }
     *      ],
     *      "count": 2
     * }
     */
    router.get(apiRoutes.NAMED_ENTITIES,
        authMiddleware.extractAuth,
        authMiddleware.verifyAuth,
        namedEntitiesController.search);

    /**
     * @api {post} /api/v1/contact/ Post "Contact me" message
     * @apiVersion 1.0.0
     * @apiName PostContactMe
     * @apiGroup ContactMeAPI
     * @apiParamExample {json} Request Body Example:
     *  {
     *      "name": "Anna",
     *      "email": "test@gmail.com",
     *      "message": "Дякую за чудову роботу! Так тримати!",
     *      "reCaptchaToken": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
     *  }
     * @apiDescription Post the contact form message to be mailed to the author of the project.
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK {
     *      "message": "Message wa successfuly sent."
     * }
     */
    router.post(apiRoutes.CONTACT,
        authMiddleware.extractAuth,
        contactController.sendMessage);

    return router;
}

module.exports = makeRouter;