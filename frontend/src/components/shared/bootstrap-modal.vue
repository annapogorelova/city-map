<template>
    <div class="modal fade bd-example-modal-lg" v-bind:id="id" tabindex="-1" role="dialog"
         v-bind:aria-labelledby="label" aria-hidden="true">
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <slot name="header"></slot>
                </div>
                <div class="modal-body">
                    <slot name="body"></slot>
                </div>
                <div class="modal-footer">
                    <slot name="footer"></slot>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    export default {
        props: {
            id: {
                type: String,
                default: "bsModal"
            },
            label: {
                type: String,
                default: "Edit Modal"
            },
            destroyOnHide: {
                type: Boolean,
                default: true
            }
        },
        mounted: function() {
            $(`#${this.id}`).on("hidden.bs.modal", () => {
                this.$emit("modalHidden");

                if(this.destroyOnHide) {
                    $(`#${this.id}`).modal('dispose');
                }
            });

            this.$dc.get("eventBus").on("sign-out", () => {
                this.destroy();
            });
        },
        beforeDestroy: function () {
            this.destroy();
        },
        methods: {
            show: function() {
                $(`#${this.id}`).modal('show');
            },
            hide: function() {
                $(`#${this.id}`).modal('hide');
            },
            destroy() {
                $(`#${this.id}`).modal('hide');
                this.$emit("modalHidden")
                $(`#${this.id}`).modal('dispose');
                $('body').removeClass('modal-open');
                $('.modal-backdrop').remove();
            }
        }
    }
</script>
<style>
    .modal {
        padding-right: 0 !important;
        overflow: auto !important;
    }

    .modal-open {
        padding-right: 0 !important;
        overflow: auto !important;
    }
</style>