export default class ApiService {
    constructor(httpClient, apiUrl, requestTimeout, dataHandler, errorHandler) {
        this.httpClient = httpClient;
        this.apiUrl = apiUrl;
        this.requestTimeout = requestTimeout;
        this.dataHandler = dataHandler;
        this.errorHandler = errorHandler;
    }

    get(url, params) {
        return this.httpClient.get(this.getFullUrl(url), {
            params: params,
            timeout: this.requestTimeout,
            withCredentials: true
        }).then(this.dataHandler).catch(this.errorHandler);
    }

    post(url, data) {
        return this.httpClient.post(this.getFullUrl(url), data, {
            withCredentials: true,
            timeout: this.requestTimeout,
        }).then(this.dataHandler).catch(this.errorHandler);
    }

    put(url, data) {
        return this.httpClient.put(this.getFullUrl(url), data, {
            withCredentials: true,
            timeout: this.requestTimeout,
        }).then(this.dataHandler).catch(this.errorHandler);
    }

    delete(url) {
        return this.httpClient.delete(this.getFullUrl(url), {
            withCredentials: true,
            timeout: this.requestTimeout,
        }).then(this.dataHandler).catch(this.errorHandler);
    }

    getFullUrl(url) {
        return `${this.apiUrl}${url}`;
    }
}