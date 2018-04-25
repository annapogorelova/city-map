export default class StreetService {
    constructor(apiService) {
        this.apiService = apiService;
    }

    search(cityId, streetName) {
        return this.apiService.get(`/cities/${cityId}/streets`, {params: {search: streetName}});
    }

    getStreetByCoordinates(coordinates) {
        return this.apiService.get("/streets", {params: {coordinates: coordinates}});
    }
}