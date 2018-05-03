<template>
    <div class="notices-wrapper">
        <transition-group name="list" tag="div">
            <div v-for="(notice, i) in notices" v-bind:key="i" v-on:click="deleteByIndex(i)"
                 v-bind:class="['notice notice-' + notice.type]">
                <div class="notice-title">{{ notice.title }}</div>
                <div class="notice-text">{{ notice.text }}</div>
            </div>
        </transition-group>
    </div>
</template>
<script>
    export default {
        props: {
            deleteInterval: {
                type: Number,
                default: 1000
            },
            deleteTimeout: {
                type: Number,
                default: 3000
            }
        },
        data: function () {
            return {
                notices: []
            }
        },
        created: function () {
            this.$dc.get("notices").onNotice((notice) => {
                this.notices.push(notice);
            });
        },
        mounted: function () {
            setInterval(() => this.deleteOutdated(), this.deleteInterval);
        },
        methods: {
            deleteOutdated: function () {
                this.notices = this.notices.filter(notice => notice.createdAt + this.deleteTimeout > Date.now());
            },
            deleteByIndex: function (i) {
                this.notices = this.notices.filter((notice, idx) => idx !== i);
            }
        }
    }
</script>
<style>
    .list-enter-active, .list-leave-active {
        transition: all 0.85s ease;
    }
    .list-enter, .list-leave-to /* .list-leave-active below version 2.1.8 */ {
        opacity: 0;
    }

    .notices-wrapper {
        display: block;
        position: fixed;
        top: 30px;
        right: 0;
        max-height: 100%;
        overflow: hidden;
        z-index: 99999;
    }

    .notices-wrapper .notice {
        display: block;
        width: 300px;
        padding: 10px;
        border: none;
        border-radius: 3px;
        cursor: pointer;
    }

    .notices-wrapper .notice:first-child {
        margin-top: 10px;
    }

    .notices-wrapper .notice {
        margin: 6px 10px 0 0;
    }

    .notices-wrapper .notice:hover {
        opacity: 0.95;
    }

    .notices-wrapper .notice.notice-success {
        color: #fff;
        background-color: #51A351;
    }

    .notices-wrapper .notice.notice-warning {
        color: #fff;
        background-color: #FFB745;
    }

    .notices-wrapper .notice.notice-error {
        color: #fff;
        background-color: #E7552C;
    }

    .notices-wrapper .notice.notice-info {
        color: #fff;
        background-color: #5CC5EF;
    }

    .notices-wrapper .notice .notice-title {
        font-weight: bold;
    }
</style>