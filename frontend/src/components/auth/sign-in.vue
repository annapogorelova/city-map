<template>
    <div class="row">
        <div class="col-12 col-md-8 offset-md-2 col-lg-6 offset-lg-3">
            <form v-on:submit.prevent="onSubmit">
                <div class="form-group">
                    <label for="exampleInput">Email</label>
                    <input type="email" class="form-control" id="exampleInput"
                           placeholder="Введіть email" v-model="formData.email">
                </div>
                <div class="form-group">
                    <label for="passwordInput">Пароль</label>
                    <input type="password" class="form-control" id="passwordInput"
                           v-model="formData.password"
                           placeholder="Введіть пароль">
                </div>
                <button type="submit" class="btn btn-primary"
                        v-bind:disabled="!isFormValid">
                    Вхід
                </button>
            </form>
        </div>
    </div>
</template>
<script>
    import {AuthMixin, NavigationMixin} from "../../mixins/index";
    import constants from "../../constants";

    export default {
        mixins: [AuthMixin, NavigationMixin],
        data: function () {
            return {
                formData: {email: "", password: ""},
                isFormValid: false
            };
        },
        created: function () {
            if(this.isAuthenticated) {
                this.$router.push({name: "admin-streets"});
            }
        },
        watch: {
            formData: {
                handler: function(value) {
                    this.isFormValid = value.email && value.password;
                },
                deep: true
            }
        },
        methods: {
            onSubmit() {
                if (this.isFormValid) {
                    this.$dc.get("auth").signIn({
                        email: this.formData.email,
                        password: this.formData.password
                    }).then(() => {
                        this.goToPath(this.$route.query.redirect_uri);
                    }).catch(() => {
                        this.$dc.get("notices").error(
                            constants.NOTICES.AUTH_FAILED.title,
                            constants.NOTICES.AUTH_FAILED.message);
                    });
                }
            }
        }
    }
</script>