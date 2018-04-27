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
            },
            minLength: {
                type: Number,
                default: 3
            }
        },
        data: function () {
            return {
                search: undefined,
            }
        },
        methods: {
            onSearch: function () {
                if(!this.search || this.search.length >= this.minLength) {
                    this.$emit("search", this.search);
                }
            }
        }
    };
</script>