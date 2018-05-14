import NavigationMixin from "./navigation-mixin";

export default {
    mixins: [NavigationMixin],
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

        setInterval(() => {
            if(this.$route.meta.requiresAuth && !this.$dc.get("auth").isAuthenticated()) {
                this.$emit("sign-out");
                this.goToSignInPage();
            }
        }, 5000);
    },
    beforeDestroy: function () {
        if (typeof this.unsubscribeFromAuthChanges !== "undefined") {
            this.unsubscribeFromAuthChanges();
        }
    }
};