"use strict";
const chai = require("chai");
const assert = chai.assert;
const chaiHttp = require("chai-http");
const server = require("../../../app");
const testUtils = require("../../testUtils");
const httpConstants = require("../../../app/constants/httpConstants");
const userService = testUtils.dc.get("UserService");
const jwt = require("jsonwebtoken");
const config = require("config");

chai.use(chaiHttp);

function _issueToken(payload, secret, expiresIn) {
    return jwt.sign(payload, secret, { expiresIn: expiresIn });
}

describe("users route", function () {
    beforeEach((done) => {
        testUtils.cleanDB().then(() => {
            done();
        });
    });

    it("should return 401", (done) => {
        const requestUrl = `${testUtils.getApiUrl(httpConstants.apiRoutes.USERS)}/1`;
        chai.request(server)
            .get(requestUrl)
            .end((err, res) => {
                assert.equal(res.status, httpConstants.statusCodes.UNAUTHORIZED);
                assert.exists(res.body.message);
                assert.isTrue(res.unauthorized);
                assert.equal(res.body.message, httpConstants.messages.UNAUTHORIZED);
                done();
            });
    });

    it("should get the info of the existing user", (done) => {
        (async () => {
            const testUser = testUtils.getUser();
            const user = await userService.create({email: testUser.email, password: testUser.password});
            const authResponse = await testUtils.authorize(testUser.email, testUser.password, server);

            const requestUrl = `${testUtils.getApiUrl(httpConstants.apiRoutes.USERS)}/${user.id}`;
            const request = testUtils.getAuthenticatedRequest(
                requestUrl,
                authResponse.headers['set-cookie'][0],
                server,
                "get");
            request
                .end((err, res) => {
                    assert.equal(res.status, httpConstants.statusCodes.OK);
                    assert.isFalse(res.unauthorized);
                    assert.exists(res.body.id);
                    assert.equal(res.body.id, user.id);
                    assert.exists(res.body.email);
                    assert.equal(res.body.email, user.email);
                    assert.notExists(res.body.password);
                    done();
                });
        })();
    });

    it("should not authorize the non existing user", (done) => {
        (async () => {
            const testUser = testUtils.getUser();

            chai.request(server)
                .post(testUtils.getApiUrl(httpConstants.apiRoutes.AUTH))
                .set('Content-Type', 'application/json')
                .send({email: testUser.email, password: testUser.password})
                .end((err, res) => {
                    assert.equal(res.status, httpConstants.statusCodes.UNAUTHORIZED);
                    assert.isTrue(res.unauthorized);
                    assert.exists(res.body.message);
                    assert.equal(httpConstants.messages.UNAUTHORIZED, res.body.message);
                    done();
                });
        })();
    });

    it("should not authorize the deleted user with valid cookie", (done) => {
        (async () => {
            const testUser = testUtils.getUser();
            const createdUser = await userService.create(testUser);

            const accessToken = _issueToken(
                { id: createdUser.id },
                config.security.secret,
                config.security.expirationTimeSeconds);
            await createdUser.destroy();

            chai.request(server)
                .post(testUtils.getApiUrl(httpConstants.apiRoutes.AUTH))
                .set('Content-Type', 'application/json')
                .set('Cookie', `${config.security.headerName}=${accessToken}`)
                .send({email: testUser.email, password: testUser.password})
                .end((err, res) => {
                    assert.equal(res.status, httpConstants.statusCodes.UNAUTHORIZED);
                    assert.isTrue(res.unauthorized);
                    assert.exists(res.body.message);
                    assert.equal(httpConstants.messages.UNAUTHORIZED, res.body.message);
                    done();
                });
        })();
    });

    it("should not allow the deleted user with valid cookie to get info", (done) => {
        (async () => {
            const testUser = testUtils.getUser();
            const createdUser = await userService.create(testUser);
            const requestUrl = `${testUtils.getApiUrl(httpConstants.apiRoutes.USERS)}/${createdUser.id}`;

            const accessToken = _issueToken(
                { id: createdUser.id },
                config.security.secret,
                config.security.expirationTimeSeconds);
            await createdUser.destroy();

            chai.request(server)
                .get(requestUrl)
                .set('Cookie', `${config.security.headerName}=${accessToken}`)
                .send({email: testUser.email, password: testUser.password})
                .end((err, res) => {
                    assert.equal(res.status, httpConstants.statusCodes.UNAUTHORIZED);
                    assert.isTrue(res.unauthorized);
                    assert.exists(res.body.message);
                    assert.equal(httpConstants.messages.UNAUTHORIZED, res.body.message);
                    done();
                });
        })();
    });

    it("should not authorize the user with invalid password", (done) => {
        (async () => {
            const testUser = testUtils.getUser();
            const user = await userService.create({email: testUser.email, password: testUser.password});

            chai.request(server)
                .post(testUtils.getApiUrl(httpConstants.apiRoutes.AUTH))
                .set("Content-Type", "application/json")
                .send({email: user.email, password: "invalid"})
                .end((err, res) => {
                    assert.equal(res.status, httpConstants.statusCodes.UNAUTHORIZED);
                    assert.isTrue(res.unauthorized);
                    assert.equal(res.body.message, httpConstants.messages.UNAUTHORIZED);
                    done();
                });
        })();
    });

    it("should log the user out", (done) => {
        (async () => {
            const testUser = testUtils.getUser();
            const createdUser = await userService.create({email: testUser.email, password: testUser.password});

            chai.request(server)
                .post(testUtils.getApiUrl(httpConstants.apiRoutes.AUTH))
                .send({email: testUser.email, password: testUser.password})
                .end((err, res) => {
                    assert.exists(res.headers["set-cookie"]);

                    chai.request(server)
                        .delete(testUtils.getApiUrl(httpConstants.apiRoutes.AUTH))
                        .set("Cookie", res.headers["set-cookie"][0])
                        .end((err, res) => {
                            assert.equal(res.headers["set-cookie"], "x-access-token=; Path=/");

                            const requestUrl = `${testUtils.getApiUrl(httpConstants.apiRoutes.USERS)}/${createdUser.id}`;
                            chai.request(server)
                                .get(requestUrl)
                                .set("Cookie", res.headers["set-cookie"][0])
                                .end((err, res) => {
                                    assert.equal(res.status, httpConstants.statusCodes.UNAUTHORIZED);
                                    done();
                                });
                        });
                });
        })();
    });
});
