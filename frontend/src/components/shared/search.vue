<template>
    <div class="input-group">
        <input type="text" v-bind:placeholder="placeholder"
               class="form-control"
               v-model="search"
               v-on:keyup.enter="onSearch"
               aria-labelledby="Назва вулиці"/>
        <span class="input-group-btn">
            <button class="btn btn-outline-success btn-search" type="button" v-on:click="onSearch" aria-label="Шукати вулицю">
                <i class="fa fa-search"></i>
            </button>
      </span>
    </div>
</template>
<style>
    .btn-search {
        border-bottom-left-radius: 0 !important;
        border-top-left-radius: 0 !important;
    }
</style>
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
                if (!this.search || this.search.length >= this.minLength) {
                    this.$emit("search", this.search);
                }
            }
        }
    };
</script>