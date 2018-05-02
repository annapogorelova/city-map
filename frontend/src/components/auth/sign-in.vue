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
    import {AuthMixin} from "../../mixins/index";

    export default {
        mixins: [AuthMixin],
        data: function () {
            return {
                formData: {email: "", password: ""},
                isFormValid: false
            };
        },
        mounted: function () {
            if(this.isAuthenticated) {
                this.$router.replace("/admin/streets");
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
                    this.$dc.get("auth").postAuth({
                        email: this.formData.email,
                        password: this.formData.password
                    }).then(() => {
                        this.$router.push("/admin/streets");
                    });
                }
            }
        }
    }
</script>