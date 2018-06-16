<template>
    <div id="g-recaptcha" class="g-recaptcha" :data-sitekey="sitekey"></div>
</template>
<script>
    export default {
        props: {
            sitekey: {
                type: String
            }
        },
        data: function () {
            return {
                widgetId: undefined
            }
        },
        mounted () {
            this.render()
        },
        methods: {
            execute: function () {
                window.grecaptcha.execute(this.widgetId)
            },
            reset: function () {
                window.grecaptcha.reset(this.widgetId)
            },
            render: function () {
                if (window.grecaptcha) {
                    this.widgetId = window.grecaptcha.render("g-recaptcha", {
                        sitekey: this.sitekey,
                        callback: (response) => {
                            this.$emit("verified", response);
                        },
                        "expired-callback": () => {
                            this.$emit("expired", response);
                        },
                        "error-callback": () => {
                            this.$emit("error", response);
                        }
                    })
                }
            }
        }
    }
</script>