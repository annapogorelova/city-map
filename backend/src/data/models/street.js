module.exports = function (sequelize, DataTypes) {
    return sequelize.define("street", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        cityId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        personId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        nameEn: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        oldName: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        wikiUrl: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        coordinates: {
            type: DataTypes.GEOMETRY("LINESTRING"),
            allowNull: false
        }
    }, {
        tableName: "street"
    });
};