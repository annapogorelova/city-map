import NavigationMixin from "./navigation-mixin";
import constants from "../constants";

export default {
    props: {
        checkAuthInterval: {
            type: Number,
            default: 5000
        }
    },
    mixins: [NavigationMixin],
    data: function () {
        return {
            isAuthenticated: this.$dc.get("auth").isAuthenticated(),
            unsubscribeFromAuthChanges: undefined,
            authService: undefined,
            authCheckTimer: undefined
        };
    },
    mounted: function () {
        this.authService = this.$dc.get("auth");
        this.unsubscribeFromAuthChanges = this.authService.onChange(() => {
            this.isAuthenticated = this.authService.isAuthenticated();
        });

        this.authCheckTimer = setInterval(this.checkAuth, this.checkAuthInterval);
    },
    methods: {
        checkAuth: function () {
            if(this.$route.meta.requiresAuth && !this.authService.isAuthenticated()) {
                this.authService.signOut();
                this.goToSignInPage({redirect_uri: this.$route.fullPath});
                this.$dc.get("notices").info(
                    constants.NOTICES.AUTH_EXPIRED.title,
                    constants.NOTICES.AUTH_EXPIRED.message
                );
            }
        }
    },
    beforeDestroy: function () {
        if (typeof this.unsubscribeFromAuthChanges === "function") {
            this.unsubscribeFromAuthChanges();
        }

        if(this.authCheckTimer) {
            clearInterval(this.authCheckTimer);
            this.authCheckTimer = undefined;
        }
    }
};