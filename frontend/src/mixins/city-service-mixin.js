export default {
    data: function () {
        return {
            citiesService: undefined
        };
    },
    created: function () {
        this.citiesService = this.$dc.get("cities");
    }
};