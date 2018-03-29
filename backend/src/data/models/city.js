module.exports = function(sequelize, DataTypes) {
    return sequelize.define("city", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        nameEn: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        coordinates: {
            type: DataTypes.GEOMETRY("POINT"),
            allowNull: false
        }
    }, {
        tableName: "city"
    });
};
