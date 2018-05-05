export default {
    data: function () {
        return {
            namedEntitiesService: undefined
        };
    },
    created: function () {
        this.namedEntitiesService = this.$dc.get("namedEntities");
    }
};