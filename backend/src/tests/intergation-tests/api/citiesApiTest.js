"use strict";
const chai = require("chai");
const assert = chai.assert;
const chaiHttp = require("chai-http");
const server = require("../../../app");
const testUtils = require("../../testUtils");
const apiRoutes = require("../../apiRoutes");
const constants = require("../../../http/constants/constants");
const testData = require("../../data/dbTestData");
const citiesTestData = testData.cities;
const db = require("../../../data/models/index");
const config = require("config");
const _ = require("lodash");
const userService = testUtils.dc.get("UserService");
const mapper = require("../../../helpers/mapper");

chai.use(chaiHttp);

describe("cities route", function () {
    const testUser = testData.user;

    beforeEach((done) => {
        testUtils.cleanDB().then(() => {
            done();
        });
    });

    it("should return []", (done) => {
        const requestUrl = `${testUtils.getApiUrl(apiRoutes.CITIES)}`;
        chai.request(server)
            .get(requestUrl)
            .end((err, res) => {
                assert.equal(res.status, constants.statusCodes.OK);
                assert.exists(res.body.data);
                assert.equal(res.body.data.length, 0);
                done();
            });
    });

    it("should get the default number of cities", (done) => {
        (async () => {
            const requestUrl = `${testUtils.getApiUrl(apiRoutes.CITIES)}`;
            await db.city.bulkCreate(citiesTestData);

            chai.request(server)
                .get(requestUrl)
                .end((err, res) => {
                    assert.equal(res.status, constants.statusCodes.OK);
                    assert.exists(res.body.data);
                    assert.equal(res.body.data.length, config.defaults.pageLimit);
                    done();
                });
        })();
    });

    it("should get n cities", (done) => {
        (async () => {
            const requestUrl = `${testUtils.getApiUrl(apiRoutes.CITIES)}`;
            await db.city.bulkCreate(citiesTestData);

            chai.request(server)
                .get(requestUrl)
                .query({limit: 4})
                .end((err, res) => {
                    assert.equal(res.status, constants.statusCodes.OK);
                    assert.exists(res.body.data);
                    assert.equal(res.body.data.length, 4);
                    done();
                });
        })();
    });

    it("should search cities by name", (done) => {
        (async () => {
            const requestUrl = `${testUtils.getApiUrl(apiRoutes.CITIES)}`;
            await db.city.bulkCreate(citiesTestData);

            const search = citiesTestData[0].name;
            chai.request(server)
                .get(requestUrl)
                .query({search: search})
                .end((err, res) => {
                    assert.equal(res.status, constants.statusCodes.OK);
                    assert.exists(res.body.data);
                    for (let result of res.body.data) {
                        assert.equal(result.name, search);
                    }

                    done();
                });
        })();
    });

    it("should search cities by a part of name", (done) => {
        const requestUrl = `${testUtils.getApiUrl(apiRoutes.CITIES)}`;
        const search = citiesTestData[0].name.substring(0, 1);
        let expectedCitiesList = citiesTestData.filter(value => {
            return value.name.startsWith(search);
        });
        expectedCitiesList = _.sortBy(expectedCitiesList, "name");
        const limit = 10;
        const expectedLength = expectedCitiesList.length > limit ? limit : expectedCitiesList.length;

        (async () => {
            await db.city.bulkCreate(citiesTestData);

            chai.request(server)
                .get(requestUrl)
                .query({search: search})
                .end((err, res) => {
                    assert.equal(res.status, constants.statusCodes.OK);
                    assert.exists(res.body.data);

                    const results = res.body.data;
                    assert.equal(results.length, expectedLength);

                    for (let i = 0; i < res.body.data.length; i++) {
                        assert.equal(results[i].name, expectedCitiesList[i].name);
                    }

                    done();
                });
        })();
    });

    it("should return empty array and OK", (done) => {
        (async () => {
            const requestUrl = `${testUtils.getApiUrl(apiRoutes.CITIES)}`;
            const search = "Non Existing City on Earth";

            db.city.bulkCreate(citiesTestData).then(data => {
                chai.request(server)
                    .get(requestUrl)
                    .query({search: search})
                    .end((err, res) => {
                        assert.equal(res.status, constants.statusCodes.OK);
                        assert.exists(res.body.data);
                        assert.equal(res.body.data.length, 0);
                        done();
                    });
            });
        })();
    });

    it("should not create a city without auth", (done) => {
        const requestUrl = `${testUtils.getApiUrl(apiRoutes.CITIES)}`;
        chai.request(server)
            .post(requestUrl)
            .end((err, res) => {
                assert.equal(res.status, constants.statusCodes.UNAUTHORIZED);
                done();
            });
    });

    it("should create a city", (done) => {
        (async () => {
            await userService.create(testUser);
            const authResponse = await testUtils.authorize(testUser.email, testUser.password, server);

            const requestUrl = `${testUtils.getApiUrl(apiRoutes.CITIES)}`;
            const city = citiesTestData[0];
            const cityModel = mapper.map(city, "app.city", "api.v1.city");

            const request = testUtils.getAuthenticatedRequest(
                requestUrl,
                authResponse.body.access_token,
                server,
                "post");

            request
                .send(cityModel)
                .end((err, res) => {
                    assert.equal(res.status, constants.statusCodes.OK);
                    assert.exists(res.body.data);
                    db.city.findById(res.body.data.id).then(existingCity => {
                        assert.isNotNull(existingCity);
                        assert.equal(existingCity.name, res.body.data.name);
                        done();
                    });
                });
        })();
    });

    it("should not create city with invalid parameters", (done) => {
        (async () => {
            await userService.create(testUser);
            const authResponse = await testUtils.authorize(testUser.email, testUser.password, server);

            const requestUrl = `${testUtils.getApiUrl(apiRoutes.CITIES)}`;
            const cityModel = mapper.map({name: null, coordinates: []}, "app.city", "api.v1.city");

            const request = testUtils.getAuthenticatedRequest(
                requestUrl,
                authResponse.body.access_token,
                server,
                "post");

            request
                .send(cityModel)
                .end((err, res) => {
                    assert.equal(res.status, constants.statusCodes.BAD_REQUEST);
                    done();
                });
        })();
    });

    it("should return 400", (done) => {
        (async () => {
            await userService.create(testUser);
            const authResponse = await testUtils.authorize(testUser.email, testUser.password, server);
            const requestUrl = `${testUtils.getApiUrl(apiRoutes.CITIES)}/stringid`;
            const request = testUtils.getAuthenticatedRequest(
                requestUrl,
                authResponse.body.access_token,
                server,
                "get");

            request
                .end((err, res) => {
                    assert.equal(res.status, constants.statusCodes.BAD_REQUEST);
                    done();
                });
        })();
    });

    it("should return 404", (done) => {
        (async () => {
            await userService.create(testUser);
            const authResponse = await testUtils.authorize(testUser.email, testUser.password, server);
            const requestUrl = `${testUtils.getApiUrl(apiRoutes.CITIES)}/1`;
            const request = testUtils.getAuthenticatedRequest(
                requestUrl,
                authResponse.body.access_token,
                server,
                "get");
            request
                .end((err, res) => {
                    assert.equal(res.status, constants.statusCodes.NOT_FOUND);
                    done();
                });
        })();
    });

    it("should return city by id", (done) => {
        (async () => {
            const city = citiesTestData[0];
            const createdCity = await db.city.create(city);
            await userService.create(testUser);

            const authResponse = await testUtils.authorize(testUser.email, testUser.password, server);
            const requestUrl = `${testUtils.getApiUrl(apiRoutes.CITIES)}/${createdCity.id}`;

            const request = testUtils.getAuthenticatedRequest(
                requestUrl,
                authResponse.body.access_token,
                server,
                "get");
            request
                .end((err, res) => {
                    assert.equal(res.status, constants.statusCodes.OK);
                    assert.exists(res.body.data);
                    assert.equal(res.body.data.id, createdCity.id);
                    assert.equal(res.body.data.name, createdCity.name);
                    assert.exists(res.body.data.coordinates);
                    done();
                });
        })();
    });
});