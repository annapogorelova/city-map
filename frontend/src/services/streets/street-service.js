export default class StreetService {
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

    getStreetByCoordinates(coordinates) {
        return this.apiService.get("/streets", {params: {coordinates: coordinates}});
    }
}