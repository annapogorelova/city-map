export default {
    data: function () {
        return {
            streetsService: undefined
        };
    },
    created: function () {
        this.streetsService = this.$dc.get("streets");
    }
};