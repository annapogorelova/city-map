"use strict";
const chai = require("chai");
const assert = chai.assert;
const chaiHttp = require("chai-http");
const server = require("../../../app");
const testUtils = require("../../testUtils");
const apiRoutes = require("../../apiRoutes");
const constants = require("../../../http/constants/constants");
const userService = testUtils.dc.get("UserService");

chai.use(chaiHttp);

describe("users route", function () {
    beforeEach((done) => {
        testUtils.cleanDB().then(() => {
            done();
        });
    });

    it("should return 401", (done) => {
        const requestUrl = `${testUtils.getApiUrl(apiRoutes.GET_USER)}/1`;
        chai.request(server)
            .get(requestUrl)
            .end((err, res) => {
                assert.equal(res.status, constants.statusCodes.UNAUTHORIZED);
                assert.exists(res.body.message);
                assert.equal(res.body.message, constants.messages.ACCESS_TOKEN_INCORRECT_FORMAT);
                done();
            });
    });

    it("should get the info of the existing user", (done) => {
        (async () => {
            const testUser = testUtils.getUser();
            const user = await userService.create({email: testUser.email, password: testUser.password});
            const authResponse = await testUtils.authorize(testUser.email, testUser.password, server);

            assert.isTrue(authResponse.body.auth);
            assert.exists(authResponse.body.access_token);

            const requestUrl = `${testUtils.getApiUrl(apiRoutes.GET_USER)}/${user.id}`;
            const request = testUtils.getAuthenticatedRequest(
                requestUrl,
                authResponse.body.access_token,
                server,
                "get");
            request
                .end((err, res) => {
                    assert.equal(res.status, constants.statusCodes.OK);
                    assert.exists(res.body.id);
                    assert.equal(res.body.id, user.id);
                    assert.exists(res.body.email);
                    assert.equal(res.body.email, user.email);
                    assert.notExists(res.body.password);
                    done();
                });
        })();
    });

    it("should register a new user", (done) => {
        const testUser = testUtils.getUser();

        chai.request(server)
            .post(testUtils.getApiUrl(apiRoutes.REGISTER))
            .set("Content-Type", "application/json")
            .send({email: testUser.email, password: testUser.password})
            .end((err, res) => {
                assert.equal(res.status, constants.statusCodes.OK);
                assert.isTrue(res.body.auth);
                assert.exists(res.body.access_token);
                (async () => {
                    const createdUser = await userService.getByEmail(testUser.email);
                    assert.equal(createdUser.email, testUser.email);
                    done();
                })();
            });
    });

    it("should not register the existing user", (done) => {
        (async () => {
            const testUser = testUtils.getUser();
            const user = await userService.create({email: testUser.email, password: testUser.password});

            chai.request(server)
                .post(testUtils.getApiUrl(apiRoutes.REGISTER))
                .set("Content-Type", "application/json")
                .send({email: user.email, password: user.password})
                .end((err, res) => {
                    assert.equal(res.status, constants.statusCodes.FORBIDDEN);
                    assert.equal(res.body.message, constants.messages.USER_ALREADY_EXISTS);
                    assert.isFalse(res.body.auth);
                    assert.notExists(res.body.access_token);
                    done();
                });
        })();
    });

    it("should not authorize the malformed access token", (done) => {
        const incorrectAccessTokens = [
            "incorrecttoken918n-_=!,.swohqwuiqqoooq929 28993hdh 29398383",
            "Bearer",
            "Bearer "
        ];
        const requests = [];

        incorrectAccessTokens.forEach(token => {
            const request = testUtils.getAuthenticatedRequest(
                `${testUtils.getApiUrl(apiRoutes.GET_USER)}/1`,
                token,
                server,
                "get");
            requests.push(request);
        });

        requests.forEach(request => {
            request.end((err, res) => {
                assert.equal(res.status, constants.statusCodes.BAD_REQUEST);
                assert.exists(res.body.message);
                assert.equal(res.body.message, constants.messages.ACCESS_TOKEN_INCORRECT_FORMAT);
            });
        });

        done();
    });

    it("should not authorize the non existing user", (done) => {
        (async () => {
            const testUser = testUtils.getUser();

            chai.request(server)
                .post(testUtils.getApiUrl(apiRoutes.AUTH))
                .set('Content-Type', 'application/json')
                .send({email: testUser.email, password: testUser.password})
                .end((err, res) => {
                    assert.equal(res.status, constants.statusCodes.UNAUTHORIZED);
                    assert.isFalse(res.body.auth);
                    assert.exists(res.body.message);
                    assert.equal(constants.messages.UNAUTHORIZED, res.body.message);
                    done();
                });
        })();
    });

    it("should not authorize the user with invalid password", (done) => {
        (async () => {
            const testUser = testUtils.getUser();
            const user = await userService.create({email: testUser.email, password: testUser.password});

            chai.request(server)
                .post(testUtils.getApiUrl(apiRoutes.AUTH))
                .set("Content-Type", "application/json")
                .send({email: user.email, password: "invalid"})
                .end((err, res) => {
                    assert.equal(res.status, constants.statusCodes.UNAUTHORIZED);
                    assert.equal(res.body.message, constants.messages.UNAUTHORIZED);
                    assert.isFalse(res.body.auth);
                    assert.notExists(res.body.access_token);
                    done();
                });
        })();
    });

});
