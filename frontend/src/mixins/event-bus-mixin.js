export default {
    data: function () {
        return {
            eventBus: undefined
        };
    },
    created: function () {
        this.eventBus = this.$dc.get("eventBus");
    }
};