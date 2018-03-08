"use strict";

process.env.NODE_ENV = "test";

const db = require("../data/models/index");
const apiRoutes = require("./apiRoutes");
const config = require("config");
const chai = require("chai");
const chaiHttp = require("chai-http");

chai.use(chaiHttp);

module.exports = {
    cleanDB() {
        return Promise.all([
            db.user.destroy({where: {}, truncate: false}),
            db.city.destroy({where: {}, truncate: false}),
            db.street.destroy({where: {}, truncate: false}),
            db.cityStreet.destroy({where: {}, truncate: false}),
        ]);
    },

    authorize(email, password, server) {
        return chai.request(server)
            .post(this.getApiUrl(apiRoutes.AUTH))
            .set('Content-Type', 'application/json')
            .send({email: email, password: password});
    },

    getAuthenticatedRequest(url, accessToken, server, method) {
        return chai.request(server)[method](url).set(config.security.jwt.headerName, accessToken);
    },

    getApiUrl(url) {
        return apiRoutes.API + url;
    }
};