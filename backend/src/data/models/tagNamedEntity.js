module.exports = function (sequelize, DataTypes) {
    return sequelize.define("tagNamedEntity", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        tagId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        namedEntityId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    }, {
        tableName: "tagNamedEntity"
    });
};