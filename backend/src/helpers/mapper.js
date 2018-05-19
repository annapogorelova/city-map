const {Mapper, optional} = require("tooleks");
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
        coordinates: city.coordinates
    };
});

mapper.registerResolver("api.v1.city", "app.city", (city) => {
    return {
        name: city.name,
        nameEn: city.nameEn,
        coordinates: city.coordinates
    };
});

mapper.registerResolver("app.way", "api.v1.way", (way) => {
    return way.coordinates;
});

mapper.registerResolver("app.street", "api.v1.street", async (street) => {
    const namedEntities = await street.getNamedEntities();

    return {
        id: street.id,
        cityId: street.cityId,
        name: street.name,
        nameEn: street.nameEn,
        oldName: street.oldName,
        description: street.description,
        namedEntities: await mapper.map(namedEntities, "app.namedEntity.list", "api.v1.namedEntity.list"),
        wikiUrl: street.wikiUrl,
        ways: optional(() => street.ways.map(w => w.coordinates), []),
        updatedAt: street.updatedAt
    };
});

mapper.registerResolver("api.v1.street", "app.street", (street) => {
    return {
        id: street.id,
        name: street.name,
        nameEn: street.nameEn,
        oldName: street.oldName,
        description: street.description,
        wikiUrl: street.wikiUrl
    };
});

mapper.registerResolver("app.city.list", "api.v1.city.list", (cities) => {
    return cities.map(city => mapper.map(city, "app.city", "api.v1.city"));
});

mapper.registerResolver("app.street.list", "api.v1.street.list", (streets) => {
    return Promise.all(streets.map(street => mapper.map(street, "app.street", "api.v1.street")));
});

mapper.registerResolver("app.namedEntity", "api.v1.namedEntity", async (namedEntity) => {
    const tags = await optional(async () => namedEntity.getTags(), []);

    return {
        id: namedEntity.id,
        name: namedEntity.name,
        description: namedEntity.description,
        imageUrl: namedEntity.imageUrl,
        wikiUrl: namedEntity.wikiUrl,
        tags: optional(() =>
            mapper.map(tags, "app.tag.list", "api.v1.tag.list"), []),
        updatedAt: namedEntity.updatedAt,
        isLockedForParsing: namedEntity.isLockedForParsing
    };
});

mapper.registerResolver("app.namedEntity.list", "api.v1.namedEntity.list", (namedEntities) => {
    return Promise.all(namedEntities.map(namedEntity => mapper.map(namedEntity, "app.namedEntity", "api.v1.namedEntity")));
});

mapper.registerResolver("app.tag.list", "api.v1.tag.list", (tags) => {
    return tags.map(tag => mapper.map(tag, "app.tag", "api.v1.tag"));
});

mapper.registerResolver("app.tag", "api.v1.tag", (tag) => {
    return {
        id: tag.id,
        name: tag.name
    };
});

module.exports = mapper;