export default {
    data: function() {
        return {
            apiService: undefined
        };
    },
    created: function() {
        this.apiService = this.$dc.get("api");
    }
};