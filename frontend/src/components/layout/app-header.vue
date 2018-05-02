<template>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <router-link class="navbar-brand" to="/map">City Map</router-link>
        <router-link v-if="isAuthenticated" class="navbar-brand" to="/admin/streets">Вулиці</router-link>
        <router-link v-if="isAuthenticated" class="navbar-brand" to="/admin/named-entities">Персони</router-link>
        <a href="#" v-if="isAuthenticated" class="navbar-brand" v-on:click="signOut()">Вихід</a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav"></div>
    </nav>
</template>
<script>
    import {AuthMixin} from "../../mixins";

    export default {
        mixins: [AuthMixin]
    }
</script>