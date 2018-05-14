export default {
    methods: {
        goToPath: function (path) {
            if (path) {
                this.$router.push({path});
            } else {
                this.goToHomePage();
            }
        },
        goToHomePage: function () {
            this.$router.push({name: "map"});
        },
        goToSignInPage: function (query) {
            this.$router.push({name: "sign-in", query: query});
        },
        goToNotFoundPage: function () {
            this.$router.push({name: "404"});
        },
    },
};