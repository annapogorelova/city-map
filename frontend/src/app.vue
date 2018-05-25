<template>
    <div id="app">
        <app-header v-if="isAppHeaderShown"></app-header>
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
        },
        computed: {
            isAppHeaderShown: function () {
                return this.$route.meta.showHeader;
            }
        }
    }
</script>
<style>
    @import url('https://fonts.googleapis.com/css?family=Montserrat:400,500,600,700,800');
    body {
        font-family: 'Montserrat', sans-serif !important;
        min-width: 300px;
        overflow-x: auto;
    }

    .no-margins {
        margin: 0;
    }

    .page-wrapper {
        padding: 10px;
    }
</style>
