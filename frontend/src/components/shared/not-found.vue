<template>
    <div class="row page-wrapper">
        <div class="col-12">
            <h1>404</h1>
            <h2>Вибачте, але ця сторінка не знайдена.</h2>
            <div class="image-container"></div>
            <router-link to="/" class="btn btn-outline-dark" title="На головну" aria-label="На головну">
                На головну
            </router-link>
        </div>
    </div>
</template>
<style scoped>
    html {
        height: 100%;
    }

    body > div {
        height: 100%;
    }

    .container-fluid, .app-content {
        height: 100%;
    }

    .page-wrapper {
        padding: 30px;
        background-color: #F8F9FA;
        height: 100%
    }

    .btn {
        margin-top: 10px;
    }

    .image-container {
        height: 300px;
        width: 400px;
        background-image: url("../../../static/images/404-street.jpg");
        background-position: center;
        background-size: contain;
        background-repeat: no-repeat;
        margin-top: 20px;
        margin-bottom: 20px;
        opacity: 0.8;
    }

    h1 {
        font-size: 2.8rem !important;
        margin-bottom: 20px;
        color: #6C737D;
    }

    h2 {
        font-size: 1.5rem !important;
    }
</style>
<script>
    export default {

    }
</script>