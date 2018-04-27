<template>
    <input type="text" v-bind:placeholder="placeholder"
           class="form-control"
           v-model="search"
           v-on:keyup.enter="onSearch"/>
</template>
<script>
    export default {
        props: {
            placeholder: {
                type: String,
                default: "Шукати..."
            }
        },
        data: function () {
            return {
                search: undefined,
            }
        },
        methods: {
            onSearch: function () {
                this.$emit("search", this.search);
            }
        }
    };
</script>