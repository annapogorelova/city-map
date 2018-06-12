import sinon from "sinon";
import axios from "axios";
import ApiService from "../../../src/services/api/api-service";
import dc from "../../../src/dependency-container/index";

describe("ApiService test", () => {
    let apiService = dc.get("api");
    let testData = {id: 1, email: "test@mail.com"};
    let dataHandlerStub, errorHandlerStub;
    let error = {message: "Failed", status: 500};
    let commonRequestOptions = {
        timeout: apiService.requestTimeout,
        withCredentials: true
    };

    beforeEach((done) => {
        dataHandlerStub = sinon.stub(apiService, "dataHandler").returnsArg(0);
        errorHandlerStub = sinon.stub(apiService, "errorHandler").rejects(error);

        done();
    });

    afterEach((done) => {
        dataHandlerStub.restore();
        errorHandlerStub.restore();

        done();
    });

    it("should create the ApiService instance", (done) => {
        let apiUrl = "http://foo.bar/api";
        let requestTimeout = 3000;
        let dataHandler = () => {};
        let errorHandler = () => {};

        let apiService = new ApiService(axios, apiUrl, requestTimeout, dataHandler, errorHandler);

        expect(apiService.apiUrl).to.equal(apiUrl);
        expect(apiService.requestTimeout).to.equal(requestTimeout);
        expect(apiService.dataHandler).to.equal(dataHandler);
        expect(apiService.errorHandler).to.equal(errorHandler);

        done();
    });

    // GET

    it("should call get method with given params", (done) => {
        let url = "/user";
        let apiResponse = {data: testData};
        let httpGetStub = sinon.stub(apiService.httpClient, "get").resolves(apiResponse);
        let getFullUrlStub = sinon.stub(apiService, "getFullUrl").returns(url);

        apiService.get(url).then(response => {
            expect(response.data).to.equal(testData);
            expect(httpGetStub.calledOnceWith(url, {...commonRequestOptions, params: undefined})).to.equal(true);

            expect(dataHandlerStub.calledOnceWith(apiResponse)).to.equal(true);
            expect(errorHandlerStub.notCalled).to.equal(true);

            httpGetStub.restore();
            getFullUrlStub.restore();

            done();
        });
    });

    it("should catch get method with given error", (done) => {
        let url = "/user";
        let httpGetStub = sinon.stub(apiService.httpClient, "get").rejects();
        let getFullUrlStub = sinon.stub(apiService, "getFullUrl").returns(url);

        apiService.get(url).catch(response => {
            expect(response).to.equal(error);
            expect(httpGetStub.calledOnceWith(url, {...commonRequestOptions, params: undefined})).to.equal(true);

            expect(dataHandlerStub.notCalled).to.equal(true);
            expect(errorHandlerStub.calledOnce).to.equal(true);

            httpGetStub.restore();
            getFullUrlStub.restore();

            done();
        });
    });

    // POST

    it("should call post method with given data", (done) => {
        let url = "/user";
        let apiResponse = {message: "Success", status: 200};
        let httpPostStub = sinon.stub(apiService.httpClient, "post").resolves(apiResponse);
        let getFullUrlStub = sinon.stub(apiService, "getFullUrl").returns(url);

        apiService.post(url, testData).then(response => {
            expect(response).to.equal(apiResponse);
            expect(httpPostStub.calledOnceWith(url, testData, commonRequestOptions)).to.equal(true);

            expect(dataHandlerStub.calledOnce).to.equal(true);
            expect(errorHandlerStub.notCalled).to.equal(true);

            httpPostStub.restore();
            getFullUrlStub.restore();

            done();
        });
    });

    it("should catch post method with given error", (done) => {
        let url = "/user";
        let httpPostStub = sinon.stub(apiService.httpClient, "post").rejects(error);
        let getFullUrlStub = sinon.stub(apiService, "getFullUrl").returns(url);

        apiService.post(url, testData).catch(response => {
            expect(response).to.equal(error);
            expect(httpPostStub.calledOnceWith(url, testData, commonRequestOptions)).to.equal(true);

            expect(dataHandlerStub.notCalled).to.equal(true);
            expect(errorHandlerStub.calledOnce).to.equal(true);

            httpPostStub.restore();
            getFullUrlStub.restore();

            done();
        });
    });

    // PUT

    it("should call put method with given data", (done) => {
        let url = "/user";
        let apiResponse = {message: "Success", status: 200};
        let httpPutStub = sinon.stub(apiService.httpClient, "put").resolves(apiResponse);
        let getFullUrlStub = sinon.stub(apiService, "getFullUrl").returns(url);

        apiService.put(url, testData).then(response => {
            expect(response).to.equal(apiResponse);
            expect(httpPutStub.calledOnceWith(url, testData, commonRequestOptions)).to.equal(true);

            expect(dataHandlerStub.calledOnce).to.equal(true);
            expect(errorHandlerStub.notCalled).to.equal(true);

            httpPutStub.restore();
            getFullUrlStub.restore();

            done();
        });
    });

    it("should catch post method with given error", (done) => {
        let url = "/user";
        let httpPutStub = sinon.stub(apiService.httpClient, "put").rejects(error);
        let getFullUrlStub = sinon.stub(apiService, "getFullUrl").returns(url);

        apiService.put(url, testData).catch(response => {
            expect(response).to.equal(error);
            expect(httpPutStub.calledOnceWith(url, testData, commonRequestOptions)).to.equal(true);

            expect(dataHandlerStub.notCalled).to.equal(true);
            expect(errorHandlerStub.calledOnce).to.equal(true);

            httpPutStub.restore();
            getFullUrlStub.restore();

            done();
        });
    });

    // DELETE

    it("should call delete method with given url", (done) => {
        let url = "/user/1";
        let apiResponse = {message: "Success", status: 200};
        let httpDeleteStub = sinon.stub(apiService.httpClient, "delete").resolves(apiResponse);
        let getFullUrlStub = sinon.stub(apiService, "getFullUrl").returns(url);

        apiService.delete(url).then(response => {
            expect(response).to.equal(apiResponse);
            expect(httpDeleteStub.calledOnceWith(url, commonRequestOptions)).to.equal(true);

            expect(dataHandlerStub.calledOnce).to.equal(true);
            expect(errorHandlerStub.notCalled).to.equal(true);

            httpDeleteStub.restore();
            getFullUrlStub.restore();

            done();
        });
    });

    it("should catch delete method with given error", (done) => {
        let url = "/user/1";
        let httpDeleteStub = sinon.stub(apiService.httpClient, "delete").rejects(error);
        let getFullUrlStub = sinon.stub(apiService, "getFullUrl").returns(url);

        apiService.delete(url).catch(response => {
            expect(response).to.equal(error);
            expect(httpDeleteStub.calledOnceWith(url, commonRequestOptions)).to.equal(true);

            expect(dataHandlerStub.notCalled).to.equal(true);
            expect(errorHandlerStub.calledOnce).to.equal(true);

            httpDeleteStub.restore();
            getFullUrlStub.restore();

            done();
        });
    });

    // other methods

    it("should get the full api url", (done) => {
        let url = "/user";
        let expectedFullUrl = `${apiService.apiUrl}${url}`;

        let fullUrl = apiService.getFullUrl(url);

        expect(fullUrl).to.equal(expectedFullUrl);

        done();
    });
});