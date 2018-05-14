export default class StreetsService {
    constructor(apiService) {
        this.apiService = apiService;
    }

    search({cityId, search, offset, limit}) {
        return this.apiService.get(`/cities/${cityId}/streets`, {
            search: search,
            offset: offset,
            limit: limit
        });
    }

    getStreetByCoordinates({cityId, coordinates}) {
        return this.apiService.get("/streets", {cityId: cityId, coordinates: coordinates});
    }

    update(street) {
        return this.apiService.put(`/streets/${street.id}`, street);
    }
}