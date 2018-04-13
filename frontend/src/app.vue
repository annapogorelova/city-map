<template>
    <div id="app">
        <app-header></app-header>
        <div class="container-fluid">
            <div class="app-content">
                <router-view/>
            </div>
        </div>
    </div>
</template>

<script>
    import AppHeader from "./components/layout/app-header";

    export default {
        name: 'app',
        components: {
            AppHeader
        }
    }
</script>

<style>
    @import url('https://fonts.googleapis.com/css?family=Alegreya+Sans+SC:400,600,700,800');
    body {
        font-family: 'Alegreya Sans SC', sans-serif !important;
    }

    .app-content {
        margin-top: 15px;
        margin-bottom: 15px;
    }
</style>
