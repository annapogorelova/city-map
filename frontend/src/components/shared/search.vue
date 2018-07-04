<template>
    <div class="input-group">
        <input type="text" v-bind:placeholder="placeholder"
               :id="'#' + inputId"
               class="form-control form-control-sm"
               v-model="search"
               v-on:keyup.enter="onSearch"/>
        <span class="input-group-btn">
            <button class="btn btn-outline-success btn-sm btn-search" type="button" v-on:click="onSearch" aria-label="Шукати вулицю">
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
            inputId: {
                type: String,
                default: "searchField"
            },
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
                if (this.search && this.search.length >= this.minLength) {
                    this.$emit("search", this.search);
                }
            },
            clear: function () {
                this.search = "";
                this.$emit("clear");
            }
        }
    };
</script>