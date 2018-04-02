export default class StreetService {
    constructor(apiService) {
        this.apiService = apiService;
    }

    getStreetByCoordinates(coordinates) {
        // Remove hardcode
        return this.apiService.get("/streets", {cityId: 2, coordinates: coordinates});
    }
}