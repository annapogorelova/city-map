const {DependencyContainer} = require("tooleks");
const dc = new DependencyContainer();
const db = require("../data/models/index");

// Data & http services
const dataServicesFactory = require("../data/services/dataServicesFactory");
const controllersFactory = require("../http/controllers/controllersFactory");

// Wiki
const WikiService = require("../lib/wiki/wikiService");
const StreetWikiService = require("../lib/wiki/streetWikiService");

// Geo
const OverpassGeoDataFormatter = require("../lib/geo/overpassGeoDataFormatter");
const JsonGeoDataProvider = require("../lib/geo/jsonGeoDataProvider");
const GeoParser = require("../lib/geo/geoParser");
const GeoDataService = require("../lib/geo/geoDataService");

// Common
const routesV1 = require("../http/routes/v1");
const express = require("express");
const authMiddleware = require("../http/middleware/auth");
const mapper = require("../helpers/mapper");

// Registration
dc.registerInstance("db", db);
dc.registerBinding("UserService", dataServicesFactory.userService, {dependencies: ["db"]});
dc.registerBinding("CityService", dataServicesFactory.cityService, {dependencies: ["db"]});
dc.registerBinding("StreetService", dataServicesFactory.streetService, {dependencies: ["db"]});
dc.registerBinding("PersonService", dataServicesFactory.personService, {dependencies: ["db"]});

dc.registerBinding("Mapper", function () {
    return mapper;
}, {singleton: true});

dc.registerBinding("AuthController", controllersFactory.authController, {
    dependencies: ["UserService"]
});

dc.registerBinding("CitiesController", controllersFactory.citiesController, {
    dependencies: ["CityService", "Mapper"]
});

dc.registerBinding("StreetsController", controllersFactory.streetsController, {
    dependencies: ["StreetService", "Mapper"]
});

dc.registerBinding("UsersController", controllersFactory.usersController, {
    dependencies: ["UserService", "Mapper"]
});

dc.registerBinding("AuthMiddleware", function () {
    return authMiddleware;
});

dc.registerBinding("Router", routesV1, {
    dependencies: [
        express.Router,
        "AuthController",
        "CitiesController",
        "StreetsController",
        "UsersController",
        "AuthMiddleware"
    ]
});

dc.registerBinding("WikiService", WikiService, {singleton: true});
dc.registerBinding("StreetWikiService", StreetWikiService, {dependencies: ["WikiService"]});

dc.registerBinding("GeoDataFormatter", OverpassGeoDataFormatter, {singleton: true});
dc.registerBinding("GeoDataProvider", JsonGeoDataProvider, {
    dependencies: [
        () => "./data",
        "GeoDataFormatter"
    ]
});
dc.registerBinding("GeoParser", GeoParser, {
    dependencies: [
        "GeoDataProvider",
        "GeoDataFormatter"
    ]
});
dc.registerBinding("GeoDataService", GeoDataService, {
    dependencies: [
        "GeoParser",
        "StreetWikiService",
        "StreetService",
        "PersonService",
        "Mapper"
    ]
});

module.exports = dc;
