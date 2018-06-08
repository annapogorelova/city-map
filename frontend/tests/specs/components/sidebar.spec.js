import Sidebar from "../../../src/components/layout/sidebar";
import sinon from "sinon";
import {createLocalVue, shallowMount} from "@vue/test-utils";
import dc from "../../../src/dependency-container";

describe("Sidebar test", () => {
    let localVue;

    beforeEach((done) => {
        localVue = createLocalVue();
        localVue.prototype.$dc = dc;
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
});