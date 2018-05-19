module.exports = function (sequelize, DataTypes) {
    return sequelize.define("streetNamedEntity", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        streetId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        namedEntityId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    }, {
        tableName: "streetNamedEntity"
    });
};