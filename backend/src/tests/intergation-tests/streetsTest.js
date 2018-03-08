"use strict";
const chai = require("chai");
const assert = chai.assert;
const chaiHttp = require("chai-http");
const server = require("../../app");
const testUtils = require("../testUtils");
const apiRoutes = require("../apiRoutes");
const constants = require("../../http/constants/constants");
const testData = require("../testData");
const db = require("../../data/models/index");
const config = require("config");
const _ = require("lodash");
const streetService = require("../../data/services/streetService");
const cityService = require("../../data/services/cityService");

chai.use(chaiHttp);

describe("streets route", () => {
    afterEach((done) => {
        testUtils.cleanDB().then(() => {
            done();
        });
    });

    it("should return 1 street", (done) => {
        (async () => {
            const testCity = testData.cities[0];
            const createdCity = await db.city.create(testCity);
            const createdStreet = await streetService.create(testData.streets[0]);
            const cityStreet = await cityService.addStreet(createdCity, createdStreet);
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
            const createdStreets = await db.street.bulkCreate(testData.streets);
            await cityService.addStreets(createdCity, createdStreets);

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
});