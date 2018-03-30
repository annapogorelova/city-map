module.exports = function (sequelize, DataTypes) {
    return sequelize.define("way", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        coordinates: {
            type: DataTypes.GEOMETRY("LINESTRING"),
            allowNull: false,
            get: function() {
                const coordinates = this.getDataValue("coordinates");
                return (coordinates === null) ? null : coordinates.coordinates;
            },
            set: function(coordinates) {
                if (coordinates === null) {
                    this.setDataValue("coordinates", null);
                } else {
                    this.setDataValue("coordinates", { type: "LineString", coordinates: coordinates });
                }
            },
            validations: {
                isCoordinateArray: function(value) {
                    if (!Array.isArray(value)) {
                        throw new Error("Must be an array");
                    }
                }
            }
        }
    }, {
        tableName: "way"
    });
};