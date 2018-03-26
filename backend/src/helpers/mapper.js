const {Mapper} = require("tooleks");
const mapper = new Mapper();

mapper.registerResolver("app.user", "api.v1.user", (user) => {
    return {
        id: user.id,
        email: user.email
    };
});

mapper.registerResolver("app.city", "api.v1.city", (city) => {
    return {
        id: city.id,
        name: city.name,
        nameEn: city.nameEn,
        coordinates: city.coordinates.coordinates
    };
});

mapper.registerResolver("api.v1.city", "app.city", (city) => {
    return {
        name: city.name,
        nameEn: city.nameEn,
        coordinates: {
            type: "Point",
            coordinates: [city.coordinates[0], city.coordinates[1]]
        }
    };
});

mapper.registerResolver("app.street", "api.v1.street", (street) => {
    return {
        id: street.id,
        cityId: street.cityId,
        personId: street.personId,
        name: street.name,
        nameEn: street.nameEn,
        oldName: street.oldName,
        description: street.description,
        person: street.person,
        wikiUrl: street.wikiUrl,
        coordinates: street.coordinates.coordinates
    };
});

mapper.registerResolver("api.v1.street", "app.street", (street) => {
    return {
        id: street.id,
        name: street.name,
        nameEn: street.nameEn,
        oldName: street.oldName,
        description: street.description,
        wikiUrl: street.wikiUrl,
        coordinates: {type: "LineString", coordinates: street.coordinates}
    }
});

mapper.registerResolver("app.city.list", "api.v1.city.list", (cities) => {
    return cities.map(city => {return mapper.map(city, "app.city", "api.v1.city");})
});

mapper.registerResolver("app.street.list", "api.v1.street.list", (streets) => {
    return streets.map(street => {return mapper.map(street, "app.street", "api.v1.street");})
});

module.exports = mapper;