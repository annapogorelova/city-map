"use strict";

process.env.NODE_ENV = "test";

const dc = require("../app/dependencyResolver");
const db = require("../data/models/index");
const apiRoutes = require("./apiRoutes");
const chai = require("chai");
const chaiHttp = require("chai-http");
const userService = dc.get("UserService");

chai.use(chaiHttp);

module.exports = {
    dc: dc,

    async cleanDB() {
        return Promise.all([
            await db.user.destroy({where: {}, truncate: false}),
            await db.streetWay.destroy({where: {}, truncate: false}),
            await db.way.destroy({where: {}, truncate: false}),
            await db.street.destroy({where: {}, truncate: false}),
            await db.tag.destroy({where: {}, truncate: false}),
            await db.namedEntity.destroy({where: {}, truncate: false}),
            await db.tagNamedEntity.destroy({where: {}, truncate: false}),
            await db.city.destroy({where: {}, truncate: false}),
        ]);
    },

    authorize(email, password, server) {
        return chai.request(server)
            .post(this.getApiUrl(apiRoutes.AUTH))
            .set('Content-Type', 'application/json')
            .send({email: email, password: password});
    },

    getAuthenticatedRequest(url, accessToken, server, method) {
        return chai.request(server)[method](url).set('Cookie', accessToken);
    },

    getApiUrl(url) {
        return apiRoutes.API + url;
    },

    async createStreet(testStreet, cityId) {
        const {ways, ...street} = testStreet;
        const createdStreet = await db.street.create({cityId, ...street});
        if(ways) {
            const createdWays = await db.way.bulkCreate(ways.map(w => { return {coordinates: w}}));
            await createdStreet.setWays(createdWays);
        }
        return createdStreet;
    },

    async createStreets(testStreets, cityId) {
        return Promise.all(testStreets.map(testStreet => this.createStreet(testStreet, cityId)));
    },

    getUser() {
        return {email: "test@gmail.com", password: "testpass"};
    },

    async prepareAuthRequest(server) {
        const user = this.getUser();
        await userService.create({email: user.email, password: user.password});
        return this.authorize(user.email, user.password, server);
    }
};