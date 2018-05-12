export default class CitiesService {
    constructor(apiService) {
        this.apiService = apiService;
    }

    getCities(params) {
        return this.apiService.get("/cities", params);
    }
}