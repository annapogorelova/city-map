module.exports = function (sequelize, DataTypes) {
    return sequelize.define("cityStreet", {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        }
    }, {
        tableName: "cityStreet"
    });
};