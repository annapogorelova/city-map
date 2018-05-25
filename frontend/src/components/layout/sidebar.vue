<template>
    <div class="sidebar-container">
        <div class="sidebar" :class="{'closed': !isOpen, 'open': isOpen}"
             :style="{width: width + 'px', height: height + 'px'}">
            <div class="sidebar-toggler">
                <i class="fa fa-chevron-left fa-2x" :class="{'open': isOpen}" :title="isOpen ? 'Закрити' : 'Відкрити' "
                   v-on:click="toggle"></i>
            </div>
            <div class="sidebar-content">
                <div class="sidebar-full-screen-toggler">
                    <i class="fa fa-arrow-left" v-on:click="toggle" title="Закрити" aria-label="Закрити"></i>
                </div>
                <div class="sidebar-content-header">
                    <slot name="header"></slot>
                </div>
                <div class="sidebar-content-body">
                    <slot name="content"></slot>
                </div>
            </div>
        </div>
        <div class="full-screen-sidebar-footer" :class="{'show': !isOpen, 'hide': isOpen}" aria-label="Відкрити"
             title="Відкрити"
             v-on:click="open">
            <slot name="footer"></slot>
        </div>
    </div>
</template>
<style scoped>
    .sidebar {
        position: absolute;
        top: 0;
        right: 0;
        z-index: 99999;
        transition: transform 0.7s;
        width: 500px;
    }

    .sidebar-content {
        padding: 15px 25px 15px 25px;
        -webkit-box-shadow: -2px 1px 6px 0px rgba(0,0,0,0.5);
        -moz-box-shadow: -2px 1px 6px 0px rgba(0,0,0,0.5);
        box-shadow: -2px 1px 6px 0px rgba(0,0,0,0.5);
        background-color: #ffffff;
        height: 100%;
        overflow-y: auto;
        overflow-x: hidden;
        opacity: 0.9;
        width: 100%;
    }

    .sidebar.open {
        transform: translateX(0px);
    }

    .sidebar.closed {
        transform: translateX(400px);
    }

    .sidebar-toggler {
        position: absolute;
        width: 40px;
        height: 50px;
        background-color: #ffffff;
        z-index: 99999;
        top: 30px;
        right: 400px;
        opacity: 0.95;
        -webkit-box-shadow: -2px 1px 6px 0px rgba(0,0,0,0.5);
        -moz-box-shadow: -2px 1px 6px 0px rgba(0,0,0,0.5);
        box-shadow: -2px 1px 6px 0px rgba(0,0,0,0.5);
        border-top-left-radius: 4px;
        border-bottom-left-radius: 4px;
    }

    .sidebar-toggler i {
        line-height: inherit;
        vertical-align: middle;
        cursor: pointer;
        transition: 0.5s;
        padding-left: 10px;
        padding-right: 10px;
        border-left: 2px solid rgba(255, 255, 255, 0.7);
    }

    .sidebar-full-screen-toggler i {
        cursor: pointer;
    }

    .sidebar-toggler i.closed {
        transform: rotate(-180deg);
    }

    .sidebar-toggler i.open {
        transform: rotate(180deg);
    }

    .sidebar-content-header {
        border-bottom: 1px solid #939697;
        padding-bottom: 15px;
    }

    .sidebar-content-body {
        padding-top: 15px;
    }

    @media(min-width: 601px) {
        .sidebar-full-screen-toggler, .full-screen-sidebar-footer {
            display: none;
        }
    }

    @media(max-width: 600px) {
        .sidebar-container, .sidebar {
            width: 100% !important;
        }

        .sidebar-toggler {
            display: none;
        }

        .sidebar.open {
            transform: translateY(0px);
        }

        .sidebar.closed {
            transform: translateY(1000px);
        }

        .full-screen-sidebar-footer {
            position: absolute;
            bottom: 0;
            height: 80px;
            width: 100%;
            background-color: #ffffff;
            padding: 15px 20px;
            cursor: pointer;
            -webkit-box-shadow: 0px 0px 6px 1px rgba(0,0,0,0.5);
            -moz-box-shadow: 0px 0px 6px 1px rgba(0,0,0,0.5);
            box-shadow: 0px 0px 6px 1px rgba(0,0,0,0.5);
            opacity: 0.9;
        }

        .full-screen-sidebar-footer.hide {
            z-index: 9999;
        }

        .full-screen-sidebar-footer.show {
            z-index: 99999;
        }
    }
</style>
<script>
    import {ScreenSizeServiceMixin} from "../../mixins/index";

    export default {
        mixins: [ScreenSizeServiceMixin],
        props: {
            width: {
                type: Number,
                default: 350
            },
            height: {
                type: Number,
                default: 500
            }
        },
        data: function () {
            return {
                isOpen: undefined
            }
        },
        created: function () {
            this.isOpen = !this.screenSizeService.isExtraSmall();
        },
        methods: {
            open: function () {
                this.isOpen = true;
                this.$emit("open", this.isOpen);
            },
            close: function () {
                this.isOpen = false;
                this.$emit("close", this.isOpen);
            },
            toggle: function () {
                this.isOpen = !this.isOpen;
                this.$emit(this.isOpen ? "open" : "close", this.isOpen);
            }
        }
    }
</script>