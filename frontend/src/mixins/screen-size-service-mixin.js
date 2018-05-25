export default {
    data: function () {
        return {
            screenSizeService: undefined
        };
    },
    created: function () {
        this.screenSizeService = this.$dc.get("screenSize");
    }
};