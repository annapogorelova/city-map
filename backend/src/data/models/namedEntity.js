module.exports = function (sequelize, DataTypes) {
    return sequelize.define("namedEntity", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(200),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        wikiUrl: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        imageUrl: {
            type: DataTypes.TEXT,
            allowNull: true
        },
    }, {
        tableName: "namedEntity"
    });
};