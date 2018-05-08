"use strict";

const chai = require("chai");
const assert = chai.assert;
const testUtils = require("../testUtils");
const constants = require("../../app/constants/httpConstants");

describe("Auth controller unit tests", () => {
    const testUser = testUtils.getUser();

    beforeEach((done) => {
        testUtils.cleanDB().then(() => {
            done();
        });
    });

    it("getAuthToken should return 500 when error is thrown (in getByEmail)", (done) => {
        (async () => {
            const mockUserService = {
                getByEmail: () => {
                    throw Error();
                }
            };

            testUtils.dc.registerInstance("UserService", mockUserService);
            const authController = testUtils.dc.get("AuthController");
            const req = {
                body: {email: testUser.email}
            };
            let res = {
                status: function(statusCode) {
                    this.statusCode = statusCode;
                    return this;
                },
                send: function(body) {
                    this.body = body;
                    return this;
                }
            };

            await authController.postAuth(req, res);

            assert.equal(constants.statusCodes.INTERNAL_SERVER_ERROR, res.statusCode);
            assert.equal(constants.messages.PROBLEM_AUTHORIZING, res.body.message);

            done();
        })();
    });
});