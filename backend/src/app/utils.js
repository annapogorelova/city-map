const constants = require("./constants/common");

module.exports = {
    extractStreetName(streetName) {
        const regex = new RegExp(`${constants.streetTypes.join("|")}`, "ig");
        return streetName.replace(regex, "").trim();
    }
};