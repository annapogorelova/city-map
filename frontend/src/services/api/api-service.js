export default class ApiService {
    constructor(httpClient, apiUrl, dataHandler, errorHandler) {
        this.httpClient = httpClient;
        this.apiUrl = apiUrl;
        this.dataHandler = dataHandler;
        this.errorHandler = errorHandler;
    }

    get(url, params) {
        return this.httpClient.get(this.getFullUrl(url), {
            params: params,
            timeout: process.env.REQUEST_TIMEOUT,
            withCredentials: true
        }).then(this.dataHandler).catch(this.errorHandler);
    }

    post(url, data) {
        return this.httpClient.post(this.getFullUrl(url), data, {
            withCredentials: true,
            timeout: process.env.REQUEST_TIMEOUT,
        }).then(this.dataHandler).catch(this.errorHandler);
    }

    put(url, data) {
        return this.httpClient.put(this.getFullUrl(url), data, {
            withCredentials: true,
            timeout: process.env.REQUEST_TIMEOUT,
        }).then(this.dataHandler).catch(this.errorHandler);
    }

    delete(url) {
        return this.httpClient.delete(this.getFullUrl(url), {
            withCredentials: true,
            timeout: process.env.REQUEST_TIMEOUT,
        }).then(this.dataHandler).catch(this.errorHandler);
    }

    getFullUrl(url) {
        return `${this.apiUrl}${url}`;
    }
}