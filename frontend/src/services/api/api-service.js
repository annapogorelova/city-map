export default class ApiService {
    constructor(httpClient, apiUrl, dataHandler, errorHandler) {
        this.httpClient = httpClient;
        this.apiUrl = apiUrl;
        this.dataHandler = dataHandler;
        this.errorHandler = errorHandler;
    }

    get(url, params) {
        return this.httpClient.get(this.getFullUrl(url), params)
            .then(this.dataHandler)
            .catch(this.errorHandler);
    }

    post(url, data) {
        return this.httpClient.post(this.getFullUrl(url), {body: data})
            .then(this.dataHandler)
            .catch(this.errorHandler);
    }

    getFullUrl(url) {
        return `${this.apiUrl}${url}`;
    }
}