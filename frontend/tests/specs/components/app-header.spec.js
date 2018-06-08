import AppHeader from '../../../src/components/layout/app-header.vue';
import { shallowMount, mount, createLocalVue, RouterLinkStub } from '@vue/test-utils';
import dc from "../../../src/dependency-container/index";
import VueRouter from 'vue-router';
import sinon from "sinon";
import constants from "../../../src/constants";
import appConfig from "../../../src/app.config";

describe('AppHeader test', () => {
    let localVue, router;

    const testCity = {id: 1, name: "Львів", nameEn: "Lviv"};

    beforeEach((done) => {
        localVue = createLocalVue();
        localVue.prototype.$dc = dc;
        router = new VueRouter();
        localVue.use(router);

        done();
    });

    it('has a created hook', () => {
        (typeof(AppHeader.created)).should.equals('function')
    });

    it("should not have the default initialCityId", () => {
        const $route = {
            path: '/map',
            query: {}
        };

        const wrapper = shallowMount(AppHeader, {
            localVue,
            mocks: {
                $route
            },
            stubs: ['router-link']
        });

        expect(wrapper.vm.initialCityId).to.be.an('undefined');
    });

    it("should have the default initialCityId", () => {
        const $route = {
            path: '/map',
            query: {cityId: testCity.id}
        };

        const wrapper = shallowMount(AppHeader, {
            localVue,
            mocks: {
                $route
            },
            stubs: ['router-link']
        });

        expect(wrapper.vm.initialCityId).to.equal(testCity.id);
    });

    it("should change the router query when onCitySelected called", (done) => {
        let $route = {
            path: '/map',
            meta: {
                dependsOnCity: true
            },
            query: {
                cityId: undefined
            }
        };

        const $router = new VueRouter({ name: 'map' });
        const routerSpy = sinon.spy($router, "push");

        const wrapper = shallowMount(AppHeader, {
            localVue,
            mocks: {
                $route,
                $router
            },
            stubs: ['router-link']
        });

        expect(wrapper.vm.initialCityId).to.be.an('undefined');

        dc.get("eventBus").on("city-selected", (city) => {
            expect(city).to.equal(testCity);
            done();
        });

        wrapper.vm.onCitySelected(testCity);

        expect(wrapper.vm.city).to.equal(testCity);
        expect(routerSpy.calledOnceWith({query: {cityId: testCity.id, coordinates: undefined}})).to.equal(true);
    });

    it("should not change the router query when onCitySelected called", () => {
        let $route = {
            path: '/map',
            meta: {
                dependsOnCity: false
            },
            query: {
                cityId: undefined
            }
        };

        const $router = new VueRouter({ name: 'map' });
        const routerSpy = sinon.spy($router, "push");

        const wrapper = shallowMount(AppHeader, {
            localVue,
            mocks: {
                $route,
                $router
            },
            stubs: ['router-link']
        });

        expect(wrapper.vm.initialCityId).to.be.an('undefined');

        wrapper.vm.onCitySelected(testCity);

        expect(wrapper.vm.city).to.equal(testCity);
        expect(routerSpy.notCalled).to.equal(true);
    });

    it("should have all headers that are valid for the unauthorized state", () => {
        const wrapper = mount(AppHeader, {
            localVue,
            stubs: {
                RouterLink: RouterLinkStub
            }
        });

        const citiesListElement = wrapper.find("#citiesDropdown");
        expect(citiesListElement).to.be.an("object");

        const brand = wrapper.find(".navbar-brand");
        expect(brand.element).to.not.equal(undefined);
        expect(brand.element.innerText).to.equal(appConfig.appName);

        const navItems = wrapper.findAll(".nav-link");
        expect(navItems.wrappers.length).to.equal(2);
        expect(navItems.wrappers[0].element.innerText.trim().replace("\n", "")).to.equal(constants.HEADERS.CITIES);
        expect(navItems.wrappers[1].element.innerText).to.equal(constants.HEADERS.CONTACT);
    });

    it("should have all headers that are valid for the unauthorized state", () => {
        const authServiceStub = sinon.stub(dc.get("auth"), "isAuthenticated").returns(true);

        const wrapper = mount(AppHeader, {
            localVue,
            stubs: {
                RouterLink: RouterLinkStub
            }
        });

        const citiesListElement = wrapper.find("#citiesDropdown");
        expect(citiesListElement).to.be.an("object");

        const brand = wrapper.find(".navbar-brand");
        expect(brand.element).to.not.equal(undefined);
        expect(brand.element.innerText).to.equal(appConfig.appName);

        const navItems = wrapper.findAll(".nav-link");
        expect(navItems.wrappers.length).to.equal(5);
        expect(navItems.wrappers[0].element.innerText.trim().replace("\n", "")).to.equal(constants.HEADERS.CITIES);
        expect(navItems.wrappers[1].element.innerText).to.equal(constants.HEADERS.STREETS);
        expect(navItems.wrappers[2].element.innerText).to.equal(constants.HEADERS.NAMED_ENTITES);
        expect(navItems.wrappers[3].element.innerText).to.equal(constants.HEADERS.CONTACT);

        authServiceStub.reset();
    });
});