export default {
    data: function () {
        return {
            isAuthenticated: this.$dc.get("auth").isAuthenticated(),
            unsubscribeFromAuthChanges: undefined,
        };
    },
    mounted: function () {
        this.unsubscribeFromAuthChanges = this.$dc.get("auth").onChange(() => {
            this.isAuthenticated = this.$dc.get("auth").isAuthenticated();
        });
    },
    beforeDestroy: function () {
        if (typeof this.unsubscribeFromAuthChanges !== "undefined") {
            this.unsubscribeFromAuthChanges();
        }
    }
};