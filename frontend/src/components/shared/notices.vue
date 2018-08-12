<template>
    <div class="notices-wrapper">
        <transition-group name="list" tag="div">
            <div v-for="(notice, i) in notices" v-bind:key="i" v-on:click="deleteByIndex(i)"
                 v-bind:class="['notice notice-' + notice.type]">
                <a :title="constants.hide" :aria-label="constants.hide" v-on:click="deleteByIndex(i)">
                    <i class="fa fa-times float-right"></i>
                </a>
                <div class="notice-title">{{ notice.title }}</div>
                <div class="notice-text">{{ notice.text }}</div>
            </div>
        </transition-group>
    </div>
</template>
<script>
    import {ConstantsMixin} from "../../mixins/index"

    export default {
        props: {
            deleteInterval: {
                type: Number,
                default: 1000
            },
            deleteTimeout: {
                type: Number,
                default: 5000
            }
        },
        mixins: [ConstantsMixin],
        data: function () {
            return {
                notices: [],
                noticeEventOff: undefined
            }
        },
        created: function () {
            this.noticeEventOff = this.$dc.get("notices").onNotice((notice) => {
                this.notices.push(notice);
            });
        },
        mounted: function () {
            setInterval(() => this.deleteOutdated(), this.deleteInterval);
        },
        beforeDestroy: function () {
            this.noticeEventOff();
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
<style lang="scss">
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
        z-index: 999999;

        .notice {
            display: block;
            width: 300px;
            padding: 10px;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            margin: 6px 10px 0 0;

            .notice-title {
                font-weight: bold;
            }

            &:first-child {
                margin-top: 10px;
            }

            &:hover {
                opacity: 0.95;
            }

            &.notice-success {
                color: #fff;
                background-color: #51A351;
            }

            &.notice-warning {
                color: #fff;
                background-color: #FFB745;
            }

            &.notice-error {
                color: #fff;
                background-color: #E7552C;
            }

            &.notice-info {
                color: #fff;
                background-color: #5CC5EF;
            }
        }
    }
</style>