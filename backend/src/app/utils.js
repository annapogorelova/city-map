const commonConstants = require("./constants/commonConstants");

module.exports = {
    extractStreetName(streetName) {
        const regex = new RegExp(`${commonConstants.streetTypes.join("|")}`, "ig");
        return streetName.replace(regex, "").trim();
    }
};