"use strict";
const chai = require("chai");
const assert = chai.assert;
const chaiHttp = require("chai-http");
const server = require("../../../app");
const testUtils = require("../../testUtils");
const httpConstants = require("../../../app/constants/httpConstants");
const testData = require("../../data/dbTestData");
const citiesTestData = testData.cities;
const db = require("../../../data/models/index");
const config = require("config");
const _ = require("lodash");
const mapper = require("../../../app/mapper");

chai.use(chaiHttp);

describe("cities route", function () {
    beforeEach((done) => {
        testUtils.cleanDB().then(() => {
            done();
        });
    });

    it("should return []", (done) => {
        chai.request(server)
            .get(testUtils.getApiUrl(httpConstants.apiRoutes.CITIES))
            .end((error, res) => {
                assert.equal(res.status, httpConstants.statusCodes.OK);
                assert.exists(res.body.data);
                assert.equal(res.body.data.length, 0);
                done();
            });
    });

    it("should get the default number of cities", (done) => {
        (async () => {
            const cities = citiesTestData.slice().map(city => {
                return {
                    isPublished: true,
                    ...city
                }
            });
            await db.city.bulkCreate(cities);

            chai.request(server)
                .get(testUtils.getApiUrl(httpConstants.apiRoutes.CITIES))
                .end((error, res) => {
                    assert.equal(res.status, httpConstants.statusCodes.OK);
                    assert.exists(res.body.data);
                    assert.equal(res.body.data.length, config.defaults.pageLimit);
                    done();
                });
        })();
    });

    it("should get only published cities (unauthorized user)", (done) => {
        (async () => {
            const requestUrl = `${testUtils.getApiUrl(httpConstants.apiRoutes.CITIES)}`;
            const publishedCities = citiesTestData.slice(0, 2).map(city => {
                return {
                    isPublished: true,
                    ...city
                }
            });
            const unpublishedCities = citiesTestData.slice(2);

            await db.city.bulkCreate(publishedCities);
            await db.city.bulkCreate(unpublishedCities);

            chai.request(server)
                .get(requestUrl)
                .end((error, res) => {
                    assert.equal(res.status, httpConstants.statusCodes.OK);
                    assert.exists(res.body.data);
                    assert.equal(res.body.data.length, 2);
                    assert.sameMembers(res.body.data.map(c => c.name), publishedCities.map(c => c.name));
                    assert.notIncludeMembers(res.body.data.map(c => c.name), unpublishedCities.map(c => c.name));
                    done();
                });
        })();
    });

    it("should get both published and unpublished cities (authorized user)", (done) => {
        (async () => {
            const publishedCities = citiesTestData.slice(0, 2).map(city => {
                return {
                    isPublished: true,
                    ...city
                }
            });
            const unpublishedCities = citiesTestData.slice(2);

            await db.city.bulkCreate(publishedCities);
            await db.city.bulkCreate(unpublishedCities);

            const authResponse = await testUtils.prepareAuthRequest(server);
            const requestUrl = testUtils.getApiUrl(httpConstants.apiRoutes.CITIES);
            const request = testUtils.getAuthenticatedRequest(
                requestUrl,
                authResponse.headers['set-cookie'][0],
                server,
                "get");

            const limit = citiesTestData.length;

            request
                .query({limit: limit})
                .end((error, res) => {
                    assert.equal(res.status, httpConstants.statusCodes.OK);
                    assert.exists(res.body.data);
                    assert.includeMembers(res.body.data.map(c => c.name), publishedCities.map(c => c.name));
                    assert.includeMembers(res.body.data.map(c => c.name), unpublishedCities.map(c => c.name));
                    done();
                });
        })();
    });

    it("should get n cities", (done) => {
        (async () => {
            const requestUrl = `${testUtils.getApiUrl(httpConstants.apiRoutes.CITIES)}`;
            const cities = citiesTestData.slice().map(city => {
                return {
                    isPublished: true,
                    ...city
                }
            });
            await db.city.bulkCreate(cities);

            const limit = 4;

            chai.request(server)
                .get(requestUrl)
                .query({limit: limit})
                .end((error, res) => {
                    assert.equal(res.status, httpConstants.statusCodes.OK);
                    assert.exists(res.body.data);
                    assert.equal(res.body.data.length, limit);
                    done();
                });
        })();
    });

    it("should search cities by name", (done) => {
        (async () => {
            const requestUrl = `${testUtils.getApiUrl(httpConstants.apiRoutes.CITIES)}`;
            await db.city.bulkCreate(citiesTestData);

            const search = citiesTestData[0].name;
            chai.request(server)
                .get(requestUrl)
                .query({search: search})
                .end((error, res) => {
                    assert.equal(res.status, httpConstants.statusCodes.OK);
                    assert.exists(res.body.data);
                    for (let result of res.body.data) {
                        assert.equal(result.name, search);
                    }

                    done();
                });
        })();
    });

    it("should search cities by a part of name", (done) => {
        const requestUrl = `${testUtils.getApiUrl(httpConstants.apiRoutes.CITIES)}`;
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
                .end((error, res) => {
                    assert.equal(res.status, httpConstants.statusCodes.OK);
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
            const requestUrl = `${testUtils.getApiUrl(httpConstants.apiRoutes.CITIES)}`;
            const search = "Non Existing City on Earth";

            db.city.bulkCreate(citiesTestData).then(data => {
                chai.request(server)
                    .get(requestUrl)
                    .query({search: search})
                    .end((error, res) => {
                        assert.equal(res.status, httpConstants.statusCodes.OK);
                        assert.exists(res.body.data);
                        assert.equal(res.body.data.length, 0);
                        done();
                    });
            });
        })();
    });

    it("should not create a city without auth", (done) => {
        const requestUrl = `${testUtils.getApiUrl(httpConstants.apiRoutes.CITIES)}`;
        chai.request(server)
            .post(requestUrl)
            .end((error, res) => {
                assert.equal(res.status, httpConstants.statusCodes.UNAUTHORIZED);
                done();
            });
    });

    it("should create a city", (done) => {
        (async () => {
            const authResponse = await testUtils.prepareAuthRequest(server);

            const requestUrl = `${testUtils.getApiUrl(httpConstants.apiRoutes.CITIES)}`;
            const city = citiesTestData[0];
            const cityModel = mapper.map(city, "app.city", "api.v1.city");

            const request = testUtils.getAuthenticatedRequest(
                requestUrl,
                authResponse.headers['set-cookie'][0],
                server,
                "post");

            request
                .send(cityModel)
                .end((error, res) => {
                    assert.equal(res.status, httpConstants.statusCodes.OK);
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
            const authResponse = await testUtils.prepareAuthRequest(server);

            const requestUrl = `${testUtils.getApiUrl(httpConstants.apiRoutes.CITIES)}`;
            const cityModel = mapper.map({name: null, coordinates: []}, "app.city", "api.v1.city");

            const request = testUtils.getAuthenticatedRequest(
                requestUrl,
                authResponse.headers['set-cookie'][0],
                server,
                "post");

            request
                .send(cityModel)
                .end((error, res) => {
                    assert.equal(res.status, httpConstants.statusCodes.BAD_REQUEST);
                    done();
                });
        })();
    });

    it("should return 404", (done) => {
        (async () => {
            const authResponse = await testUtils.prepareAuthRequest(server);
            const requestUrl = `${testUtils.getApiUrl(httpConstants.apiRoutes.CITIES)}/1`;
            const request = testUtils.getAuthenticatedRequest(
                requestUrl,
                authResponse.headers['set-cookie'][0],
                server,
                "get");
            request
                .end((error, res) => {
                    assert.equal(res.status, httpConstants.statusCodes.NOT_FOUND);
                    done();
                });
        })();
    });

    it("should return city by id", (done) => {
        (async () => {
            const city = citiesTestData[0];
            const createdCity = await db.city.create(city);

            const authResponse = await testUtils.prepareAuthRequest(server);
            const requestUrl = `${testUtils.getApiUrl(httpConstants.apiRoutes.CITIES)}/${createdCity.id}`;

            const request = testUtils.getAuthenticatedRequest(
                requestUrl,
                authResponse.headers['set-cookie'][0],
                server,
                "get");
            request
                .end((error, res) => {
                    assert.equal(res.status, httpConstants.statusCodes.OK);
                    assert.exists(res.body.data);
                    assert.equal(res.body.data.id, createdCity.id);
                    assert.equal(res.body.data.name, createdCity.name);
                    assert.exists(res.body.data.coordinates);
                    done();
                });
        })();
    });
});