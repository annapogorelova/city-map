"use strict";

const chai = require("chai");
const assert = chai.assert;
const testUtils = require("../testUtils");
const testUser = require("../data/dbTestData").user;
const constants = require("../../http/constants/constants");

describe("Auth controller unit tests", () => {
    beforeEach((done) => {
        testUtils.cleanDB().then(() => {
            done();
        });
    });

    it("createUser should return 500 when error is thrown (in getByEmail)", (done) => {
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

            await authController.createUser(req, res);

            assert.equal(constants.statusCodes.INTERNAL_SERVER_ERROR, res.statusCode);
            assert(res.body);
            assert.equal(false, res.body.auth);
            assert.equal(constants.messages.FAILED_TO_CREATE_USER, res.body.message);

            done();
        })();
    });

    it("createUser should return 500 when error is thrown (in create)", (done) => {
        (async () => {
            const mockUserService = {
                getByEmail: () => {
                    return null;
                },
                create: () => {
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

            await authController.createUser(req, res);

            assert.equal(constants.statusCodes.INTERNAL_SERVER_ERROR, res.statusCode);
            assert(res.body);
            assert.equal(false, res.body.auth);
            assert.equal(constants.messages.FAILED_TO_CREATE_USER, res.body.message);

            done();
        })();
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

            await authController.getAuthToken(req, res);

            assert.equal(constants.statusCodes.INTERNAL_SERVER_ERROR, res.statusCode);
            assert(res.body);
            assert.equal(false, res.body.auth);
            assert.equal(constants.messages.PROBLEM_AUTHORIZING, res.body.message);

            done();
        })();
    });
});