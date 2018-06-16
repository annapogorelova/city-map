<template>
    <div class="page-wrapper">
        <div class="row header-container">
            <div class="col-12">
                <h1>Сторінка зворотнього зв'язку</h1>
                <p>Знайшли помилку або знаєте, як покращити цей веб-додаток? Заповніть форму нижче, щоби надіслати повідомлення автору.</p>
            </div>
        </div>
        <div class="row form-container justify-content-center">
            <div class="col-12 col-lg-8">
                <form>
                    <div class="alert alert-danger" v-if="errors.length">
                        <ul>
                            <li v-for="error in errors">{{error}}</li>
                        </ul>
                    </div>
                    <div class="form-group required">
                        <label for="name" id="nameLabel">Ваше ім'я</label>
                        <input type="text" class="form-control" v-model="formData.name" id="name" name="name"
                               aria-labelledby="nameLabel" minlength="2" required>
                    </div>
                    <div class="form-group required">
                        <label for="email" id="emailLabel">Email</label>
                        <input type="email" class="form-control" v-model="formData.email" id="email"
                               name="email" aria-labelledby="emailLabel" required>
                    </div>
                    <div class="form-group required">
                        <label for="message" id="messageLabel">Повідомлення</label>
                        <textarea class="form-control" v-model="formData.message" id="message" name="message"
                                  minlength="50" maxlength="500" rows="8" aria-labelledby="messageLabel" required></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary float-right" v-on:click="submit">Відправити</button>
                    <recaptcha ref="recaptcha" v-if="reCaptchaKey" v-on:verified="onVerified" v-on:error="onError" v-on:expired="onExpired" :sitekey="reCaptchaKey"></recaptcha>
                </form>
            </div>
        </div>
    </div>
</template>
<style scoped>
    .header-container, .form-container {
        margin-top: 10px;
    }

    p {
        margin-bottom: 0;
    }

    h1 {
        font-size: 1.5rem !important;
        margin-bottom: 10px;
    }
</style>
<script>
    import Recaptcha from "../shared/recaptcha";
    import {ApiServiceMixin, NoticesServiceMixin}from "../../mixins/index";
    import constants from "../../constants";
    import appConfig from "../../app.config";

    export default {
        components: {Recaptcha},
        mixins: [ApiServiceMixin, NoticesServiceMixin],
        data: function () {
            return {
                formData: {
                    name: undefined,
                    email: undefined,
                    message: undefined,
                    reCaptchaToken: undefined,
                },
                errors: []
            }
        },
        computed: {
            reCaptchaKey: function () {
                return appConfig.reCaptchaKey;
            }
        },
        methods: {
            submit: function (event) {
                this.errors = [];

                if(this.isFormValid()) {
                    this.apiService.post("/contact", this.formData).then(() => {
                        this.noticesService.success(
                            constants.NOTICES.MESSAGE_SENT.title,
                            constants.NOTICES.MESSAGE_SENT.message
                        );

                        this.clearForm();
                    });
                } else {
                    if(!this.formData.name) {
                        this.errors.push("Введіть будь ласка ваше ім'я");
                    }

                    if(!this.formData.email) {
                        this.errors.push("Введіть будь ласка ваш email");
                    }

                    if(!this.formData.message) {
                        this.errors.push("Введіть будь ласка текст повідомлення");
                    }

                    if(!this.formData.reCaptchaToken) {
                        this.errors.push("Підтвердіть, що ви не робот, будь ласка");
                    }
                }

                event.preventDefault();
            },
            isFormValid: function () {
                return (typeof this.formData.name === "string" && this.formData.name !== "" &&
                        this.formData.name.length >= 2) &&
                    (typeof this.formData.email === "string" && this.formData.email !== "") &&
                    (typeof this.formData.reCaptchaToken === "string" && this.formData.reCaptchaToken !== "") &&
                    (typeof this.formData.message === "string" && this.formData.message !== "" &&
                        this.formData.message.length >= 50 && this.formData.message.length <= 500);
            },
            clearForm: function () {
                this.formData.name = null;
                this.formData.email = null;
                this.formData.message = null;
                this.formData.reCaptchaToken = null;
                this.errors = [];

                this.$refs.recaptcha.reset();
            },
            onVerified: function (token) {
                this.formData.reCaptchaToken = token;
            },
            onExpired: function () {
                this.formData.reCaptchaToken = undefined;
            },
            onError: function () {
                this.noticesService.error(
                    constants.NOTICES.RECAPTCHA_UNAVAILABLE.title,
                    constants.NOTICES.RECAPTCHA_UNAVAILABLE.message
                );
            }
        }
    }
</script>