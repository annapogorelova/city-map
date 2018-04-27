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
        }
    }, {
        tableName: "city"
    });
};
