import Search from "../../../src/components/shared/search";
import sinon from "sinon";
import dc from "../../../src/dependency-container/index";
import { shallowMount, createLocalVue } from '@vue/test-utils';

describe("Search test", () => {
    let localVue, wrapper;

    beforeEach((done) => {
        localVue = createLocalVue();
        wrapper = shallowMount(Search, {localVue});
        done();
    });

    it("should clear the search", (done) => {
        let emitSpy = sinon.spy(wrapper.vm, "$emit");

        wrapper.vm.clear();

        expect(wrapper.vm.search).to.equal("");
        expect(emitSpy.calledOnceWith("clear")).to.equal(true);

        done();
    });

    it("should emit event when onSearch is called", (done) => {
        let emitSpy = sinon.spy(wrapper.vm, "$emit");
        wrapper.vm.search = "search text";

        wrapper.vm.onSearch();

        expect(emitSpy.calledOnceWith("search", wrapper.vm.search)).to.equal(true);

        done();
    });

    it("should not emit event when onSearch is called and search string is not long enough", (done) => {
        let emitSpy = sinon.spy(wrapper.vm, "$emit");
        wrapper.vm.search = "search text".slice(0, 2);

        wrapper.vm.onSearch();

        expect(emitSpy.notCalled).to.equal(true);

        done();
    });

    it("should not emit event when onSearch is called and search string is empty", (done) => {
        let emitSpy = sinon.spy(wrapper.vm, "$emit");
        wrapper.vm.search = "";

        wrapper.vm.onSearch();

        expect(emitSpy.notCalled).to.equal(true);

        done();
    });
});