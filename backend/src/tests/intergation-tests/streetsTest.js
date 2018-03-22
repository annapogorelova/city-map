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
const streetService = require("../../data/services/streetService");

chai.use(chaiHttp);

describe("streets route", () => {
    before((done) => {
        testUtils.cleanDB().then(() => {
            done();
        });
    });

    afterEach((done) => {
        testUtils.cleanDB().then(() => {
            done();
        });
    });

    it("should return 1 street", (done) => {
        (async () => {
            const testCity = testData.cities[0];
            const createdCity = await db.city.create(testCity);
            const testStreet = Object.assign({cityId: createdCity.id}, testData.streets[0]);
            const createdStreet = await streetService.create(testStreet);
            const requestUrl = `${apiRoutes.CITIES}/${createdCity.id}/${apiRoutes.STREETS}`;

            chai.request(server)
                .get(testUtils.getApiUrl(requestUrl))
                .query({search: createdStreet.name})
                .end((err, res) => {
                    assert.equal(res.status, constants.statusCodes.OK);
                    assert.exists(res.body.data);
                    assert.equal(res.body.data.length, 1);
                    assert.equal(res.body.data[0].name, createdStreet.name);
                    assert.equal(res.body.data[0].description, createdStreet.description);
                    done();
                });
        })();
    });

    it("should return an empty array", (done) => {
        (async () => {
            const testCity = testData.cities[0];
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
            const testCity = testData.cities[0];
            const createdCity = await db.city.create(testCity);
            const streets = testData.streets.slice();
            for(let street of streets) {
                street.cityId = createdCity.id;
            }
            await db.street.bulkCreate(streets);

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
            const testCity = testData.cities[0];
            const createdCity = await db.city.create(testCity);
            const streets = testData.streets.slice();
            for(let street of streets) {
                street.cityId = createdCity.id;
            }
            await db.street.bulkCreate(streets);
            const closestStreet = testData.streets[0];

            const requestUrl = `/${apiRoutes.STREETS}`;
            const testCoordinates = [
                closestStreet.coordinates.coordinates[0][0] - 0.00001,
                closestStreet.coordinates.coordinates[0][1] - 0.00001,
            ];

            chai.request(server)
                .get(testUtils.getApiUrl(requestUrl))
                .query({cityId: createdCity.id, coordinates: testCoordinates})
                .end((err, res) => {
                    assert.equal(res.status, constants.statusCodes.OK);
                    assert.exists(res.body.data);
                    assert.equal(res.body.data.length, 1);

                    const foundStreet = res.body.data[0];
                    assert.equal(foundStreet.name, closestStreet.name);
                    assert.equal(foundStreet.coordinates.length, closestStreet.coordinates.coordinates.length);
                    for(let i = 0; i < closestStreet.coordinates.coordinates.length; i++) {
                        assert.equal(foundStreet.coordinates[i][0], closestStreet.coordinates.coordinates[i][0]);
                        assert.equal(foundStreet.coordinates[i][1], closestStreet.coordinates.coordinates[i][1]);
                    }
                    done();
                });
        })();
    });

    it("should any street because the given point is above the default threshold distance", (done) => {
        (async () => {
            const testCity = testData.cities[0];
            const createdCity = await db.city.create(testCity);
            const streets = testData.streets.slice();
            for(let street of streets) {
                street.cityId = createdCity.id;
            }
            await db.street.bulkCreate(streets);

            const closestStreet = testData.streets[0];
            const requestUrl = `/${apiRoutes.STREETS}`;
            const testCoordinates = [
                closestStreet.coordinates.coordinates[0][0] + 0.0002,
                closestStreet.coordinates.coordinates[0][1] - 0.0002,
            ];

            chai.request(server)
                .get(testUtils.getApiUrl(requestUrl))
                .query({cityId: createdCity.id, coordinates: testCoordinates})
                .end((err, res) => {
                    assert.equal(res.status, constants.statusCodes.OK);
                    assert.exists(res.body.data);
                    assert.equal(res.body.data.length, 0);
                    done();
                });
        })();
    });
});