"use strict";
const chai = require("chai");
const assert = chai.assert;
const chaiHttp = require("chai-http");
const server = require("../../../app");
const testUtils = require("../../testUtils");
const apiRoutes = require("../../apiRoutes");
const constants = require("../../../http/constants/constants");
const userService = testUtils.dc.get("UserService");
const testData = require("../../data/dbTestData");
const db = require("../../../data/models/index");

chai.use(chaiHttp);

describe("named entities route test", () => {
    const testUser = require("../../data/dbTestData").user;

    beforeEach((done) => {
        testUtils.cleanDB().then(() => {
            done();
        });
    });

    it("should return 401", (done) => {
        const requestUrl = `${testUtils.getApiUrl(apiRoutes.NAMED_ENTITIES)}`;
        chai.request(server)
            .get(requestUrl)
            .end((err, res) => {
                assert.equal(res.status, constants.statusCodes.UNAUTHORIZED);
                assert.exists(res.body.message);
                assert.equal(res.body.message, constants.messages.ACCESS_TOKEN_INCORRECT_FORMAT);
                done();
            });
    });

    it("should return the empty array", (done) => {
        (async () => {
            await userService.create({email: testUser.email, password: testUser.password});
            const authResponse = await testUtils.authorize(testUser.email, testUser.password, server);

            const requestUrl = `${testUtils.getApiUrl(apiRoutes.NAMED_ENTITIES)}`;
            const request = testUtils.getAuthenticatedRequest(
                requestUrl,
                authResponse.body.access_token,
                server,
                "get");
            request
                .end((err, res) => {
                    assert.equal(res.status, constants.statusCodes.OK);
                    assert.exists(res.body.data);
                    assert.equal(res.body.data.length, 0);
                    assert.equal(res.body.count, 0);
                    done();
                });
        })();
    });

    it("should return n named entities", (done) => {
        (async () => {
            await userService.create({email: testUser.email, password: testUser.password});
            const authResponse = await testUtils.authorize(testUser.email, testUser.password, server);

            await db.namedEntity.bulkCreate(testData.namedEntities);
            const limit = 5;

            const requestUrl = `${testUtils.getApiUrl(apiRoutes.NAMED_ENTITIES)}`;
            const request = testUtils.getAuthenticatedRequest(
                requestUrl,
                authResponse.body.access_token,
                server,
                "get");
            request
                .query({limit: limit})
                .end((err, res) => {
                    assert.equal(res.status, constants.statusCodes.OK);
                    assert.exists(res.body.data);
                    assert.equal(res.body.data.length, limit);
                    assert.equal(res.body.count, testData.namedEntities.length);
                    done();
                });
        })();
    });

    it("should return 0 named entities by search", (done) => {
        (async () => {
            await userService.create({email: testUser.email, password: testUser.password});
            const authResponse = await testUtils.authorize(testUser.email, testUser.password, server);

            await db.namedEntity.bulkCreate(testData.namedEntities);

            const requestUrl = `${testUtils.getApiUrl(apiRoutes.NAMED_ENTITIES)}`;
            const request = testUtils.getAuthenticatedRequest(
                requestUrl,
                authResponse.body.access_token,
                server,
                "get");
            request
                .query({search: "Non Existing Name"})
                .end((err, res) => {
                    assert.equal(res.status, constants.statusCodes.OK);
                    assert.exists(res.body.data);
                    assert.equal(res.body.data.length, 0);
                    assert.equal(res.body.count, 0);
                    done();
                });
        })();
    });

    it("should return n named entities by search", (done) => {
        (async () => {
            await userService.create({email: testUser.email, password: testUser.password});
            const authResponse = await testUtils.authorize(testUser.email, testUser.password, server);

            await db.namedEntity.bulkCreate(testData.namedEntities);
            const limit = 1;

            const requestUrl = `${testUtils.getApiUrl(apiRoutes.NAMED_ENTITIES)}`;
            const request = testUtils.getAuthenticatedRequest(
                requestUrl,
                authResponse.body.access_token,
                server,
                "get");
            request
                .query({limit: limit, search: testData.namedEntities[0].name})
                .end((err, res) => {
                    assert.equal(res.status, constants.statusCodes.OK);
                    assert.exists(res.body.data);
                    assert.equal(res.body.data.length, limit);
                    assert.equal(res.body.count, 1);
                    assert.equal(testData.namedEntities[0].name, res.body.data[0].name);
                    done();
                });
        })();
    });
});