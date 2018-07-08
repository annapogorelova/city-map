<template>
    <div class="footer">
        <span>Copyright © {{year}} <b>{{appName}}</b></span>
        <div class="icons-attribution">
            Icons made by <a href="http://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a>
        </div>
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

    .icons-attribution {
        font-size: 0.3rem;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
    }

    @media (max-width: 767px) and (orientation: portrait) {
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