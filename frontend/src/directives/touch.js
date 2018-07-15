import Vue from "vue";
import Hammer from "hammerjs";

Vue.directive("on-swipe-right", {
    inserted: function (el, bindings) {
        const handler = bindings.value.handler;
        delete Hammer.defaults.cssProps.userSelect;
        let hammer = new Hammer(el, bindings.value.options);
        hammer.on("swiperight", () => handler());
    },
    unbind: function (el) {
        Hammer(el).off("swiperight");
    },
});