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
            nameEn: model.name,
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
            description: street.description,
            imageUrl: street.imageUrl,
            wikiLink: street.wikiLink,
        };
    },

    mapStreetsToModels(streets) {
        return streets.map(s => {return this.mapStreetToModel(s);});
    }
};