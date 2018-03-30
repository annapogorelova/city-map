"use strict";

const encryptionHelper = require("../../helpers/encryptionHelper");

function makeUserService(db) {
    return Object.freeze({
        getById,
        getByEmail,
        create,
        isPasswordValid
    });

    function getById(id) {
        return db.user.findById(id);
    }

    function getByEmail(email) {
        return db.user.findOne({ where: { email: email } });
    }

    function create(user) {
        const hashedPassword = encryptionHelper.generateHash(user.password);
        return db.user.create({email: user.email, password: hashedPassword});
    }

    function isPasswordValid(password, hashedPassword) {
        return encryptionHelper.comparePassword(password, hashedPassword);
    }
}

module.exports = makeUserService;