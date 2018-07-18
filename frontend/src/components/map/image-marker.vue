<template>
    <div class="image-marker-container">
        <a :title="title" :aria-label="title" class="image-marker box-shadow-2dp" :style="style"></a>
    </div>
</template>

<style scoped lang="scss">
    .image-marker-container {
        position: relative;
        width: 100%;
        height: 100%;
    }
    .image-marker {
        z-index: 999;
        position: absolute;
        top: -1.6em;
        left: -1.6em;
        display: block;
        width: 5.5em;
        height: 5.5em;
        border-radius: 50%;
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
        background-color: #f4f4f4;
        transition: 0.2s;
        -webkit-box-shadow: 0px 0px 5px 2px rgba(0,0,0,0.4);
        -moz-box-shadow: 0px 0px 5px 2px rgba(0,0,0,0.4);
        box-shadow: 0px 0px 5px 2px rgba(0,0,0,0.4);

        &:hover, &:focus {
            top: -2.1em;
            left: -2.1em;
            width: 6.5em;
            height: 6.5em;
        }
    }
</style>

<script>
    export default {
        props: {
            imageUrl: {type: String},
            title: {type: String},
            styles: {type: Object, default: {}}
        },
        computed: {
            style: function () {
                return {
                    "background-image": `url(${this.imageUrl})`,
                    ...this.styles,
                };
            }
        },
    };
</script>