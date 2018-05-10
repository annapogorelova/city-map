<template>
    <div>
        <input type="text" id="tags" class="form-control" v-model="tagText" v-on:keyup.enter="addTag"/>
        <small class="form-text text-muted" v-if="minTagLength">Мінімальна кількість символів: {{minTagLength}}</small>
        <div class="added-tags">
            <h6 class="tag-container" v-for="tag in tags">
                <span class="badge badge-dark">
                    <span>{{tag}}</span>
                    <i class="fa fa-times remove-tag-icon" v-on:click="removeTag(tag)"></i>
                </span>
            </h6>
        </div>
    </div>
</template>
<script>
    export default {
        props: {
            initialTags: {
                type: Array,
                default: []
            },
            minTagLength: {
                type: Number,
                default: 2
            }
        },
        data: function () {
            return {
                tags: [],
                tagText: undefined
            }
        },
        created: function () {
            this.tags = this.initialTags;
        },
        methods: {
            addTag: function () {
                if (this.isTagValid(this.tagText)) {
                    this.tags.push(this.tagText.toLowerCase());
                    this.$emit("tagAdded", {tag: this.tagText, tagsList: this.tags});
                    this.tagText = "";
                }
            },
            removeTag: function (tag) {
                const tagIndex = this.tags.indexOf(tag);
                if(tagIndex !== -1) {
                    this.tags.splice(this.tags.indexOf(tag), 1);
                    this.$emit("tagRemoved", {tag: tag, tagsList: this.tags});
                }
            },
            isTagValid(tag) {
                return tag && tag.length > this.minTagLength && this.tags.indexOf(tag) === -1;
            }
        }
    }
</script>
<style>
    .added-tags {
        margin-top: 10px;
    }

    h6.tag-container {
        display: inline-block;
        margin-right: 5px;
        margin-top: 0;
        margin-bottom: 3px;
        vertical-align: middle;
    }

    h6.tag-container span {
        font-size: 90%;
    }

    .remove-tag-icon {
        cursor: pointer;
        margin-left: 5px;
        vertical-align: middle;
    }
</style>