<template>
    <div class="row page-wrapper">
        <div class="col-12 col-md-8 offset-md-2 col-lg-6 offset-lg-3">
            <form v-on:submit.prevent="submit">
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

    export default {
        mixins: [AuthMixin, NavigationMixin],
        data: function () {
            return {
                formData: {email: null, password: null},
                isFormValid: false
            };
        },
        created: function () {
            if (this.isAuthenticated) {
                this.$router.push({name: "admin-streets"});
            }
        },
        watch: {
            formData: {
                handler: function (value) {
                    this.isFormValid =
                        (typeof value.email === "string" && value.email !== "") &&
                        (typeof value.password === "string" && value.password !== "");
                },
                deep: true
            }
        },
        methods: {
            submit() {
                return new Promise((resolve, reject) => {
                    if (this.isFormValid) {
                        this.authService.signIn({
                            email: this.formData.email,
                            password: this.formData.password
                        }).then(() => {
                            this.goToPath(this.$route.query.redirect_uri);
                            resolve();
                        }).catch(() => reject());
                    } else {
                        reject();
                    }
                });
            }
        }
    }
</script>