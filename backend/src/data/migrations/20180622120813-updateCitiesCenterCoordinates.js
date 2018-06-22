"use strict";

module.exports = {
    up: (queryInterface) => {
        queryInterface.sequelize.query("UPDATE city SET coordinates = POINT(49.843088, 24.026284) WHERE city.nameEn = 'Lviv';");
        queryInterface.sequelize.query("UPDATE city SET coordinates = POINT(50.845935, 24.318773) WHERE city.nameEn = 'Volodymyr-Volynskyi';");
        queryInterface.sequelize.query("UPDATE city SET coordinates = POINT(50.750114, 25.339719) WHERE city.nameEn = 'Lutsk';");
        queryInterface.sequelize.query("UPDATE city SET coordinates = POINT(48.922679, 24.710392) WHERE city.nameEn = 'Ivano-Frankivsk';");
    },

    down: (queryInterface) => {

    }
};
