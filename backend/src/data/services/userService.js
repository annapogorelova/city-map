const db = require('../models/index');
const encryptionHelper = require('../../helpers/encryptionHelper');

module.exports = {
    getById: function (id) {
        return db.user.findById(id);
    },

    getByEmail: function(email) {
        return db.user.findOne({ where: { email: email } });
    },

    create: function(user) {
        const hashedPassword = encryptionHelper.generateHash(user.password);
        return db.user.create({email: user.email, password: hashedPassword});
    },

    isPasswordValid: function(password, hashedPassword) {
        return encryptionHelper.comparePassword(password, hashedPassword);
    }
};