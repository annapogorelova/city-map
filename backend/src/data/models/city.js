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
        isPublished: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        coordinates: {
            type: DataTypes.GEOMETRY("POINT"),
            allowNull: false,
            get: function() {
                const coordinates = this.getDataValue("coordinates");
                return (coordinates === null) ? null : coordinates.coordinates;
            },
            set: function(coordinates) {
                if (coordinates === null) {
                    this.setDataValue("coordinates", null);
                } else {
                    this.setDataValue("coordinates", { type: "Point", coordinates: coordinates });
                }
            },
            validations: {
                isCoordinateArray: function(value) {
                    if (!Array.isArray(value)) {
                        throw new Error("Must be an array");
                    }
                }
            }
        },
        bounds: {
            type: DataTypes.GEOMETRY("POLYGON"),
            allowNull: false,
            get: function() {
                const bounds = this.getDataValue("bounds");
                return (bounds === null) ? null : bounds.coordinates;
            },
            set: function(bounds) {
                if (bounds === null) {
                    this.setDataValue("bounds", null);
                } else {
                    this.setDataValue("bounds", { type: "Polygon", coordinates: bounds });
                }
            },
            validations: {
                isCoordinateArray: function(value) {
                    if (!Array.isArray(value) || !Array.isArray(value[0])) {
                        throw new Error("Must be an array of arrays");
                    }
                }
            }
        }
    }, {
        tableName: "city"
    });
};
