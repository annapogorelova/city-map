export default class ApiService {
    constructor(httpClient, apiUrl) {
        this.httpClient = httpClient;
        this.apiUrl = apiUrl;
    }

    get(url, params) {
        return this.httpClient.get(this.getFullUrl(url), {params: params});
    };

    post(url, data) {
        return this.httpClient.post(this.getFullUrl(url), {body: data});
    };

    getFullUrl(url) {
        return `${this.apiUrl}${url}`;
    };
}