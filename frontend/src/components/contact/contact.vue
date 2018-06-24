<template>
    <div class="page-wrapper">
        <div v-if="!isCompleted" class="row header-container">
            <div class="col-12 col-lg-8 offset-lg-2">
                <h1>Сторінка зворотнього зв'язку</h1>
                <p>Знайшли помилку або знаєте, як покращити цей веб-додаток? Заповніть форму нижче, щоби надіслати
                    повідомлення автору.</p>
            </div>
        </div>
        <div class="row form-container">
            <div class="col-12 col-lg-8 offset-lg-2">
                <form v-if="!isCompleted">
                    <div class="alert alert-danger" v-if="errors.length">
                        <i class="fa fa-times float-right" title="Сховати" v-on:click="hideErrors"></i>
                        <ul>
                            <li v-for="error in errors">{{error}};</li>
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
                                  minlength="50" maxlength="500" rows="8" aria-labelledby="messageLabel"
                                  required></textarea>
                    </div>
                    <div class="form-group">
                        <recaptcha ref="recaptcha" v-if="reCaptchaKey" v-on:verified="onVerified" v-on:error="onError"
                                   v-on:expired="onExpired" :sitekey="reCaptchaKey"></recaptcha>
                    </div>
                    <button type="submit" class="btn btn-primary" v-on:click="submit">
                        Відправити <i v-if="isSendingInProgress" class="fa fa-circle-notch fa-spin"></i>
                    </button>
                </form>
                <div v-if="isCompleted">
                    <h1>{{messageSentTitle}}</h1>
                    <p>{{messageSentText}}</p>
                    <img class="thank-you-image" :src="completedImage"/>
                </div>
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
        font-size: 1.1rem !important;
        margin-bottom: 10px;
    }

    ul {
        margin-bottom: 0;
        padding-left: 10px;
    }

    li {
        list-style: none;
    }

    .alert i {
        cursor: pointer;
    }

    img {
        margin-top: 15px;
    }

    @media (max-width: 600px) {
        button[type=submit] {
            width: 100%;
        }
    }

    @media (min-width: 601px) {
        button[type=submit] {
            float: right;
        }
    }
</style>
<script>
    import Recaptcha from "../shared/recaptcha";
    import {ApiServiceMixin, NoticesServiceMixin} from "../../mixins/index";
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
                isSendingInProgress: false,
                isCompleted: false,
                errors: []
            }
        },
        computed: {
            reCaptchaKey: function () {
                return appConfig.reCaptchaKey;
            },
            messageSentTitle: function () {
                return constants.NOTICES.MESSAGE_SENT.title;
            },
            messageSentText: function () {
                return constants.NOTICES.MESSAGE_SENT.message;
            },
            completedImage: function () {
                return require("../../../static/images/like.png");
            }
        },
        methods: {
            submit: function (event) {
                this.errors = [];

                if (this.isFormValid()) {
                    this.isSendingInProgress = true;
                    this.apiService.post("/contact", this.formData).then(() => {
                        this.isSendingInProgress = false;
                        this.isCompleted = true;
                        this.clearForm();
                    }).catch(() => {
                        this.noticesService.error(
                            constants.NOTICES.SERVER_ERROR.title,
                            constants.NOTICES.SERVER_ERROR.message
                        );
                        this.isSendingInProgress = false;
                    });
                } else {
                    if (!this.isStringValid(this.formData.name, 2)) {
                        this.errors.push(constants.VALIDATION_MESSAGES.NAME_INVALID);
                    }

                    if (!this.isStringValid(this.formData.email) || !this.isEmailValid(this.formData.email)) {
                        this.errors.push(constants.VALIDATION_MESSAGES.EMAIL_INVALID);
                    }

                    if (!this.isStringValid(this.formData.message, 20)) {
                        this.errors.push(constants.VALIDATION_MESSAGES.MESSAGE_INVALID);
                    }

                    if (!this.isStringValid(this.formData.reCaptchaToken)) {
                        this.errors.push(constants.VALIDATION_MESSAGES.RECAPTCHA_INVALID);
                    }

                    this.$refs.recaptcha.reset();
                    this.formData.reCaptchaToken = null;
                }

                event.preventDefault();
            },
            isFormValid: function () {
                return this.isStringValid(this.formData.name, 2) &&
                    (this.isStringValid(this.formData.email) && this.isEmailValid(this.formData.email)) &&
                    this.isStringValid(this.formData.reCaptchaToken) &&
                    this.isStringValid(this.formData.message, 20);
            },
            isStringValid: function (value, minLength = null) {
                return typeof value === "string" && value !== "" && (!minLength || value.length >= minLength);
            },
            isEmailValid: function (email) {
                const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return re.test(String(email).toLowerCase());
            },
            clearForm: function () {
                this.formData.name = null;
                this.formData.email = null;
                this.formData.message = null;
                this.formData.reCaptchaToken = null;
                this.errors = [];

                this.$refs.recaptcha.reset();
            },
            hideErrors: function () {
                this.errors = [];
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