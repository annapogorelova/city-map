"use strict";
const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const config = require("config");
const db = {};

const dbConfig = config.get("db");
const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    dbConfig);

fs
    .readdirSync(__dirname)
    .filter(file => {
        return (file.indexOf(".") !== 0) && (file !== basename) && (file.slice(-3) === ".js");
    })
    .forEach(file => {
        const model = sequelize["import"](path.join(__dirname, file));
        db[model.name] = model;
    });

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.user = require("./user")(sequelize, Sequelize);
db.city = require("./city")(sequelize, Sequelize);
db.street = require("./street")(sequelize, Sequelize);
db.namedEntity = require("./namedEntity")(sequelize, Sequelize);
db.tag = require("./tag")(sequelize, Sequelize);
db.tagNamedEntity = require("./tagNamedEntity")(sequelize, Sequelize);
db.way = require("./way")(sequelize, Sequelize);
db.streetNamedEntity = require("./streetNamedEntity")(sequelize, Sequelize);

db.street.belongsTo(db.city, {foreignKey: "cityId"});

db.street.belongsToMany(db.namedEntity, {through: db.streetNamedEntity});
db.namedEntity.belongsToMany(db.street, {through: db.streetNamedEntity});

db.way.belongsTo(db.street, {foreignKey: "streetId"});
db.street.hasMany(db.way);

db.namedEntity.belongsToMany(db.tag, {through: db.tagNamedEntity});
db.tag.belongsToMany(db.namedEntity, {through: db.tagNamedEntity});

db.sequelize.sync();

module.exports = db;
