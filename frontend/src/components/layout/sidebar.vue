<template>
    <div class="sidebar-container">
        <div class="sidebar" :class="{'closed': !isOpen, 'open': isOpen}"
             :style="{width: width + 'px', height: height + 'px'}">
            <div class="sidebar-toggler">
                <i class="fa fa-chevron-left fa-2x" :class="{'open': isOpen}"
                   :title="isOpen ? 'Сховати деталі' : 'Показати деталі' "
                   v-on:click="toggle"></i>
            </div>
            <div class="sidebar-content">
                <div class="sidebar-full-screen-toggler">
                    <div class="toggler">
                        <i v-on:click="toggle" class="fa fa-chevron-down" title="Сховати деталі" aria-label="Сховати деталі"></i>
                    </div>
                </div>
                <div class="sidebar-content-header">
                    <slot name="header"></slot>
                </div>
                <div class="sidebar-content-body">
                    <slot name="content"></slot>
                </div>
            </div>
        </div>
        <div class="full-screen-sidebar-footer" :class="{'show': !isOpen, 'hide': isOpen}" aria-label="Показати деталі"
             title="Показати деталі">
            <div class="toggler" v-on:click="open">
                <i class="fa fa-chevron-up"></i>
            </div>
            <slot name="footer"></slot>
        </div>
    </div>
</template>
<style scoped>
    .sidebar {
        position: absolute;
        top: 0;
        right: 0;
        z-index: 999999;
        transition: transform 0.7s;
        width: 500px;
    }

    .sidebar-content {
        position: relative;
        padding: 15px 20px 15px 20px;
        -webkit-box-shadow: -2px 1px 6px 0px rgba(0, 0, 0, 0.5);
        -moz-box-shadow: -2px 1px 6px 0px rgba(0, 0, 0, 0.5);
        box-shadow: -2px 1px 6px 0px rgba(0, 0, 0, 0.5);
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
        -webkit-box-shadow: -2px 1px 6px 0px rgba(0, 0, 0, 0.5);
        -moz-box-shadow: -2px 1px 6px 0px rgba(0, 0, 0, 0.5);
        box-shadow: -2px 1px 6px 0px rgba(0, 0, 0, 0.5);
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

    @media (min-width: 601px) {
        .sidebar-full-screen-toggler, .full-screen-sidebar-footer {
            display: none;
        }
    }

    @media (max-width: 600px) {
        .sidebar-container, .sidebar {
            width: 100% !important;
        }

        .sidebar-content {
            opacity: 1;
            padding-top: 10px;
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
            height: 180px;
            width: 100%;
            background-color: #ffffff;
            padding: 15px 20px;
            cursor: pointer;
            -webkit-box-shadow: 0px 0px 6px 1px rgba(0, 0, 0, 0.5);
            -moz-box-shadow: 0px 0px 6px 1px rgba(0, 0, 0, 0.5);
            box-shadow: 0px 0px 6px 1px rgba(0, 0, 0, 0.5);
            opacity: 0.9;
        }

        .toggler {
            position: absolute;
            right: 0;
            top: 0;
            width: 100px;
            height: 40px;
            text-align: right;
            z-index: 9999;
        }

        .toggler i {
            margin-top: 10px;
            margin-right: 20px;
            cursor: pointer;
        }

        .toggler i {
            z-index: 9999;
        }

        .full-screen-sidebar-footer.hide, .full-screen-sidebar-footer.hide .toggler {
            z-index: 9999;
        }

        .full-screen-sidebar-footer.show {
            z-index: 99998;
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
                this.$emit("open");
            },
            close: function () {
                this.isOpen = false;
                this.$emit("close");
            },
            toggle: function () {
                this.isOpen = !this.isOpen;
                this.$emit(this.isOpen ? "open" : "close");
            }
        }
    }
</script>