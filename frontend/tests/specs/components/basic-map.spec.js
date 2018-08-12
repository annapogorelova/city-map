import BasicMap from "../../../src/components/map/basic-map";
import {createLocalVue, shallowMount} from "@vue/test-utils";
import sinon from "sinon";
import L from "leaflet";

describe("BasicMap test", () => {
    let localVue;

    beforeEach((done) => {
        localVue = createLocalVue();
        done();
    });

    it("should have hooks", (done) => {
        expect(typeof(BasicMap.mounted)).to.equal("function");
        expect(typeof(BasicMap.beforeDestroy)).to.equal("function");
        done();
    });

    it("should init the map", (done) => {
        let wrapper = shallowMount(BasicMap, {
            attachToDocument: true
        });

        expect(wrapper.contains("div.map")).to.equal(true);
        expect(wrapper.vm.map).to.be.an("object");
        expect(wrapper.vm.bounds.length).to.equal(0);
        expect(wrapper.emitted().init.length).to.equal(1);

        done();
    });

    it("should init the map with bounds", (done) => {
        const bounds = [[[49.76783, 23.857346], [49.76783, 24.162016], [49.928009, 24.162016], [49.928009, 23.857346], [49.76783, 23.857346]]];

        let wrapper = shallowMount(BasicMap, {
            attachToDocument: true,
            propsData: {
                bounds: bounds
            }
        });

        expect(wrapper.contains("div.map")).to.equal(true);
        expect(wrapper.vm.map).to.be.an("object");
        expect(wrapper.vm.bounds.length).to.equal(1);
        expect(wrapper.emitted().init.length).to.equal(1);

        done();
    });

    it("should emit 'locationsuccess' event on 'locationfound'", (done) => {
        let wrapper = shallowMount(BasicMap, {
            attachToDocument: true
        });

        const coordinates = [49.839683, 24.029717];
        let mapLocateStub = sinon.spy(wrapper.vm.map, "locate");

        wrapper.vm.locate();
        wrapper.vm.map.fire('locationfound', {latitude: coordinates[0], longitude: coordinates[1]});

        expect(mapLocateStub.calledOnceWith({setView: false, maxZoom: wrapper.vm.focusZoom, timeout: wrapper.vm.locationTimeout})).to.equal(true);
        expect(wrapper.emitted().locationsuccess.length).to.equal(1);

        done();
    });

    it("should emit 'locationerror' event on 'locationerror'", (done) => {
        let wrapper = shallowMount(BasicMap, {
            attachToDocument: true
        });

        let mapLocateStub = sinon.spy(wrapper.vm.map, "locate");

        wrapper.vm.locate();
        wrapper.vm.map.fire('locationerror');

        expect(mapLocateStub.calledOnceWith({setView: false, maxZoom: wrapper.vm.focusZoom, timeout: wrapper.vm.locationTimeout})).to.equal(true);
        expect(wrapper.emitted().locationerror.length).to.equal(1);

        done();
    });

    it("should get the map", (done) => {
        let wrapper = shallowMount(BasicMap, {
            attachToDocument: true
        });

        const map = wrapper.vm.getMap();

        expect(map).to.equal(wrapper.vm.map);

        done();
    });

    it("should remove the map on destroy", (done) => {
        const destroySpy = sinon.stub();

        let wrapper = shallowMount(BasicMap, {
            attachToDocument: true,
            destroyed () {
                destroySpy();
            }
        });

        const mapRemoveSpy = sinon.spy(wrapper.vm.map, "remove");

        wrapper.destroy();

        expect(destroySpy.called).to.equal(true);
        expect(mapRemoveSpy.called).to.equal(true);

        done();
    });
});