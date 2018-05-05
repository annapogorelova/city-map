export default class CitiesService {
    constructor(apiService) {
        this.apiService = apiService;
    }

    getCities() {
        return this.apiService.get("/cities");
    }
}