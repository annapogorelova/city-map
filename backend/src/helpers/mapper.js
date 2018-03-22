module.exports = {
    mapUser(user) {
        return {id: user.id, email: user.email};
    },

    mapCityToModel(city) {
        return {
            id: city.id,
            name: city.name,
            nameEn: city.nameEn,
            coordinates: city.coordinates.coordinates
        };
    },

    mapCitiesToModels(cities) {
        return cities.map(c => {return this.mapCityToModel(c);});
    },

    mapModelToCity(model) {
        return {
            name: model.name,
            nameEn: model.nameEn,
            coordinates: {
                type: "Point",
                coordinates: [model.coordinates[0], model.coordinates[1]]
            }
        };
    },

    mapStreetToModel(street) {
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
            wikiUrl: model.wikiUrl,
            coordinates: {type: "LineString", coordinates: model.coordinates}
        }
    }
};