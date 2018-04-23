module.exports = function(sequelize, DataTypes) {
    return sequelize.define("tag", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        }
    }, {
        tableName: "tag"
    });
};
