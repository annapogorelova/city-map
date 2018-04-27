"use strict";
const chai = require("chai");
const assert = chai.assert;
const chaiHttp = require("chai-http");
const server = require("../../../app");
const testUtils = require("../../testUtils");
const apiRoutes = require("../../apiRoutes");
const constants = require("../../../http/constants/constants");
const testData = require("../../data/dbTestData");
const db = require("../../../data/models/index");

chai.use(chaiHttp);

describe("named entities route test", () => {
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
            const authResponse = await testUtils.prepareAuthRequest(server);
            const requestUrl = testUtils.getApiUrl(apiRoutes.NAMED_ENTITIES);
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
            const authResponse = await testUtils.prepareAuthRequest(server);
            const requestUrl = testUtils.getApiUrl(apiRoutes.NAMED_ENTITIES);
            const request = testUtils.getAuthenticatedRequest(
                requestUrl,
                authResponse.body.access_token,
                server,
                "get");

            await db.namedEntity.bulkCreate(testData.namedEntities);
            const limit = 5;

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
            const authResponse = await testUtils.prepareAuthRequest(server);
            const requestUrl = testUtils.getApiUrl(apiRoutes.NAMED_ENTITIES);
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
            await db.namedEntity.bulkCreate(testData.namedEntities);
            const limit = 1;

            const authResponse = await testUtils.prepareAuthRequest(server);
            const requestUrl = testUtils.getApiUrl(apiRoutes.NAMED_ENTITIES);
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

    it("should return 401 when trying to update named entity by unauthorized user", (done) => {
        (async () => {
            const requestUrl = `${testUtils.getApiUrl(apiRoutes.NAMED_ENTITIES)}/1`;
            chai.request(server)
                .put(requestUrl)
                .end((err, res) => {
                    assert.equal(res.status, constants.statusCodes.UNAUTHORIZED);
                    assert.exists(res.body.message);
                    assert.equal(res.body.message, constants.messages.ACCESS_TOKEN_INCORRECT_FORMAT);
                    done();
                });
        })();
    });

    it("should return 404 when trying to update the non existing named entity", (done) => {
        (async () => {
            const authResponse = await testUtils.prepareAuthRequest(server);
            const requestUrl = testUtils.getApiUrl(`${apiRoutes.NAMED_ENTITIES}/1`);
            const request = testUtils.getAuthenticatedRequest(
                requestUrl,
                authResponse.body.access_token,
                server,
                "put");

            request
                .send(testData.namedEntities[0])
                .end((err, res) => {
                    assert.equal(res.status, constants.statusCodes.NOT_FOUND);
                    done();
                });
        })();
    });

    it("should update named entity", (done) => {
        (async () => {
            const namedEntity = Object.assign({}, testData.namedEntities[0]);
            let createdNamedEntity = await db.namedEntity.create(namedEntity);

            const newName = "Lala";
            const newDescription = "Lala lala";

            createdNamedEntity.name = newName;
            createdNamedEntity.description = newDescription;

            const authResponse = await testUtils.prepareAuthRequest(server);
            const requestUrl = testUtils.getApiUrl(`${apiRoutes.NAMED_ENTITIES}/${createdNamedEntity.id}`);
            const request = testUtils.getAuthenticatedRequest(
                requestUrl,
                authResponse.body.access_token,
                server,
                "put");

            request
                .send(createdNamedEntity)
                .end(async (err, res) => {
                    assert.equal(res.status, constants.statusCodes.OK);

                    const namedEntity = await db.namedEntity.findById(createdNamedEntity.id);
                    assert.equal(newName, namedEntity.name);
                    assert.equal(newDescription, namedEntity.description);

                    done();
                });
        })();
    });
});