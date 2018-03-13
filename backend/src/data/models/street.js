module.exports = function (sequelize, DataTypes) {
    return sequelize.define("street", {
        id: {
            type: DataTypes.INTEGER(11),
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
        wikiLink: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        imageUrl: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        tableName: "street"
    });
};