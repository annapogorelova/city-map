var bcrypt = require('bcrypt-nodejs');

module.exports = {
    generateHash: function(password, saltSize = 8) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(saltSize), null);
    },
    
    comparePassword: function(password, hashedPassword) {
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, hashedPassword, function (err, res) {
                if(!err) {
                    resolve(res);
                } else {
                    reject(err);
                }
            });
        });
    }
};