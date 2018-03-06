const db = require('../models/index');
const encryptionHelper = require('../../helpers/encryptionHelper');

module.exports = {
    getAll: function () {
        return db.user.all();
    },

    getById: function (id) {
        return db.user.findById(id);
    },

    getByEmail: function(email) {
        return db.user.findOne({ where: { email: email } });
    },

    create: function(email, password) {
        const hashedPassword = encryptionHelper.generateHash(password);
        return db.user.create({email: email, password: hashedPassword});
    },

    isPasswordValid: function(password, hashedPassword) {
        return encryptionHelper.comparePassword(password, hashedPassword);
    }
};