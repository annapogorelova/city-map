"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn("city", "bounds", {
            type: Sequelize.GEOMETRY("POLYGON"),
            allowNull: true
        });

        await queryInterface.sequelize.query(`UPDATE city SET bounds = 
            GeomFromText('POLYGON((49.76783 23.857346, 49.76783 24.162016, 49.928009 24.162016, 49.928009 23.857346, 49.76783 23.857346))') 
            WHERE nameEn = 'Lviv';`);

        await queryInterface.sequelize.query(`UPDATE city SET bounds = 
            GeomFromText('POLYGON((50.688999 25.261957, 50.688999 25.405102, 50.788925 25.405102, 50.788925 25.261957, 50.688999 25.261957))') 
            WHERE nameEn = 'Lutsk';`);

        await queryInterface.sequelize.query(`UPDATE city SET bounds = 
            GeomFromText('POLYGON((48.861492 24.642426, 48.861492 24.758966, 48.956757 24.758966, 48.956757 24.642426, 48.861492 24.642426))') 
            WHERE nameEn = 'Ivano-Frankivsk';`);

        await queryInterface.sequelize.query(`UPDATE city SET bounds = 
            GeomFromText('POLYGON((50.816284 24.264795, 50.816284 24.384825, 50.87785 24.384825, 50.87785 24.264795, 50.816284 24.264795))') 
            WHERE nameEn = 'Volodymyr-Volynskyi';`);

        await queryInterface.changeColumn("city", "bounds", {
            type: Sequelize.GEOMETRY("POLYGON"),
            allowNull: false
        });
    },

    down: async (queryInterface) => {
        await queryInterface.removeColumn("city", "bounds");
    }
};
