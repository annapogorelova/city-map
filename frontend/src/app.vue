<template>
    <div id="app">
        <app-header></app-header>
        <div class="container-fluid">
            <div class="app-content">
                <router-view/>
            </div>
        </div>
        <notices></notices>
    </div>
</template>

<script>
    import AppHeader from "./components/layout/app-header";
    import Notices from "./components/shared/notices";

    export default {
        name: 'app',
        components: {
            Notices,
            AppHeader
        }
    }
</script>

<style>
    @import url('https://fonts.googleapis.com/css?family=Montserrat:400,600,700,800');
    body {
        font-family: 'Montserrat', sans-serif !important;
    }

    .app-content {
        margin-top: 15px;
        margin-bottom: 15px;
    }
</style>
