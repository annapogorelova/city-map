export default class CityService {
    constructor(apiService) {
        this.apiService = apiService;
    }

    getCities() {
        return this.apiService.get("/cities");
    }
}