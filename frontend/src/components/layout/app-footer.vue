<template>
    <div class="footer">
        <span>Copyright © {{year}} <b>{{appName}}</b></span>
    </div>
</template>
<style scoped>
    span {
        font-size: 0.8rem !important;
    }

    .footer {
        position: fixed;
        bottom: 0;
        padding: 2px 10px;
        border-top: 1px solid grey;
        border-right: 1px solid grey;
        z-index: 99999;
        background-color: #ffffff;
        opacity: 0.65;
    }

    @media(max-width: 600px) {
        .footer {
            width: 100%;
            border-right: none;
        }
    }
</style>
<script>
    import appConfig from "../../app.config";

    export default {
        computed: {
            year: () => new Date().getFullYear(),
            appName: () => appConfig.appName
        }
    }
</script>