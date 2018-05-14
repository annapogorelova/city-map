"use strict";
const chai = require("chai");
const assert = chai.assert;
const chaiHttp = require("chai-http");
const server = require("../../../app");
const testUtils = require("../../testUtils");
const httpConstants = require("../../../app/constants/httpConstants");
const testData = require("../../data/dbTestData");
const db = require("../../../data/models/index");
const mapper = require("../../../helpers/mapper");
const {optional} = require("tooleks");

chai.use(chaiHttp);

describe("streets route", () => {
    const testCity = testData.cities[0];

    beforeEach((done) => {
        testUtils.cleanDB().then(() => {
            done();
        });
    });

    it("should return 1 street", (done) => {
        (async () => {
            const createdCity = await db.city.create(testCity);

            const testNamedEntity = Object.assign({}, testData.namedEntities.filter(e => e.tags.length)[0]);
            const namedEntity = await db.namedEntity.create(testNamedEntity);

            const tags = await db.tag.bulkCreate(testNamedEntity.tags);
            await namedEntity.setTags(tags);

            const testStreet = testData.streets[0];
            const street = await testUtils.createStreet({
                namedEntityId: namedEntity.id,
                ...testStreet
            }, createdCity.id);

            const requestUrl = `${httpConstants.apiRoutes.CITIES}/${createdCity.id}/${httpConstants.apiRoutes.STREETS}`;

            chai.request(server)
                .get(testUtils.getApiUrl(requestUrl))
                .query({search: street.name})
                .end((err, res) => {
                    assert.equal(res.status, httpConstants.statusCodes.OK);
                    const data = res.body.data;

                    assert.exists(data);
                    assert.equal(1, data.length);
                    assert.equal(street.name, data[0].name);
                    assert.equal(street.description, data[0].description);

                    assert.exists(data[0].namedEntity);
                    assert.equal(namedEntity.id, data[0].namedEntity.id);
                    assert.equal(namedEntity.name, data[0].namedEntity.name);
                    assert.equal(namedEntity.description, data[0].namedEntity.description);

                    assert.exists(data[0].namedEntity.tags);
                    assert.sameMembers(tags.map(t => t.name), data[0].namedEntity.tags.map(t => t.name));

                    done();
                });
        })();
    });

    it("should return an empty array", (done) => {
        (async () => {
            const createdCity = await db.city.create(testCity);
            const requestUrl = `${httpConstants.apiRoutes.CITIES}/${createdCity.id}/${httpConstants.apiRoutes.STREETS}`;

            chai.request(server)
                .get(testUtils.getApiUrl(requestUrl))
                .end((err, res) => {
                    assert.equal(res.status, httpConstants.statusCodes.OK);
                    assert.exists(res.body.data);
                    assert.equal(res.body.data.length, 0);
                    done();
                });
        })();
    });

    it("should return n streets", (done) => {
        (async () => {
            const createdCity = await db.city.create(testCity);
            const createdStreets = await testUtils.createStreets(testData.streets.slice(), createdCity.id);
            const requestUrl = `${httpConstants.apiRoutes.CITIES}/${createdCity.id}/${httpConstants.apiRoutes.STREETS}`;
            const limit = 6;

            chai.request(server)
                .get(testUtils.getApiUrl(requestUrl))
                .query({limit: limit})
                .end((err, res) => {
                    assert.equal(res.status, httpConstants.statusCodes.OK);
                    assert.exists(res.body.data);
                    assert.equal(res.body.data.length, limit);

                    let matchingStreets = createdStreets.filter(street => res.body.data.some(s => s.name === street.name));
                    assert.sameMembers(matchingStreets.map(s => s.name), res.body.data.map(s => s.name));

                    done();
                });
        })();
    });

    it("should search the closest streets by coordinate", (done) => {
        (async () => {
            const createdCity = await db.city.create(testCity);
            const streets = await testUtils.createStreets(testData.streets.slice(), createdCity.id);
            const closestStreet = streets[0];
            const testWays = await closestStreet.getWays();
            const mappedWays = testWays.map(w => mapper.map(w, "app.way", "api.v1.way"));
            const testWay = mappedWays[0];

            const requestUrl = `/${httpConstants.apiRoutes.STREETS}`;
            const testCoordinates = [
                testWay[0][0] - 0.00001,
                testWay[0][1] - 0.00001,
            ];

            chai.request(server)
                .get(testUtils.getApiUrl(requestUrl))
                .query({cityId: createdCity.id, coordinates: testCoordinates})
                .end((err, res) => {
                    assert.equal(res.status, httpConstants.statusCodes.OK);

                    const foundStreet = res.body.data;
                    assert.exists(foundStreet);
                    assert.equal(foundStreet.name, closestStreet.name);
                    assert.equal(foundStreet.ways.length, mappedWays.length);
                    done();
                });
        })();
    });

    it("should not return any street because the given point is above the default threshold distance", (done) => {
        (async () => {
            const createdCity = await db.city.create(testCity);
            const streets = await testUtils.createStreets(testData.streets.slice(), createdCity.id);
            const closestStreet = streets[0];
            const testWays = await closestStreet.getWays();

            const requestUrl = `/${httpConstants.apiRoutes.STREETS}`;
            const testCoordinates = [
                testWays[0].coordinates[0][0] - 0.002,
                testWays[0].coordinates[0][1] - 0.002,
            ];

            chai.request(server)
                .get(testUtils.getApiUrl(requestUrl))
                .query({cityId: createdCity.id, coordinates: testCoordinates})
                .end((err, res) => {
                    assert.equal(res.status, httpConstants.statusCodes.OK);
                    assert.notExists(res.body.data);
                    done();
                });
        })();
    });

    it("should not update the street unauthorized", (done) => {
        (async () => {
            const requestUrl = testUtils.getApiUrl(`/${httpConstants.apiRoutes.STREETS}/1`);

            chai.request(server)
                .put(requestUrl)
                .send({name: "Some name"})
                .end((err, res) => {
                    assert.equal(res.status, httpConstants.statusCodes.UNAUTHORIZED);
                    done();
                });
        })();
    });

    it("should not update the non existing street", (done) => {
        (async () => {
            const authResponse = await testUtils.prepareAuthRequest(server);
            const requestUrl = testUtils.getApiUrl(`/${httpConstants.apiRoutes.STREETS}/1`);
            const request = testUtils.getAuthenticatedRequest(
                requestUrl,
                authResponse.headers['set-cookie'][0],
                server,
                "put");

            request
                .send({name: "Non Existing Street", description: "Does not exist"})
                .end((err, res) => {
                    assert.equal(res.status, httpConstants.statusCodes.NOT_FOUND);
                    done();
                });
        })();
    });

    it("should update the existing street", (done) => {
        (async () => {
            const testStreet = testData.streets[0];
            const testCity = testData.cities[0];
            const createdCity = await db.city.create(testCity);
            const createdStreet = await db.street.create({cityId: createdCity.id, ...testStreet});
            const requestUrl = testUtils.getApiUrl(`/${httpConstants.apiRoutes.STREETS}/${createdStreet.id}`);

            const authResponse = await testUtils.prepareAuthRequest(server);
            const request = testUtils.getAuthenticatedRequest(
                requestUrl,
                authResponse.headers['set-cookie'][0],
                server,
                "put");

            const newDescription = "Totally new";

            request
                .send({description: newDescription})
                .end(async (err, res) => {
                    assert.equal(res.status, httpConstants.statusCodes.OK);
                    const updatedStreet = await db.street.findById(createdStreet.id);
                    assert.equal(updatedStreet.description, newDescription);
                    done();
                });
        })();
    });

    it("should update named entity of the street", (done) => {
        (async () => {
            const testStreet = testData.streets[0];
            const testCity = testData.cities[0];
            const testNamedEntity = testData.namedEntities[0];

            const createdCity = await db.city.create(testCity);
            const createdNamedEntity = await db.namedEntity.create(testNamedEntity);
            let createdStreet = await db.street.create({
                cityId: createdCity.id,
                namedEntity: createdNamedEntity.id,
                ...testStreet
            }).then(entity => optional(() => entity.get({plain: true})));

            const requestUrl = testUtils.getApiUrl(`/${httpConstants.apiRoutes.STREETS}/${createdStreet.id}`);
            const authResponse = await testUtils.prepareAuthRequest(server);
            const request = testUtils.getAuthenticatedRequest(
                requestUrl,
                authResponse.headers['set-cookie'][0],
                server,
                "put");

            const newTestNamedEntity = testData.namedEntities[1];
            const newNamedEntity = await db.namedEntity.create(newTestNamedEntity)
                .then(entity => optional(() => entity.get({plain: true})))
            createdStreet.namedEntityId = newNamedEntity.id;

            request
                .send(createdStreet)
                .end(async (err, res) => {
                    assert.equal(res.status, httpConstants.statusCodes.OK);
                    const updatedStreet = await db.street.findById(createdStreet.id);
                    assert.equal(updatedStreet.namedEntityId, newNamedEntity.id);
                    done();
                });
        })();
    });

    it("should remove the named entity from the street", (done) => {
        (async () => {
            const testStreet = testData.streets[0];
            const testCity = testData.cities[0];
            const testNamedEntity = testData.namedEntities[0];

            const createdCity = await db.city.create(testCity);
            const createdNamedEntity = await db.namedEntity.create(testNamedEntity);
            let createdStreet = await db.street.create({
                cityId: createdCity.id,
                namedEntity: createdNamedEntity.id,
                ...testStreet
            }).then(entity => optional(() => entity.get({plain: true})));

            const requestUrl = testUtils.getApiUrl(`/${httpConstants.apiRoutes.STREETS}/${createdStreet.id}`);
            const authResponse = await testUtils.prepareAuthRequest(server);
            const request = testUtils.getAuthenticatedRequest(
                requestUrl,
                authResponse.headers['set-cookie'][0],
                server,
                "put");

            request
                .send({namedEntityId: null, ...createdStreet})
                .end(async (err, res) => {
                    assert.equal(res.status, httpConstants.statusCodes.OK);
                    const updatedStreet = await db.street.findById(createdStreet.id);
                    assert.isNull(updatedStreet.namedEntityId);
                    done();
                });
        })();
    });

    it("should return 404 when trying to set the non existing named entity for the street", (done) => {
        (async () => {
            const testStreet = testData.streets[0];
            const testCity = testData.cities[0];

            const createdCity = await db.city.create(testCity);
            let createdStreet = await db.street.create({
                cityId: createdCity.id,
                ...testStreet
            }).then(entity => optional(() => entity.get({plain: true})));

            const requestUrl = testUtils.getApiUrl(`/${httpConstants.apiRoutes.STREETS}/${createdStreet.id}`);
            const authResponse = await testUtils.prepareAuthRequest(server);
            const request = testUtils.getAuthenticatedRequest(
                requestUrl,
                authResponse.headers['set-cookie'][0],
                server,
                "put");

            createdStreet.namedEntityId = 1;

            request
                .send(createdStreet)
                .end(async (err, res) => {
                    assert.equal(res.status, httpConstants.statusCodes.NOT_FOUND);
                    done();
                });
        })();
    });
});