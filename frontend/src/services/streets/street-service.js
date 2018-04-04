export default class StreetService {
    constructor(apiService) {
        this.apiService = apiService;
    }

    getStreetByCoordinates(coordinates) {
        return this.apiService.get("/streets", {params: {coordinates: coordinates}});
    }
}