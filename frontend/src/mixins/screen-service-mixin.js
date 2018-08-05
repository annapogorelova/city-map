export default {
    data: function () {
        return {
            screenService: undefined
        };
    },
    created: function () {
        this.screenService = this.$dc.get("screen");
    }
};