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
                <form @submit.prevent="checkForm">
                    <ul v-if="errors.length">
                        <li v-for="error in errors">{{error}}</li>
                    </ul>
                    <div class="form-group required">
                        <label for="name" id="nameLabel">Ваше ім'я</label>
                        <input type="text" class="form-control" v-model="name" id="name" name="name"
                               aria-labelledby="nameLabel" minlength="2" required>
                    </div>
                    <div class="form-group required">
                        <label for="email" id="emailLabel">Email</label>
                        <input type="email" class="form-control" v-model="email" id="email"
                               name="email" aria-labelledby="emailLabel" required>
                    </div>
                    <div class="form-group required">
                        <label for="message" id="messageLabel">Повідомлення</label>
                        <textarea class="form-control" v-model="message" id="message" name="message"
                                  minlength="50" maxlength="500" rows="8" aria-labelledby="messageLabel" required></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary float-right">Відправити</button>
                    <recaptcha v-if="reCaptchaKey" v-on:verified="onVerified" v-on:error="onError" v-on:expired="onExpired" :sitekey="reCaptchaKey"></recaptcha>
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
                name: undefined,
                email: undefined,
                message: undefined,
                token: undefined,
                errors: {}
            }
        },
        computed: {
            reCaptchaKey: function () {
                return appConfig.reCaptchaKey;
            }
        },
        methods: {
            checkForm: function (e) {
                if(this.name && this.email && this.message && this.token) {
                    this.apiService.post("/contact", {
                        name: this.name,
                        email: this.email,
                        message: this.message,
                        reCaptchaToken: this.token
                    }).then(() => {
                        this.noticesService.success(
                            constants.NOTICES.MESSAGE_SENT.title,
                            constants.NOTICES.MESSAGE_SENT.message
                        );
                    });
                } else {
                    if(!this.name) {
                        this.errors.push("Введіть будь ласка ваше ім'я");
                    }

                    if(!this.email) {
                        this.errors.push("Введіть будь ласка ваш email");
                    }

                    if(!this.email) {
                        this.errors.push("Введіть будь ласка текст повідомлення");
                    }

                    if(!this.reCaptchaKey) {
                        this.errors.push("Підтвердіть, що ви не робот, будь ласка");
                    }
                }

                e.preventDefault();
            },
            onVerified: function (token) {
                this.token = token;
            },
            onExpired: function () {
                this.token = undefined;
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