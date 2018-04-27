const {DependencyContainer} = require("tooleks");
const dc = new DependencyContainer();
const db = require("../data/models/index");

// Data & http services
const dataServicesFactory = require("../data/services/dataServicesFactory");
const controllersFactory = require("../http/controllers/controllersFactory");

// Wiki
const WikiApiService = require("../lib/wiki/wikiApiService");
const WikiService = require("../lib/wiki/wikiService");

// Geo
const OverpassGeoDataFormatter = require("../lib/geo/overpassGeoDataFormatter");
const JsonGeoDataProvider = require("../lib/geo/jsonGeoDataProvider");
const GeoParser = require("../lib/geo/geoParser");
const GeoDataService = require("../lib/geo/geoDataService");

// Common
const routesV1 = require("../http/routes/v1");
const express = require("express");
const makeAuthMiddleware = require("../http/middleware/auth");
const mapper = require("../helpers/mapper");

const jwt = require("jsonwebtoken");

// Registration
dc.registerInstance("db", db);
dc.registerBinding("UserService", dataServicesFactory.userService, {dependencies: ["db"]});
dc.registerBinding("CityService", dataServicesFactory.cityService, {dependencies: ["db"]});
dc.registerBinding("StreetService", dataServicesFactory.streetService, {dependencies: ["db"]});
dc.registerBinding("NamedEntityService", dataServicesFactory.namedEntityService, {dependencies: ["db"]});

dc.registerBinding("Mapper", function () {
    return mapper;
}, {singleton: true});

dc.registerBinding("JwtService", function () {
    return jwt;
}, {singleton: true});

dc.registerBinding("AuthController", controllersFactory.authController, {
    dependencies: ["UserService", "JwtService"]
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

dc.registerBinding("NamedEntitiesController", controllersFactory.namedEntitiesController, {
    dependencies: ["NamedEntityService", "Mapper"]
});

dc.registerBinding("AuthMiddleware", makeAuthMiddleware, {
    dependencies: ["UserService", "JwtService"]
});

dc.registerBinding("Router", routesV1, {
    dependencies: [
        express.Router,
        "AuthController",
        "CitiesController",
        "StreetsController",
        "UsersController",
        "NamedEntitiesController",
        "AuthMiddleware"
    ]
});

dc.registerBinding("WikiApiService", WikiApiService, {singleton: true});
dc.registerBinding("WikiService", WikiService, {dependencies: ["WikiApiService"]});

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
        "WikiService",
        "StreetService",
        "NamedEntityService",
        "Mapper"
    ]
});

module.exports = dc;
