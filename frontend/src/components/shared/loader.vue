<!-- Loader by tooleks https://github.com/tooleks/photo-blog/blob/master/app/resources/assets/js/components/utils/loader.vue -->
<template>
    <transition name="fade">
        <div class="loader" v-if="visible">
            <div class="loader-inner">
            <span class="loader-icon" aria-label="Loading...">
                <div class="loader-animation" aria-hidden="true"></div>
            </span>
            </div>
        </div>
    </transition>
</template>

<style scoped>
    .loader {
        position: fixed;
        top: 40%;
        left: 40%;
        right: 40%;
        bottom: 40%;
        z-index: 1000;
    }
    .loader-inner {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;
    }
    .loader-icon {
        background: rgba(0, 0, 0, 0.4);
        color: #dde3e6;
        padding: 1em;
        border-radius: 50%;
    }

    .loader-animation,
    .loader-animation:after {
        border-radius: 50%;
        width: 10em;
        height: 10em;
    }
    .loader-animation {
        font-size: 4px;
        position: relative;
        text-indent: -9999em;
        border-top: 1.1em solid rgba(255, 255, 255, 0.2);
        border-right: 1.1em solid rgba(255, 255, 255, 0.2);
        border-bottom: 1.1em solid rgba(255, 255, 255, 0.2);
        border-left: 1.1em solid #ffffff;
        -webkit-transform: translateZ(0);
        -ms-transform: translateZ(0);
        transform: translateZ(0);
        -webkit-animation: load8 1.1s infinite linear;
        animation: load8 1.1s infinite linear;
    }
    @-webkit-keyframes load8 {
        0% {
            -webkit-transform: rotate(0deg);
            transform: rotate(0deg);
        }
        100% {
            -webkit-transform: rotate(360deg);
            transform: rotate(360deg);
        }
    }
    @keyframes load8 {
        0% {
            -webkit-transform: rotate(0deg);
            transform: rotate(0deg);
        }
        100% {
            -webkit-transform: rotate(360deg);
            transform: rotate(360deg);
        }
    }
</style>

<script>
    export default {
        props: {
            loading: {
                type: Boolean,
                default: true,
            },
            delay: {
                type: Number,
                default: 1000,
            },
        },
        data: function () {
            return {
                visible: this.loading,
                delayTimeout: null,
            };
        },
        watch: {
            loading: function () {
                this.init();
            },
        },
        methods: {
            init: function () {
                if (!this.loading) {
                    this.clearDelayTimeout();
                    this.hideLoader();
                } else {
                    this.setDelayTimeout(() => this.showLoader());
                }
            },
            showLoader: function () {
                this.visible = true;
            },
            hideLoader: function () {
                this.visible = false;
            },
            clearDelayTimeout: function () {
                if (this.delayTimeout) {
                    clearTimeout(this.delayTimeout);
                    this.delayTimeout = null;
                }
            },
            setDelayTimeout: function (callback) {
                this.delayTimeout = setTimeout(() => callback.call(callback), this.delay);
            },
        },
        beforeDestroy: function () {
            this.clearDelayTimeout();
        },
    }
</script>