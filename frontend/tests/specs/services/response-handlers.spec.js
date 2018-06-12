import dc from "../../../src/dependency-container/index";
import {dataHandler, errorHandler} from "../../../src/services/api";
import constants from "../../../src/constants";
import sinon from "sinon";

describe("response handlers test", () => {
    let successObjectResponse = {
        data: {
            data: {
                id: 1,
                email: "tolo@mail.com"
            }
        },
        status: 200
    };
    let successListResponse = {
        data: {
            data: [{
                id: 1,
                email: "tolo@mail.com"
            }, {
                id: 2,
                email: "tolo2@mail.com"
            }],
            count: 2
        },
        status: 200
    };

    // dataHandler

    it("should return response with single object from data handler", (done) => {
        let data = dataHandler(successObjectResponse);

        expect(data.data).to.equal(successObjectResponse.data.data);

        done();
    });

    it("should return response with list of objects from data handler", (done) => {
        let data = dataHandler(successListResponse);

        expect(data.data).to.equal(successListResponse.data.data);
        expect(data.count).to.equal(successListResponse.data.count);

        done();
    });

    // errorHandler

    // timeout

    it("should handle the timeout error", (done) => {
        let error = {code: "ECONNABORTED"};
        let noticesErrorSpy = sinon.spy(dc.get("notices"), "error");

        errorHandler(error).catch(error => {
            expect(error).to.be.an("object");
            expect(noticesErrorSpy.calledOnceWith(
                constants.NOTICES.REQUEST_TIMEOUT.title,
                constants.NOTICES.REQUEST_TIMEOUT.message)).to.equal(true);

            noticesErrorSpy.restore();

            done();
        });
    });

    // status >= 400 && status < 500

    it("should handle the request params error and show the error message from response", (done) => {
        let error = {
            response: {
                status: 400,
                data: {
                    message: "Bad Request"
                }
            }
        };

        let noticesErrorSpy = sinon.spy(dc.get("notices"), "error");

        errorHandler(error).catch((response) => {
            expect(response.error).to.equal(error.response.data.message);
            expect(noticesErrorSpy.calledOnceWith(
                constants.NOTICES.REQUEST_PARAMS_ERROR.title,
                error.response.data.message)).to.equal(true);

            noticesErrorSpy.restore();

            done();
        });
    });

    it("should handle the request params error and show the default error message", (done) => {
        let error = {
            response: {
                status: 401
            }
        };

        let noticesErrorSpy = sinon.spy(dc.get("notices"), "error");

        errorHandler(error).catch((response) => {
            expect(response.error).to.equal(undefined);
            expect(noticesErrorSpy.calledOnceWith(
                constants.NOTICES.REQUEST_PARAMS_ERROR.title,
                constants.NOTICES.REQUEST_PARAMS_ERROR.message)).to.equal(true);

            noticesErrorSpy.restore();

            done();
        });
    });

    // status == 500

    it("should handle the internal server error and show the default error message", (done) => {
        let error = {
            response: {
                status: 500
            }
        };

        let noticesErrorSpy = sinon.spy(dc.get("notices"), "error");

        errorHandler(error).catch(() => {
            expect(noticesErrorSpy.calledOnceWith(
                constants.NOTICES.SERVER_ERROR.title,
                constants.NOTICES.SERVER_ERROR.message)).to.equal(true);

            noticesErrorSpy.restore();

            done();
        });
    });
});