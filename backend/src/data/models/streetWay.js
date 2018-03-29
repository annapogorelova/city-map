module.exports = function (sequelize, DataTypes) {
    return sequelize.define("streetWay", {
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
        wayId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    }, {
        tableName: "streetWay"
    });
};