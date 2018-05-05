export default {
    data: function () {
        return {
            noticesService: undefined
        };
    },
    created: function () {
        this.noticesService = this.$dc.get("notices");
    }
};