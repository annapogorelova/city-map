"use strict";
const chai = require("chai");
const assert = chai.assert;
const chaiHttp = require("chai-http");
const server = require("../../app");
const testUtils = require("../testUtils");
const apiRoutes = require("../apiRoutes");
const constants = require("../../http/constants/constants");
const testData = require("../data/dbTestData");
const db = require("../../data/models/index");
const mapper = require("../../helpers/mapper");

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
            const testStreet = await testUtils.createStreet(testData.streets[0], createdCity.id);
            const requestUrl = `${apiRoutes.CITIES}/${createdCity.id}/${apiRoutes.STREETS}`;

            chai.request(server)
                .get(testUtils.getApiUrl(requestUrl))
                .query({search: testStreet.name})
                .end((err, res) => {
                    assert.equal(res.status, constants.statusCodes.OK);
                    assert.exists(res.body.data);
                    assert.equal(res.body.data.length, 1);
                    assert.equal(res.body.data[0].name, testStreet.name);
                    assert.equal(res.body.data[0].description, testStreet.description);
                    done();
                });
        })();
    });

    it("should return an empty array", (done) => {
        (async () => {
            const createdCity = await db.city.create(testCity);
            const requestUrl = `${apiRoutes.CITIES}/${createdCity.id}/${apiRoutes.STREETS}`;

            chai.request(server)
                .get(testUtils.getApiUrl(requestUrl))
                .end((err, res) => {
                    assert.equal(res.status, constants.statusCodes.OK);
                    assert.exists(res.body.data);
                    assert.equal(res.body.data.length, 0);
                    done();
                });
        })();
    });

    it("should return n streets", (done) => {
        (async () => {
            const createdCity = await db.city.create(testCity);
            await testUtils.createStreets(testData.streets.slice(), createdCity.id);
            const requestUrl = `${apiRoutes.CITIES}/${createdCity.id}/${apiRoutes.STREETS}`;
            const limit = 6;

            chai.request(server)
                .get(testUtils.getApiUrl(requestUrl))
                .query({limit: limit})
                .end((err, res) => {
                    assert.equal(res.status, constants.statusCodes.OK);
                    assert.exists(res.body.data);
                    assert.equal(res.body.data.length, limit);
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

            const requestUrl = `/${apiRoutes.STREETS}`;
            const testCoordinates = [
                testWay[0][0] - 0.00001,
                testWay[0][1] - 0.00001,
            ];

            chai.request(server)
                .get(testUtils.getApiUrl(requestUrl))
                .query({coordinates: testCoordinates})
                .end((err, res) => {
                    assert.equal(res.status, constants.statusCodes.OK);
                    assert.exists(res.body.data);
                    assert.equal(res.body.data.length, 1);

                    const foundStreet = res.body.data[0];
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

            const requestUrl = `/${apiRoutes.STREETS}`;
            const testCoordinates = [
                testWays[0].coordinates[0][0] - 0.002,
                testWays[0].coordinates[0][1] - 0.002,
            ];

            chai.request(server)
                .get(testUtils.getApiUrl(requestUrl))
                .query({coordinates: testCoordinates})
                .end((err, res) => {
                    assert.equal(res.status, constants.statusCodes.OK);
                    assert.exists(res.body.data);
                    assert.equal(res.body.data.length, 0);
                    done();
                });
        })();
    });
});