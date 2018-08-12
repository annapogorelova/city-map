import AppHeader from '../../../src/components/layout/app-header.vue';
import { mount, createLocalVue, RouterLinkStub } from '@vue/test-utils';
import dc from "../../../src/dependency-container/index";
import VueRouter from 'vue-router';
import sinon from "sinon";
import constants from "../../../src/constants";
import appConfig from "../../../src/app.config";

describe('AppHeader test', () => {
    let localVue, router, $store;

    const testCity = {id: 1, name: "Львів", nameEn: "Lviv"};

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
            state: {
                cities: {
                    selectedCity: undefined,
                    cities: testCities
                }
            }
        };

        done();
    });

    it("should have all headers that are valid for the unauthorized state", () => {
        const wrapper = mount(AppHeader, {
            localVue,
            mocks: {
                $store: $store
            },
            stubs: {
                RouterLink: RouterLinkStub
            }
        });

        wrapper.vm.city = testCity;

        const citiesListElement = wrapper.find("#citiesDropdown");
        expect(citiesListElement).to.be.an("object");

        const brand = wrapper.find(".navbar-brand");
        expect(brand.element).to.not.equal(undefined);
        expect(brand.element.innerText).to.equal(appConfig.appName);

        const navItems = wrapper.findAll(".nav-link");
        expect(navItems.wrappers.length).to.equal(3);
        expect(navItems.wrappers[0].element.innerText.trim().replace("\n", "")).to.equal(constants.HEADERS.CITIES);
        expect(navItems.wrappers[1].element.innerText).to.equal(constants.HEADERS.ABOUT);
        expect(navItems.wrappers[2].element.innerText).to.equal(constants.HEADERS.CONTACT);
    });

    it("should have all headers that are valid for the unauthorized state", () => {
        const authServiceStub = sinon.stub(dc.get("auth"), "isAuthenticated").returns(true);

        const wrapper = mount(AppHeader, {
            localVue,
            mocks: {
                $store: $store
            },
            stubs: {
                RouterLink: RouterLinkStub
            }
        });

        wrapper.vm.city = testCity;

        const citiesListElement = wrapper.find("#citiesDropdown");
        expect(citiesListElement).to.be.an("object");

        const brand = wrapper.find(".navbar-brand");
        expect(brand.element).to.not.equal(undefined);
        expect(brand.element.innerText).to.equal(appConfig.appName);

        const navItems = wrapper.findAll(".nav-link");
        expect(navItems.wrappers.length).to.equal(6);
        expect(navItems.wrappers[0].element.innerText.trim().replace("\n", "")).to.equal(constants.HEADERS.CITIES);
        expect(navItems.wrappers[1].element.innerText).to.equal(constants.HEADERS.STREETS);
        expect(navItems.wrappers[2].element.innerText).to.equal(constants.HEADERS.NAMED_ENTITES);
        expect(navItems.wrappers[3].element.innerText).to.equal(constants.HEADERS.ABOUT);
        expect(navItems.wrappers[4].element.innerText).to.equal(constants.HEADERS.CONTACT);

        authServiceStub.reset();
    });
});