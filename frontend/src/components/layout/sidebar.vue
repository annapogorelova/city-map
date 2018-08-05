<template>
    <div class="sidebar-container">
        <div class="sidebar" :class="{'closed': !isOpen, 'open': isOpen}"
             :style="{width: width + 'px', height: height + 'px'}">
            <div class="sidebar-toggler">
                <i class="fa fa-chevron-left fa-2x" :class="{'open': isOpen}"
                   :title="isOpen ? constants.hideDetailsCaption : constants.showDetailsCaption "
                   v-on:click="toggle"></i>
            </div>
            <div class="sidebar-content">
                <div class="sidebar-full-screen-toggler">
                    <div class="toggler">
                        <i v-on:click="toggle" class="fa fa-chevron-down"
                           :title="constants.hideDetailsCaption"
                           :aria-label="constants.hideDetailsCaption"></i>
                    </div>
                </div>
                <div class="sidebar-content-header">
                    <slot name="header"></slot>
                </div>
                <div class="sidebar-content-body"
                     v-on-swipe-right="{handler: onSwipeSidebarContentRight, options: {threshold: 5}}">
                    <slot name="content"></slot>
                </div>
            </div>
        </div>
        <div class="full-screen-sidebar-footer"
             :class="{'show': !isOpen, 'hide': isOpen}"
             :aria-label="constants.showDetailsCaption"
             :title="constants.showDetailsCaption">
            <div class="toggler" v-on:click="open">
                <i class="fa fa-chevron-up"></i>
            </div>
            <slot name="footer"></slot>
        </div>
    </div>
</template>
<style scoped lang="scss">
    .sidebar {
        position: absolute;
        top: 0;
        right: 0;
        z-index: 999999;
        transition: transform 0.7s;
        width: 400px;

        &.open {
            transform: translateX(0px);
        }

        &.closed {
            transform: translateX(400px);
        }
    }

    .toggler {
        width: 100px;
        height: 40px;

        i {
            cursor: pointer;
        }
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

        .sidebar-full-screen-toggler {
            .toggler {
                position: absolute;
                right: 0;
                top: 0;
                text-align: right;
                z-index: 9999;

                i {
                    margin-top: 15px;
                    margin-right: 25px;
                    z-index: 9999;
                }
            }
        }
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

        i {
            line-height: inherit;
            vertical-align: middle;
            cursor: pointer;
            transition: 0.5s;
            padding-left: 10px;
            padding-right: 10px;
            border-left: 2px solid rgba(255, 255, 255, 0.7);

            &.closed {
                transform: rotate(-180deg);
            }

            &.open {
                transform: rotate(180deg);
            }
        }
    }

    .sidebar-content-header {
        border-bottom: 1px solid #bec0c0;
        padding-bottom: 15px;
        padding-left: 5px;
        padding-right: 5px;
    }

    .sidebar-content-body {
        padding-top: 15px;
        padding-left: 5px;
        padding-right: 5px;
    }

    @media (min-width: 768px), (max-width: 767px) and (orientation: landscape) {
        .sidebar-full-screen-toggler, .full-screen-sidebar-footer {
            display: none;
        }
    }

    @media (max-width: 767px) and (orientation: portrait) {
        .sidebar-container, .sidebar {
            width: 100% !important;
        }

        .sidebar-content {
            opacity: 1;
            padding-top: 15px;
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
            padding: 15px 20px 40px 20px;
            cursor: pointer;
            -webkit-box-shadow: 0px 0px 6px 1px rgba(0, 0, 0, 0.5);
            -moz-box-shadow: 0px 0px 6px 1px rgba(0, 0, 0, 0.5);
            box-shadow: 0px 0px 6px 1px rgba(0, 0, 0, 0.5);
            opacity: 0.9;

            .toggler {
                position: absolute;
                right: 0;
                top: 0;
                text-align: right;
                z-index: 9999;

                i {
                    margin-top: 15px;
                    margin-right: 25px;
                    z-index: 999999;
                }
            }
        }

        .full-screen-sidebar-footer.hide,
        .full-screen-sidebar-footer.hide .swipe-toggler,
        .full-screen-sidebar-footer.hide .swipe-toggler .toggler {
            z-index: 9999;
        }

        .full-screen-sidebar-footer.show {
            z-index: 99998;
        }
    }
</style>
<script>
    import {ScreenServiceMixin, ConstantsMixin} from "../../mixins/index";

    export default {
        mixins: [ScreenServiceMixin, ConstantsMixin],
        props: {
            width: {
                type: Number,
                default: 350
            },
            height: {
                type: Number,
                default: 500
            },
            fullScreenThreshold: {
                type: Number,
                default: 768
            }
        },
        data: function () {
            return {
                isOpen: undefined
            }
        },
        created: function () {
            this.isOpen = !this.screenService.isExtraSmall();
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
            },
            onSwipeSidebarContentRight: function () {
                if(!this.screenService.isTouchDevice()) {
                    return;
                }

                if (this.screenService.getWindowWidth() >= this.fullScreenThreshold ||
                    (this.screenService.getWindowWidth() < this.fullScreenThreshold &&
                        this.screenService.isLandScape())) {
                    this.close();
                }
            },
            isSidebarFooterShown: function () {
                return (this.screenService.getWindowWidth() < this.fullScreenThreshold &&
                    this.screenService.isPortrait());
            }
        }
    }
</script>