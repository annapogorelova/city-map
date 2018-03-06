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
    .app-content {
        margin-top: 15px;
    }
</style>
