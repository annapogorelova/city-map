import CitiesList from "../../../src/components/shared/cities-list";
import sinon from "sinon";
import { shallowMount, createLocalVue } from '@vue/test-utils';
import VueRouter from 'vue-router';
import dc from "../../../src/dependency-container";
import appConfig from "../../../src/app.config";

describe("CitiesList test", () => {
    let localVue, router;

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

        done();
    });

    it("should load cities on created hook", (done) => {
        let wrapper = shallowMount(CitiesList, {
            localVue
        });

        let getCitiesStub = sinon.stub(wrapper.vm.citiesService, "getCities").resolves({data: testCities});

        expect(getCitiesStub.calledOnceWith({limit: appConfig.defaultCitiesCount}));

        done();
    });

    it("should load cities", (done) => {
        (async () => {
            let wrapper = shallowMount(CitiesList, {
                localVue
            });

            let preselectCitySpy = sinon.spy(wrapper.vm, "preselectCity");
            let getCitiesStub = sinon.stub(wrapper.vm.citiesService, "getCities").resolves({data: testCities});

            await wrapper.vm.loadCities();

            expect(getCitiesStub.calledOnceWith({limit: appConfig.defaultCitiesCount}));

            expect(wrapper.vm.cities).to.equal(testCities);
            expect(preselectCitySpy.calledOnce).to.equal(true);

            done();
        })();
    });

    it("should preselect city by preselectedCityId", (done) => {
        let wrapper = shallowMount(CitiesList, {
            localVue,
            propsData: {
                preselectedCityId: testCities[1].id
            }
        });

        let selectCitySpy = sinon.spy(wrapper.vm, "selectCity");

        wrapper.vm.cities = testCities;
        wrapper.vm.preselectCity();

        expect(selectCitySpy.calledOnceWith(testCities[1])).to.equal(true);

        done();
    });

    it("should preselect city without preselectedCityId by default city name", (done) => {
        let wrapper = shallowMount(CitiesList, {
            localVue,
            propsData: {
                preselectDefault: true
            }
        });

        const defaultCity = testCities.filter(c => c.name === appConfig.defaultCityName)[0];

        let selectCitySpy = sinon.spy(wrapper.vm, "selectCity");

        wrapper.vm.cities = testCities;
        wrapper.vm.preselectCity();

        expect(selectCitySpy.calledOnceWith(defaultCity)).to.equal(true);

        done();
    });

    it("should preselect the first city", (done) => {
        let wrapper = shallowMount(CitiesList, {
            localVue,
            propsData: {
                preselectDefault: true
            }
        });

        sinon.stub(appConfig, "defaultCityName").value(undefined);

        let selectCitySpy = sinon.spy(wrapper.vm, "selectCity");

        wrapper.vm.cities = testCities;
        wrapper.vm.preselectCity();

        expect(selectCitySpy.calledOnceWith(wrapper.vm.cities[0])).to.equal(true);

        done();
    });

    it("should not preselect any city", (done) => {
        let wrapper = shallowMount(CitiesList, {
            localVue
        });

        let selectCitySpy = sinon.spy(wrapper.vm, "selectCity");

        wrapper.vm.cities = testCities;
        wrapper.vm.preselectCity();

        expect(selectCitySpy.notCalled).to.equal(true);

        done();
    });

    it("should set the selected city", (done) => {
        let wrapper = shallowMount(CitiesList, {
            localVue
        });

        const city = testCities[0];
        let emitSpy = sinon.spy(wrapper.vm, "$emit");

        wrapper.vm.selectCity(city);

        expect(wrapper.vm.selectedCity).to.equal(city);
        expect(emitSpy.calledOnceWith("citySelected", wrapper.vm.selectedCity)).to.equal(true);

        done();
    });

    it("should not set the selected city because it's already selected", (done) => {
        let wrapper = shallowMount(CitiesList, {
            localVue
        });

        const city = testCities[0];
        let emitSpy = sinon.spy(wrapper.vm, "$emit");

        wrapper.vm.selectedCity = city;
        wrapper.vm.selectCity(city);

        expect(wrapper.vm.selectedCity).to.equal(city);
        expect(emitSpy.notCalled).to.equal(true);

        done();
    });

    it("should not set the selected city to undefined", (done) => {
        let wrapper = shallowMount(CitiesList, {
            localVue
        });

        const city = testCities[0];
        let emitSpy = sinon.spy(wrapper.vm, "$emit");

        wrapper.vm.selectedCity = city;
        wrapper.vm.selectCity(undefined);

        expect(wrapper.vm.selectedCity).to.equal(city);
        expect(emitSpy.notCalled).to.equal(true);

        done();
    });
});