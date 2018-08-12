import CitiesList from "../../../src/components/shared/cities-list";
import sinon from "sinon";
import { shallowMount, createLocalVue } from '@vue/test-utils';
import VueRouter from 'vue-router';
import dc from "../../../src/dependency-container";
import mutationTypes from "../../../src/store/mutation-types";

describe("CitiesList test", () => {
    let localVue, router, $store;

    const testCities = [{
        id: 1,
        name: "Львів",
        nameEn: "Lviv",
        coordinates: [49.839683, 24.029717],
        bounds: [[[49.76783, 23.857346], [49.76783, 24.162016], [49.928009, 24.162016], [49.928009, 23.857346], [49.76783, 23.857346]]]
    }, {
        id: 2,
        name: "Володимир-Волинський",
        nameEn: "Volodymyr-Volynsky",
        coordinates: [50.8482214, 24.2869926],
        bounds: [[[50.816284, 24.264795], [50.816284, 24.384825], [50.87785, 24.384825], [50.87785, 24.264795], [50.816284, 24.264795]]]
    }];

    beforeEach((done) => {
        localVue = createLocalVue();
        localVue.prototype.$dc = dc;
        router = new VueRouter();
        localVue.use(router);

        $store = {
            subscribe: sinon.stub(),
            commit: sinon.stub(),
            state: {
                cities: {
                    selectedCity: undefined,
                    cities: testCities
                }
            }
        };

        done();
    });

    it("should subscribe to mutations on created hook", (done) => {
        const wrapper = shallowMount(CitiesList, {
            localVue,
            mocks: {
                $store: $store
            }
        });

        expect($store.subscribe.calledOnce).to.equal(true);

        done();
    });

    it("should select new city", (done) => {
        const wrapper = shallowMount(CitiesList, {
            localVue,
            mocks: {
                $store: $store
            }
        });

        const city = testCities[0];
        const isCitySelectedStub = sinon.stub(wrapper.vm, "isCitySelected").returns(false);

        wrapper.vm.selectCity(city);

        expect(isCitySelectedStub.calledWith(city)).to.equal(true);
        expect($store.commit.calledWith(`cities/${mutationTypes.CITIES.SET_SELECTED_CITY}`, city)).to.equal(true);

        isCitySelectedStub.restore();

        done();
    });

    it("should not select new city because it's already selected", (done) => {
        const wrapper = shallowMount(CitiesList, {
            localVue,
            mocks: {
                $store: $store
            }
        });

        const city = testCities[0];
        const isCitySelectedStub = sinon.stub(wrapper.vm, "isCitySelected").returns(true);

        wrapper.vm.selectCity(city);

        expect(isCitySelectedStub.calledWith(city)).to.equal(true);
        expect($store.commit.notCalled).to.equal(true);

        isCitySelectedStub.restore();

        done();
    });
});