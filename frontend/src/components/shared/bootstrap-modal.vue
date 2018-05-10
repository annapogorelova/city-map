<template>
    <div class="modal fade" v-bind:id="id" tabindex="-1" role="dialog"
         v-bind:aria-labelledby="id + 'Label'" aria-hidden="true">
        <div class="modal-dialog" role="document">
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
                default: "exampleModal"
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
        },
        beforeDestroy: function () {
            $(`#${this.id}`).modal('dispose');
        },
        methods: {
            show: function() {
                $(`#${this.id}`).modal('show');
            },
            hide: function() {
                $(`#${this.id}`).modal('hide');
            }
        }
    }
</script>