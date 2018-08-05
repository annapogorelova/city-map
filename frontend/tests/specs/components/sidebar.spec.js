import Sidebar from "../../../src/components/layout/sidebar";
import sinon from "sinon";
import {createLocalVue, shallowMount} from "@vue/test-utils";
import dc from "../../../src/dependency-container";

describe("Sidebar test", () => {
    let localVue;
    let dummySwipeRightDirective = {
        inserted: function (el, bindings) {
        }
    };

    beforeEach((done) => {
        localVue = createLocalVue();
        localVue.prototype.$dc = dc;
        localVue.directive("on-swipe-right", dummySwipeRightDirective);
        done();
    });

    it("should have isOpen true if the screen is not extra small", (done) => {
        let screenSizeStub = sinon.stub(localVue.prototype.$dc.get("screenSize"), "isExtraSmall").returns(false);

        let wrapper = shallowMount(Sidebar, {localVue});

        expect(wrapper.vm.isOpen).to.equal(true);

        screenSizeStub.restore();

        done();
    });

    it("should have isOpen false if the screen is extra small", (done) => {
        let screenSizeStub = sinon.stub(localVue.prototype.$dc.get("screenSize"), "isExtraSmall").returns(true);

        let wrapper = shallowMount(Sidebar, {localVue});

        expect(wrapper.vm.isOpen).to.equal(false);

        screenSizeStub.restore();

        done();
    });

    it("should open the sidebar", (done) => {
        let wrapper = shallowMount(Sidebar, {localVue});
        let emitEventSpy = sinon.spy(wrapper.vm, "$emit");

        wrapper.vm.open();

        expect(emitEventSpy.calledOnceWith("open")).to.equal(true);
        expect(wrapper.vm.isOpen).to.equal(true);

        done();
    });

    it("should close the sidebar", (done) => {
        let wrapper = shallowMount(Sidebar, {localVue});
        let emitEventSpy = sinon.spy(wrapper.vm, "$emit");

        wrapper.vm.close();

        expect(emitEventSpy.calledOnceWith("close")).to.equal(true);
        expect(wrapper.vm.isOpen).to.equal(false);

        done();
    });

    it("should toogle open the sidebar", (done) => {
        let wrapper = shallowMount(Sidebar, {localVue});
        wrapper.vm.isOpen = false;

        let emitEventSpy = sinon.spy(wrapper.vm, "$emit");

        wrapper.vm.toggle();

        expect(emitEventSpy.calledOnceWith("open")).to.equal(true);
        expect(wrapper.vm.isOpen).to.equal(true);

        done();
    });

    it("should toogle close the sidebar", (done) => {
        let wrapper = shallowMount(Sidebar, {localVue});
        wrapper.vm.isOpen = true;

        let emitEventSpy = sinon.spy(wrapper.vm, "$emit");

        wrapper.vm.toggle();

        expect(emitEventSpy.calledOnceWith("close")).to.equal(true);
        expect(wrapper.vm.isOpen).to.equal(false);

        done();
    });

    it("onSwipeSidebarContentRight should not do anything if device is not touch", (done) => {
        let wrapper = shallowMount(Sidebar, {localVue});

        let isTouchDeviceStub = sinon.stub(wrapper.vm.screenSizeService, "isTouchDevice").returns(false);
        let closeSpy = sinon.spy(wrapper.vm, "close");

        wrapper.vm.onSwipeSidebarContentRight();

        expect(closeSpy.notCalled).to.equal(true);

        isTouchDeviceStub.restore();
        closeSpy.restore();

        done();
    });

    it("onSwipeSidebarContentRight should not do anything if device is smaller than the threshold" +
        " and in a portrait mode", (done) => {
        let wrapper = shallowMount(Sidebar, {localVue});

        let isTouchDeviceStub = sinon.stub(wrapper.vm.screenSizeService, "isTouchDevice").returns(true);
        let windowWidthStub = sinon.stub(wrapper.vm.screenSizeService, "getWindowWidth").returns(wrapper.vm.fullScreenThreshold - 1);
        let isLandScapeStub = sinon.stub(wrapper.vm.screenSizeService, "isLandScape").returns(false);
        let closeSpy = sinon.spy(wrapper.vm, "close");

        wrapper.vm.onSwipeSidebarContentRight();

        expect(closeSpy.notCalled).to.equal(true);

        isTouchDeviceStub.restore();
        windowWidthStub.restore();
        isLandScapeStub.restore();
        closeSpy.restore();

        done();
    });

    it("onSwipeSidebarContentRight should call 'close' if device is smaller than the threshold" +
        " but is in a landscape mode", (done) => {
        let wrapper = shallowMount(Sidebar, {localVue});

        let isTouchDeviceStub = sinon.stub(wrapper.vm.screenSizeService, "isTouchDevice").returns(true);
        let windowWidthStub = sinon.stub(wrapper.vm.screenSizeService, "getWindowWidth").returns(wrapper.vm.fullScreenThreshold - 1);
        let isLandScapeStub = sinon.stub(wrapper.vm.screenSizeService, "isLandScape").returns(true);
        let closeSpy = sinon.spy(wrapper.vm, "close");

        wrapper.vm.onSwipeSidebarContentRight();

        expect(closeSpy.calledOnce).to.equal(true);

        isTouchDeviceStub.restore();
        windowWidthStub.restore();
        isLandScapeStub.restore();
        closeSpy.restore();

        done();
    });

    it("onSwipeSidebarContentRight should call 'close' if device is equal to the threshold", (done) => {
        let wrapper = shallowMount(Sidebar, {localVue});

        let isTouchDeviceStub = sinon.stub(wrapper.vm.screenSizeService, "isTouchDevice").returns(true);
        let windowWidthStub = sinon.stub(wrapper.vm.screenSizeService, "getWindowWidth").returns(wrapper.vm.fullScreenThreshold);
        let closeSpy = sinon.spy(wrapper.vm, "close");

        wrapper.vm.onSwipeSidebarContentRight();

        expect(closeSpy.calledOnce).to.equal(true);

        isTouchDeviceStub.restore();
        windowWidthStub.restore();
        closeSpy.restore();

        done();
    });

    it("isSidebarFooterShown should return 'false' if device is smaller than the threshold and" +
        " is in the landscape mode", (done) => {
        let wrapper = shallowMount(Sidebar, {localVue});

        let windowWidthStub = sinon.stub(wrapper.vm.screenSizeService, "getWindowWidth").returns(wrapper.vm.fullScreenThreshold - 1);
        let isPortraitStub = sinon.stub(wrapper.vm.screenSizeService, "isPortrait").returns(false);

        const result = wrapper.vm.isSidebarFooterShown();

        expect(result).to.equal(false);

        windowWidthStub.restore();
        isPortraitStub.restore();

        done();
    });

    it("isSidebarFooterShown should return 'false' if device is equal to the threshold", (done) => {
        let wrapper = shallowMount(Sidebar, {localVue});

        let windowWidthStub = sinon.stub(wrapper.vm.screenSizeService, "getWindowWidth").returns(wrapper.vm.fullScreenThreshold);

        const result = wrapper.vm.isSidebarFooterShown();

        expect(result).to.equal(false);

        windowWidthStub.restore();

        done();
    });

    it("isSidebarFooterShown should return 'true' if device is smaller than the threshold and" +
        " is in the portrait mode", (done) => {
        let wrapper = shallowMount(Sidebar, {localVue});

        let windowWidthStub = sinon.stub(wrapper.vm.screenSizeService, "getWindowWidth").returns(wrapper.vm.fullScreenThreshold - 1);
        let isPortraitStub = sinon.stub(wrapper.vm.screenSizeService, "isPortrait").returns(true);

        const result = wrapper.vm.isSidebarFooterShown();

        expect(result).to.equal(true);

        windowWidthStub.restore();
        isPortraitStub.restore();

        done();
    });
});