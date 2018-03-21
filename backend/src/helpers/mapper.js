module.exports = {
    mapUser(user) {
        return {id: user.id, email: user.email};
    },

    mapCityToModel(city) {
        return {
            id: city.id,
            name: city.name,
            nameEn: city.nameEn,
            coords: city.coords.coordinates
        };
    },

    mapCitiesToModels(cities) {
        return cities.map(c => {return this.mapCityToModel(c);});
    },

    mapModelToCity(model) {
        return {
            name: model.name,
            nameEn: model.nameEn,
            coords: {
                type: "Point",
                coordinates: [model.coords[0], model.coords[1]]
            }
        };
    },

    mapStreetToModel(street) {
        return {
            id: street.id,
            name: street.name,
            nameEn: street.name,
            oldName: street.oldName,
            description: street.description,
            namedAfterDescription: street.namedAfterDescription,
            imageUrl: street.imageUrl,
            wikiUrl: street.wikiUrl,
            namedAfterWikiUrl: street.namedAfterWikiUrl,
            coords: street.coords.coordinates
        };
    },

    mapStreetsToModels(streets) {
        return streets.map(s => {return this.mapStreetToModel(s);});
    },

    mapModelToStreet(model) {
        return {
            id: model.id,
            name: model.name,
            nameEn: model.nameEn,
            oldName: model.oldName,
            description: model.description,
            namedAfterDescription: model.namedAfterDescription,
            imageUrl: model.imageUrl,
            wikiUrl: model.wikiUrl,
            namedAfterWikiUrl: model.namedAfterWikiUrl,
            coords: {type: "LineString", coordinates: model.coords}
        }
    }
};