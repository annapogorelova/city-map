import NavigationMixin from "./navigation-mixin";
import constants from "../constants";

export default {
    mixins: [NavigationMixin],
    data: function () {
        return {
            isAuthenticated: this.$dc.get("auth").isAuthenticated(),
            unsubscribeFromAuthChanges: undefined,
            authService: undefined
        };
    },
    created: function () {
        this.authService = this.$dc.get("auth");
        this.unsubscribeFromAuthChanges = this.authService.onChange(() => {
            this.isAuthenticated = this.authService.isAuthenticated();
        });

        setInterval(() => {
            if(this.$route.meta.requiresAuth && !this.authService.isAuthenticated()) {
                this.authService.signOut();
                this.goToSignInPage({redirect_uri: this.$route.fullPath});
                this.$dc.get("notices").info(
                    constants.NOTICES.AUTH_EXPIRED.title,
                    constants.NOTICES.AUTH_EXPIRED.message
                );
            }
        }, 5000);
    },
    beforeDestroy: function () {
        if (typeof this.unsubscribeFromAuthChanges !== "undefined") {
            this.unsubscribeFromAuthChanges();
        }
    }
};