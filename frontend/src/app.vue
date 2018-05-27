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

    h1 {
        font-size: 1.1rem !important;

    }

    h2 {
        font-size: 1rem !important;
    }

    p, label, input, textarea, span, .badge, .form-control, li {
        font-size: 0.9rem !important;
    }

    h4, h5 {
        font-size: 0.9rem !important;
    }

    h6 {
        font-size: 0.9rem;
    }

    .nav-link {
        font-size: 1rem;
    }
</style>
