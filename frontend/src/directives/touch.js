import Vue from "vue";
import Hammer from "hammerjs";

const swipeDirections = {
    [Hammer.DIRECTION_LEFT]: "left",
    [Hammer.DIRECTION_RIGHT]: "right",
    [Hammer.DIRECTION_UP]: "up",
    [Hammer.DIRECTION_DOWN]: "down"
};

Vue.directive("on-swipe-up", {
    inserted: function (el, bindings) {
        const handler = bindings.value.handler;
        let hammer = new Hammer(el, bindings.value.options);
        hammer.get("swipe").set({ direction: Hammer.DIRECTION_VERTICAL });
        hammer.on("swipeup", () => handler());
    },
    unbind: function (el) {
        Hammer(el).off("swipeup");
    },
});

Vue.directive("on-swipe-down", {
    inserted: function (el, bindings) {
        const handler = bindings.value.handler;
        let hammer = new Hammer(el, bindings.value.options);
        hammer.get("swipe").set({ direction: Hammer.DIRECTION_VERTICAL });
        hammer.on("swipedown", () => handler());
    },
    unbind: function (el) {
        Hammer(el).off("swipedown");
    },
});

Vue.directive("on-swipe-right", {
    inserted: function (el, bindings) {
        const handler = bindings.value.handler;
        let hammer = new Hammer(el, bindings.value.options);
        hammer.on("swiperight", () => handler());
    },
    unbind: function (el) {
        Hammer(el).off("swiperight");
    },
});

Vue.directive("on-swipe", {
    inserted: function (el, bindings) {
        const handler = bindings.value.handler;
        let hammer = new Hammer(el, bindings.value.options);
        hammer.get("swipe").set({ direction: Hammer.DIRECTION_ALL });
        hammer.on("swipe", ({direction}) => handler({direction: swipeDirections[direction]}));
    },
    unbind: function (el) {
        Hammer(el).off("swipe");
    },
});