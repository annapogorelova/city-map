import CityMap from "../../../src/components/city-map/city-map.vue";
import {mount, createLocalVue} from "@vue/test-utils";
import dc from "../../../src/dependency-container/index";
import VueRouter from "vue-router";
import sinon from "sinon";
import {optional} from "tooleks";
import constants from "../../../src/constants";
import appConfig from "../../../src/app.config";

describe("CityMap test", () => {
    let localVue, router, $store;

    let dummySwipeRightDirective = {
        inserted: function (el, bindings) {
        }
    };

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

    const testStreets = [{
        name: "Максима Кривоноса вулиця",
        nameEm: "Maksyma Kryvonosa street",
        oldName: "Гагарина улица",
        description: "Максима Кривоноса вулиця",
        namedEntities: [{
            id: 1,
            name: "Максим Кровоніс",
            description: "Максим Кривоніс",
            imageUrl: "https://upload.wikimedia.org/wikipedia/uk/f/ff/%D0%92%D0%BB%D0%B0%D0%B4%D0%B8%D0%BC%D0%B8%D1%80%D0%B0_%D0%B8_%D0%9E%D0%BB%D1%8C%D0%B3%D0%B8_%D0%A3%D0%93%D0%9A%D0%A6_%D0%9B%D1%8C%D0%B2%D0%BE%D0%B2.jpg",
            wikiUrl: "https://upload.wikimedia.org/wikipedia/uk/f/ff/%D0%92%D0%BB%D0%B0%D0%B4%D0%B8%D0%BC%D0%B8%D1%80%D0%B0_%D0%B8_%D0%9E%D0%BB%D1%8C%D0%B3%D0%B8_%D0%A3%D0%93%D0%9A%D0%A6_%D0%9B%D1%8C%D0%B2%D0%BE%D0%B2.jpg"
        }],
        ways: [[
            [49.8450587, 24.0358534],
            [49.8450562, 24.036532],
            [49.8448283, 24.0385873],
            [49.8450727, 24.0362645],
            [49.8448132, 24.0386797]
        ]]
    }, {
        name: "Миколи Миклухо-Маклая вулиця",
        description: "Миколи Миклухо-Маклая вулиця",
        oldName: "Гвардійська вулиця",
        namedEntities: [],
        ways: [[
            [49.8432623, 24.0393903],
            [49.8433141, 24.0393339],
            [49.8439319, 24.0386606]
        ]]
    }];

    function createWrapper({route, store} = {}) {
        const $route = {
            path: "/map",
            query: {}
        };

        return mount(CityMap, {
            localVue,
            mocks: {
                $route: route || $route,
                $router: router,
                $store: store || $store
            },
            attachToDocument: true
        });
    }

    beforeEach((done) => {
        localVue = createLocalVue();
        localVue.prototype.$dc = dc;
        router = new VueRouter();
        localVue.use(router);
        localVue.directive("on-swipe-right", dummySwipeRightDirective);

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

    it("has hooks", () => {
        expect(typeof(CityMap.created)).to.equal("function");
        expect(typeof(CityMap.mounted)).to.equal("function");
        expect(typeof(CityMap.beforeDestroy)).to.equal("function");
    });

    it("should subscribe to 'search' on created hook", (done) => {
        let wrapper = createWrapper();
        expect(wrapper.vm.searchEventOff).to.not.equal(undefined);
        done();
    });

    it("should unsubscribe from 'search' on destroy", (done) => {
        const destroySpy = sinon.stub();

        const $route = {
            path: "/map",
            query: {}
        };

        let wrapper = mount(CityMap, {
            localVue,
            mocks: {
                $route: $route,
                $router: router,
                $store: $store
            },
            destroyed() {
                destroySpy();
            },
            attachToDocument: true
        });

        let searchEventOffSpy = sinon.spy(wrapper.vm, "searchEventOff");

        wrapper.destroy();

        expect(destroySpy.called).to.equal(true);
        expect(searchEventOffSpy.called).to.equal(true);

        done();
    });

    it("should have cityId undefined", (done) => {
        const $route = {
            path: "/map",
            query: {}
        };

        let wrapper = createWrapper({
            route: $route
        });

        expect(wrapper.vm.cityId).to.be.an("undefined");
        done();
    });

    it("should not open sidebar when selectedStreet changes value and has no namedEntities", (done) => {
        let wrapper = createWrapper();

        wrapper.vm.sidebar.isOpen = false;
        wrapper.vm.selectedStreet = testStreets[0];

        const sidebarOpenSpy = sinon.spy(wrapper.vm.sidebar, "open");
        wrapper.vm.selectedStreet = testStreets[1];

        expect(sidebarOpenSpy.notCalled).to.equal(true);

        done();
    });

    it("should not open the sidebar when selectedStreet changed if the sidebar is open", (done) => {
        let wrapper = createWrapper();

        wrapper.vm.sidebar.isOpen = true;
        wrapper.vm.selectedStreet = testStreets[1];

        const sidebarOpenSpy = sinon.spy(wrapper.vm.sidebar, "open");

        expect(sidebarOpenSpy.notCalled).to.equal(true);

        done();
    });

    it("should watch the coordinates", (done) => {
        let wrapper = createWrapper();
        const routerPushSpy = sinon.spy(router, "push");

        wrapper.vm.coordinates = testCities[0].coordinates;

        expect(routerPushSpy.withArgs({
            query: {
                lat: testCities[0].coordinates[0],
                lng: testCities[0].coordinates[1]
            }
        }).calledOnce).to.equal(true);

        done();
    });

    it("should set marker for the street with with named entity info", (done) => {
        let coordinates = testCities[0].coordinates;
        let street = testStreets[0];

        let wrapper = createWrapper();

        let setMapViewSpy = sinon.spy(wrapper.vm, "setMapView");
        let makeNamedEntityMarkerSpy = sinon.spy(wrapper.vm, "makeNamedEntityMarker");

        wrapper.vm.setStreetMarker(coordinates, street);

        expect(makeNamedEntityMarkerSpy.calledWithMatch(coordinates, street.namedEntities[0])).to.equal(true);
        expect(setMapViewSpy.calledOnceWith(coordinates)).to.equal(true);

        const markerLatLng = wrapper.vm.markers[0].getLatLng();
        expect(markerLatLng.lat).to.equal(coordinates[0]);
        expect(markerLatLng.lng).to.equal(coordinates[1]);

        done();
    });

    it("should set street marker without named entities", (done) => {
        let coordinates = testCities[0].coordinates;
        let street = testStreets[1];

        let wrapper = createWrapper();

        let makeStreetMarkerSpy = sinon.spy(wrapper.vm, "makeStreetMarker");
        let setMapViewSpy = sinon.spy(wrapper.vm, "setMapView");

        wrapper.vm.setStreetMarker(coordinates, street);

        expect(makeStreetMarkerSpy.calledWithMatch(coordinates, street)).to.equal(true);
        expect(setMapViewSpy.calledOnceWith(coordinates)).to.equal(true);

        const markerLatLng = wrapper.vm.markers[0].getLatLng();
        expect(markerLatLng.lat).to.equal(coordinates[0]);
        expect(markerLatLng.lng).to.equal(coordinates[1]);

        done();
    });

    it("should find and set the street onSearchStreet", (done) => {
        (async () => {
            const $route = {
                path: "/map",
                query: {}
            };

            const street = testStreets[0];
            const coordinates = street.ways[0][0];

            let wrapper = createWrapper({
                route: $route
            });
            let searchClearSpy = sinon.spy(wrapper.vm.search, "clear");
            let clearMapSpy = sinon.spy(wrapper.vm, "clearMap");
            let setSelectedStreetSpy = sinon.spy(wrapper.vm, "setSelectedStreet");
            let setMapViewSpy = sinon.spy(wrapper.vm, "setMapView");
            let drawStreetSpy = sinon.spy(wrapper.vm, "drawStreet");

            sinon.stub(wrapper.vm.streetsService, "search").resolves({data: [street]});

            await wrapper.vm.onSearchStreet(street.name);

            expect(clearMapSpy.calledBefore(setSelectedStreetSpy)).to.equal(true);
            expect(searchClearSpy.called).to.equal(true);
            expect(setSelectedStreetSpy.calledWith(street, coordinates)).to.equal(true);
            expect(setMapViewSpy.calledWith(coordinates)).to.equal(true);
            expect(drawStreetSpy.calledWith(street)).to.equal(true);

            expect(wrapper.vm.selectedStreet).to.equal(street);

            done();
        })();
    });
    //
    it("should react to street not found", (done) => {
        (async () => {
            const $route = {
                path: "/map",
                query: {}
            };

            let wrapper = createWrapper({
                route: $route
            });

            let noticesServiceSpy = sinon.spy(wrapper.vm.noticesService, "info");

            sinon.stub(wrapper.vm.streetsService, "search").resolves({data: []});

            await wrapper.vm.onSearchStreet("aslld");

            expect(wrapper.vm.coordinates.length).to.equal(0);
            expect(wrapper.vm.selectedStreet).to.equal(null);

            expect(noticesServiceSpy.calledWith(
                constants.NOTICES.STREET_NOT_FOUND.title,
                constants.NOTICES.STREET_NOT_FOUND.message)).to.equal(true);

            noticesServiceSpy.restore();

            done();
        })();
    });

    it("should reject when streetName is empty", (done) => {
        (async () => {
            const $route = {
                path: "/map",
                query: {}
            };

            let wrapper = createWrapper({
                route: $route
            });

            try {
                await wrapper.vm.onSearchStreet("");
            } catch (error) {
                done();
            }
        })();
    });

    it("should return the closest street by coordinates fetched from API", (done) => {
        (async () => {
            const $route = {
                path: "/map",
                query: {cityId: testCities[0].id}
            };

            let wrapper = createWrapper({
                route: $route
            });

            const coordinates = testCities[0].coordinates;
            const street = testStreets[0];
            const isLocated = false;

            const getStreetStub = sinon.stub(wrapper.vm.streetsService, "getStreetByCoordinates").resolves({data: street});

            const foundStreet = await wrapper.vm.findClosestStreet(coordinates, testCities[0].id, isLocated);

            expect(getStreetStub.calledOnceWith({
                coordinates: coordinates,
                cityId: testCities[0].id,
                isLocated: isLocated
            })).to.equal(true);
            expect(foundStreet).to.equal(street);

            done();
        })();
    });


    it("should display notice when map emits 'locationerror' event", (done) => {
        let wrapper = createWrapper();

        let noticesServiceWarningSpy = sinon.spy(wrapper.vm.noticesService, "warning");

        wrapper.vm.$refs.map.$emit("locationerror");

        expect(noticesServiceWarningSpy.calledOnce).to.equal(true);

        noticesServiceWarningSpy.restore();

        done();
    });

    it("should set the selected street using given coordinates and street", (done) => {
        let wrapper = createWrapper();

        const street = testStreets[0];
        const coordinates = testCities[0].coordinates;

        let drawStreetSpy = sinon.spy(wrapper.vm, "drawStreet");
        let setStreetMarkerSpy = sinon.spy(wrapper.vm, "setStreetMarker");

        wrapper.vm.setSelectedStreet(street, coordinates);

        expect(drawStreetSpy.calledOnceWith(street)).to.equal(true);
        expect(setStreetMarkerSpy.calledOnceWith(coordinates, street)).to.equal(true);

        expect(wrapper.vm.selectedStreet).to.equal(street);

        done();
    });

    it("should setMarker using the coordinates that belong to the found street", (done) => {
        (async () => {
            let wrapper = createWrapper();

            const street = testStreets[0];
            const coordinates = testCities[0].coordinates;

            let findStreetStub = sinon.stub(wrapper.vm, "findClosestStreet").resolves(street);
            let setSelectedStreetSpy = sinon.spy(wrapper.vm, "setSelectedStreet");

            await wrapper.vm.setMarker(coordinates);

            expect(findStreetStub.calledOnceWith(coordinates)).to.equal(true);
            expect(setSelectedStreetSpy.calledOnceWith(street, coordinates)).to.equal(true);

            done();
        })();
    });

    it("should setMarker for location that does not belong to any street", (done) => {
        (async () => {
            let wrapper = createWrapper();

            const coordinates = testCities[0].coordinates;

            let findStreetStub = sinon.stub(wrapper.vm, "findClosestStreet").resolves(null);
            let setMapViewSpy = sinon.spy(wrapper.vm, "setMapView");

            await wrapper.vm.setMarker(coordinates);

            expect(findStreetStub.calledOnceWith(coordinates)).to.equal(true);

            const markerLatLng = wrapper.vm.markers[0].getLatLng();
            expect(markerLatLng.lat).to.equal(coordinates[0]);
            expect(markerLatLng.lng).to.equal(coordinates[1]);

            const popup = wrapper.vm.markers[0].getPopup();
            const expectedContent = `<b>${constants.NOTICES.NOT_A_STREET.title}</b><br>${constants.NOTICES.NOT_A_STREET.message}`
                .replace(/(\r\n\t|\n|\r\t)/gm,"");
            const content = popup.getContent();
            const formatted = content.replace(/(\r\n\t|\n|\r\t)/gm,"");

            expect(formatted).to.equal(expectedContent);
            expect(setMapViewSpy.calledOnceWith(coordinates)).to.equal(true);

            done();
        })();
    });

    it("should handle the error inside setMarker method and reject the Promise", (done) => {
        (async () => {
            let wrapper = createWrapper();

            const coordinates = testCities[0].coordinates;

            let findStreetStub = sinon.stub(wrapper.vm, "findClosestStreet").resolves(testStreets[0]);
            const message = "Something bad happened";
            sinon.stub(wrapper.vm, "setSelectedStreet").throws(message);

            try {
                await wrapper.vm.setMarker(coordinates);
            } catch (error) {
                expect(findStreetStub.calledOnceWith(coordinates)).to.equal(true);
                expect(error.toString()).to.equal(message);
            } finally {
                done();
            }
        })();
    });

    it("should get the location from navigator.geolocation", (done) => {
        (async () => {
            let wrapper = createWrapper();

            const coordinates = testCities[0].coordinates;

            let getCurrentPositionStub = sinon.stub(navigator.geolocation, "getCurrentPosition").yields({
                coords: {latitude: coordinates[0], longitude: coordinates[1]}
            });

            const location = await wrapper.vm.getLocation();

            expect(getCurrentPositionStub.calledOnce).to.equal(true);
            getCurrentPositionStub.restore();

            expect(location[0]).to.equal(testCities[0].coordinates[0]);
            expect(location[1]).to.equal(testCities[0].coordinates[1]);

            done();
        })();
    });

    it("should return null when failed to retrieve the location from navigator.geolocation", (done) => {
        (async () => {
            let wrapper = createWrapper();

            let getCurrentPositionStub = sinon.stub(navigator.geolocation, "getCurrentPosition").callsArg(1);

            const location = await wrapper.vm.getLocation();

            expect(location).to.equal(null);
            expect(getCurrentPositionStub.calledOnce).to.equal(true);
            getCurrentPositionStub.restore();

            done();
        })();
    });

    it("should react to 'search' event", (done) => {
        let wrapper = createWrapper();

        let onSearchStreetStub = sinon.stub(wrapper.vm, "onSearchStreet");

        wrapper.vm.eventBus.emit("search", testStreets[0].name);

        expect(onSearchStreetStub.calledOnceWith(testStreets[0].name)).to.equal(true);

        done();
    });

    it("should return the default image", (done) => {
        let wrapper = createWrapper();

        const defaultImage = wrapper.vm.defaultImage;

        expect(defaultImage).to.equal(require("../../../static/images/default-image.png"));

        done();
    });

    // init method tests

    it("should call init when mounted", (done) => {
        const $route = {
            path: "/map",
            query: {}
        };

        let initSpy = sinon.spy();

        mount(CityMap, {
            localVue,
            mocks: {
                $route: $route,
                $router: router,
                $store: $store
            },
            methods: {
                init() {
                    initSpy();
                }
            },
            attachToDocument: true
        });

        expect(initSpy.calledOnce).to.equal(true);

        done();
    });

    it("init method should set city from $route.query.cityId without coordinates", (done) => {
        (async () => {
            const $route = {
                path: "/map",
                query: {
                    cityId: testCities[0].id
                }
            };

            const store = {...$store, commit: sinon.stub()};

            try {
                const wrapper = createWrapper({route: $route, store: store});

                const citiesDeferStub = sinon.stub(wrapper.vm.citiesDefer, "promisify").resolves(testCities);
                const getLocationStub = sinon.stub(wrapper.vm, "getLocation").resolves(null);
                const selectCitySpy = sinon.spy(wrapper.vm, "selectCity");

                await wrapper.vm.init();
                expect(selectCitySpy.calledOnceWith(testCities[0])).to.equal(true);

                citiesDeferStub.restore();
                getLocationStub.restore();
                selectCitySpy.restore();

                done();
            } catch (error) {
                console.log(error);
            }
        })();
    });

    it("init method should set the default city if cityId from $route.query.cityId is invalid", (done) => {
        (async () => {
            const $route = {
                path: "/map",
                query: {
                    cityId: 999
                }
            };

            const store = {...$store, commit: sinon.stub()};

            try {
                const wrapper = createWrapper({route: $route, store: store});

                const citiesDeferStub = sinon.stub(wrapper.vm.citiesDefer, "promisify").resolves(testCities);
                const getLocationStub = sinon.stub(wrapper.vm, "getLocation").resolves(testCities[1].coordinates);
                const selectCitySpy = sinon.spy(wrapper.vm, "selectCity");

                await wrapper.vm.init();
                expect(selectCitySpy.calledOnceWith(testCities[0])).to.equal(true);

                citiesDeferStub.restore();
                getLocationStub.restore();
                selectCitySpy.restore();

                done();
            } catch (error) {
                console.log(error);
            }
        })();
    });

    it("init method should set city from $route.query.cityId with coordinates, that belong to the city", (done) => {
        (async () => {
            const $route = {
                path: "/map",
                query: {
                    cityId: testCities[0].id
                }
            };

            const store = {...$store};
            const city = testCities[0];

            try {
                const wrapper = createWrapper({route: $route, store: store});

                const citiesDeferStub = sinon.stub(wrapper.vm.citiesDefer, "promisify").resolves(testCities);
                const getLocationStub = sinon.stub(wrapper.vm, "getLocation").resolves(city.coordinates);
                const selectCityStub = sinon.stub(wrapper.vm, "selectCity");
                const coordinatesBelongToCityStub = sinon.stub(wrapper.vm, "coordinatesBelongToCity").returns(true);

                const setCoordinatesSpy = sinon.spy(wrapper.vm, "setCoordinates");
                const setMarkerStub = sinon.stub(wrapper.vm, "setMarker");

                await wrapper.vm.init();

                expect(selectCityStub.calledWith(testCities[0])).to.equal(true);
                expect(selectCityStub.calledOnce).to.equal(true);

                expect(coordinatesBelongToCityStub.calledWith(city.coordinates, city)).to.equal(true);
                expect(coordinatesBelongToCityStub.calledOnce).to.equal(true);

                expect(setCoordinatesSpy.calledOnceWith(city.coordinates)).to.equal(true);

                const expectedCoordinates = city.coordinates.map(c => parseFloat(c.toFixed(appConfig.coordinatesPrecision)));

                expect(wrapper.vm.coordinates).to.have.ordered.members(expectedCoordinates);

                expect(setMarkerStub.calledWith(expectedCoordinates, city.id, true)).to.equal(true);
                expect(setMarkerStub.calledOnce).to.equal(true);

                citiesDeferStub.restore();
                getLocationStub.restore();
                selectCityStub.restore();
                coordinatesBelongToCityStub.restore();

                done();
            } catch (error) {
                console.log(error);
            }
        })();
    });

    it("init method should set city from $route.query.cityId with coordinates, that don't belong to the city", (done) => {
        (async () => {
            const $route = {
                path: "/map",
                query: {
                    cityId: testCities[0].id
                }
            };

            const store = {...$store};
            const city = testCities[0];
            const coordinates = city.coordinates.map(c => c - 0.1);

            try {
                const wrapper = createWrapper({route: $route, store: store});

                const citiesDeferStub = sinon.stub(wrapper.vm.citiesDefer, "promisify").resolves(testCities);
                const getLocationStub = sinon.stub(wrapper.vm, "getLocation").resolves(coordinates);
                const selectCityStub = sinon.stub(wrapper.vm, "selectCity");
                const coordinatesBelongToCityStub = sinon.stub(wrapper.vm, "coordinatesBelongToCity").returns(false);

                const setCoordinatesSpy = sinon.spy(wrapper.vm, "setCoordinates");
                const setMarkerSpy = sinon.spy(wrapper.vm, "setMarker");

                await wrapper.vm.init();

                expect(selectCityStub.calledWith(testCities[0])).to.equal(true);
                expect(selectCityStub.calledOnce).to.equal(true);

                expect(coordinatesBelongToCityStub.calledWith(coordinates, city)).to.equal(true);
                expect(coordinatesBelongToCityStub.calledOnce).to.equal(true);

                expect(setCoordinatesSpy.calledOnceWith([])).to.equal(true);
                expect(wrapper.vm.coordinates.length).to.equal(0);

                expect(setMarkerSpy.notCalled).to.equal(true);

                citiesDeferStub.restore();
                getLocationStub.restore();
                selectCityStub.restore();
                coordinatesBelongToCityStub.restore();

                done();
            } catch (error) {
                console.log(error);
            }
        })();
    });

    it("init method should autodetect and select the city by coordinates", (done) => {
        (async () => {
            const $route = {
                path: "/map",
                query: {}
            };

            try {
                const wrapper = createWrapper({route: $route});

                const city = testCities[0];

                const citiesDeferStub = sinon.stub(wrapper.vm.citiesDefer, "promisify").resolves(testCities);
                const getLocationStub = sinon.stub(wrapper.vm, "getLocation").resolves(city.coordinates);
                const autoDetectCityStub = sinon.stub(wrapper.vm, "autoDetectCity").returns(city);
                const selectCityStub = sinon.stub(wrapper.vm, "selectCity");

                await wrapper.vm.init();

                expect(autoDetectCityStub.calledWith(city.coordinates)).to.equal(true);
                expect(autoDetectCityStub.calledOnce).to.equal(true);

                expect(selectCityStub.calledWith(city)).to.equal(true);
                expect(selectCityStub.calledOnce).to.equal(true);

                citiesDeferStub.restore();
                getLocationStub.restore();
                autoDetectCityStub.restore();
                selectCityStub.restore();

                done();
            } catch (error) {
                console.log(error);
            }
        })();
    });

    it("should select the first city in list if no cityId and no coordinates on init", (done) => {
        (async () => {
            const $route = {
                path: "/map",
                query: {}
            };

            try {
                const wrapper = createWrapper({route: $route});

                const city = testCities[0];

                const citiesDeferStub = sinon.stub(wrapper.vm.citiesDefer, "promisify").resolves(testCities);
                const getLocationStub = sinon.stub(wrapper.vm, "getLocation").resolves(null);
                const selectCityStub = sinon.stub(wrapper.vm, "selectCity");

                const autoDetectCitySpy = sinon.spy(wrapper.vm, "autoDetectCity");

                await wrapper.vm.init();

                expect(autoDetectCitySpy.notCalled).to.equal(true);

                expect(selectCityStub.calledWith(city)).to.equal(true);
                expect(selectCityStub.calledOnce).to.equal(true);

                citiesDeferStub.restore();
                getLocationStub.restore();
                selectCityStub.restore();

                done();
            } catch (error) {
                console.log(error);
            }
        })();
    });

    it("should show notice about the auto detected city being unsupported", (done) => {
        (async () => {
            const $route = {
                path: "/map",
                query: {}
            };

            try {
                const wrapper = createWrapper({route: $route});

                const unknownCoordinates = [52.520007, 13.404954];

                const citiesDeferStub = sinon.stub(wrapper.vm.citiesDefer, "promisify").resolves(testCities);
                const getLocationStub = sinon.stub(wrapper.vm, "getLocation").resolves(unknownCoordinates);
                const autoDetectCityStub = sinon.stub(wrapper.vm, "autoDetectCity").returns(undefined);

                const selectCitySpy = sinon.spy(wrapper.vm, "selectCity");
                const noticesSpy = sinon.spy(wrapper.vm.noticesService, "info");

                await wrapper.vm.init();

                expect(autoDetectCityStub.calledWith(unknownCoordinates)).to.equal(true);
                expect(autoDetectCityStub.calledOnce).to.equal(true);

                expect(selectCitySpy.notCalled).to.equal(true);

                expect(noticesSpy.calledOnceWith(
                    constants.NOTICES.CITY_NOT_SUPPORTED.title,
                    constants.NOTICES.CITY_NOT_SUPPORTED.message)).to.equal(true);

                citiesDeferStub.restore();
                getLocationStub.restore();
                autoDetectCityStub.restore();
                noticesSpy.restore();

                done();
            } catch (error) {
                console.log(error);
            }
        })();
    });

    //

    it("autoDetectCity should detect the city by coordinates within its bounds", (done) => {
        const $route = {
            path: "/map",
            query: {}
        };

        const wrapper = createWrapper({route: $route});
        const city = testCities[0];
        const coordinates = city.bounds[0][0].map(c => c + 0.001);

        const result = wrapper.vm.autoDetectCity(coordinates);

        expect(result).to.equal(city);

        done();
    });

    it("autoDetectCity not detect any city by unknown coordinates", (done) => {
        const $route = {
            path: "/map",
            query: {}
        };

        const wrapper = createWrapper({route: $route});
        const unknownCoordinates = [52.520007, 13.404954];

        const result = wrapper.vm.autoDetectCity(unknownCoordinates);

        expect(result).to.be.an("undefined");

        done();
    });

    //onLocationSuccess

    it("should set new coordinates onLocationSuccess", (done) => {
        const $route = {
            path: "/map",
            query: {}
        };

        const city = testCities[0];
        const coordinates = city.coordinates.map(c => c + 0.0001);

        let store = {...$store};
        store.state.cities.selectedCity = city;

        const wrapper = createWrapper({
            route: $route,
            store: store
        });

        const formatCoordinatesStub = sinon.stub(wrapper.vm, "formatCoordinates").returns(coordinates);
        const coordinatesChangedStub = sinon.stub(wrapper.vm, "coordinatesChanged").returns(true);
        const coordinatesBelongToCityStub = sinon.stub(wrapper.vm, "coordinatesBelongToCity").returns(true);
        const setMarkerStub = sinon.stub(wrapper.vm, "setMarker");

        wrapper.vm.onLocationSuccess({latitude: coordinates[0], longitude: coordinates[1]});

        expect(formatCoordinatesStub.calledWith(coordinates)).to.equal(true);
        expect(formatCoordinatesStub.calledOnce).to.equal(true);

        expect(coordinatesChangedStub.calledWith(coordinates)).to.equal(true);
        expect(coordinatesChangedStub.calledOnce).to.equal(true);

        expect(coordinatesBelongToCityStub.calledWith(coordinates)).to.equal(true);
        expect(coordinatesBelongToCityStub.calledOnce).to.equal(true);

        expect(wrapper.vm.coordinates).to.equal(coordinates);
        expect(setMarkerStub.calledWith(coordinates, city.id, true)).to.equal(true);

        formatCoordinatesStub.restore();
        coordinatesChangedStub.restore();
        coordinatesBelongToCityStub.restore();
        setMarkerStub.restore();

        done();
    });

    it("should not update location if coordinates haven't changed onLocationSuccess", (done) => {
        const $route = {
            path: "/map",
            query: {}
        };

        const city = testCities[0];
        const coordinates = city.coordinates.map(c => c + 0.0001);

        let store = {...$store};
        store.state.cities.selectedCity = city;

        const wrapper = createWrapper({
            route: $route,
            store: store
        });

        wrapper.vm.coordinates = city.coordinates;

        const formatCoordinatesStub = sinon.stub(wrapper.vm, "formatCoordinates").returns(coordinates);
        const coordinatesChangedStub = sinon.stub(wrapper.vm, "coordinatesChanged").returns(false);
        const coordinatesBelongToCityStub = sinon.stub(wrapper.vm, "coordinatesBelongToCity").returns(true);
        const setMarkerSpy = sinon.spy(wrapper.vm, "setMarker");

        wrapper.vm.onLocationSuccess({latitude: coordinates[0], longitude: coordinates[1]});

        expect(formatCoordinatesStub.calledWith(coordinates)).to.equal(true);
        expect(formatCoordinatesStub.calledOnce).to.equal(true);

        expect(coordinatesChangedStub.calledWith(coordinates)).to.equal(true);
        expect(coordinatesChangedStub.calledOnce).to.equal(true);

        expect(coordinatesBelongToCityStub.calledWith(coordinates)).to.equal(true);
        expect(coordinatesBelongToCityStub.calledOnce).to.equal(true);

        expect(wrapper.vm.coordinates).to.equal(city.coordinates);
        expect(setMarkerSpy.notCalled).to.equal(true);

        formatCoordinatesStub.restore();
        coordinatesChangedStub.restore();
        coordinatesBelongToCityStub.restore();
        setMarkerSpy.restore();

        done();
    });

    it("should should try to autodetect the new city in onLocationSuccess", (done) => {
        const $route = {
            path: "/map",
            query: {}
        };

        const oldCity = testCities[0];
        const newCity = testCities[1];
        const newCoordinates = newCity.coordinates.map(c => c + 0.0001);

        let store = {...$store};
        store.state.cities.selectedCity = oldCity;

        const wrapper = createWrapper({
            route: $route,
            store: store
        });

        wrapper.vm.coordinates = oldCity.coordinates;

        const formatCoordinatesStub = sinon.stub(wrapper.vm, "formatCoordinates").returns(newCoordinates);
        const coordinatesChangedStub = sinon.stub(wrapper.vm, "coordinatesChanged").returns(true);
        const coordinatesBelongToCityStub = sinon.stub(wrapper.vm, "coordinatesBelongToCity").returns(false);
        const setMarkerStub = sinon.stub(wrapper.vm, "setMarker");
        const autoDetectCityStub = sinon.stub(wrapper.vm, "autoDetectCity").returns(newCity);
        const selectCityStub = sinon.stub(wrapper.vm, "selectCity");

        wrapper.vm.onLocationSuccess({latitude: newCoordinates[0], longitude: newCoordinates[1]});

        expect(formatCoordinatesStub.calledWith(newCoordinates)).to.equal(true);
        expect(formatCoordinatesStub.calledOnce).to.equal(true);

        expect(coordinatesChangedStub.calledWith(newCoordinates)).to.equal(true);
        expect(coordinatesChangedStub.calledOnce).to.equal(true);

        expect(coordinatesBelongToCityStub.calledWith(newCoordinates)).to.equal(true);
        expect(coordinatesBelongToCityStub.calledOnce).to.equal(true);

        expect(autoDetectCityStub.calledWith(newCoordinates)).to.equal(true);
        expect(autoDetectCityStub.calledOnce).to.equal(true);

        expect(selectCityStub.calledWith(newCity)).to.equal(true);
        expect(selectCityStub.calledOnce).to.equal(true);

        expect(wrapper.vm.coordinates).to.equal(newCoordinates);

        expect(setMarkerStub.calledWith(newCoordinates, newCity.id, true)).to.equal(true);
        expect(setMarkerStub.calledOnce).to.equal(true);

        formatCoordinatesStub.restore();
        coordinatesChangedStub.restore();
        coordinatesBelongToCityStub.restore();
        setMarkerStub.restore();
        autoDetectCityStub.restore();
        selectCityStub.restore();

        done();
    });

    it("should should try to autodetect the new city in onLocationSuccess and show notice that this city is not supported", (done) => {
        const $route = {
            path: "/map",
            query: {}
        };

        const oldCity = testCities[0];
        const newCity = testCities[1];
        const newCoordinates = newCity.coordinates.map(c => c + 0.0001);

        let store = {...$store};
        store.state.cities.selectedCity = oldCity;

        const wrapper = createWrapper({
            route: $route,
            store: store
        });

        wrapper.vm.coordinates = oldCity.coordinates;

        const formatCoordinatesStub = sinon.stub(wrapper.vm, "formatCoordinates").returns(newCoordinates);
        const coordinatesChangedStub = sinon.stub(wrapper.vm, "coordinatesChanged").returns(true);
        const coordinatesBelongToCityStub = sinon.stub(wrapper.vm, "coordinatesBelongToCity").returns(false);
        const setMarkerSpy = sinon.spy(wrapper.vm, "setMarker");
        const autoDetectCityStub = sinon.stub(wrapper.vm, "autoDetectCity").returns(undefined);
        const selectCitySpy = sinon.spy(wrapper.vm, "selectCity");
        const noticesSpy = sinon.spy(wrapper.vm.noticesService, "info");

        wrapper.vm.onLocationSuccess({latitude: newCoordinates[0], longitude: newCoordinates[1]});

        expect(formatCoordinatesStub.calledWith(newCoordinates)).to.equal(true);
        expect(formatCoordinatesStub.calledOnce).to.equal(true);

        expect(coordinatesChangedStub.calledWith(newCoordinates)).to.equal(true);
        expect(coordinatesChangedStub.calledOnce).to.equal(true);

        expect(coordinatesBelongToCityStub.calledWith(newCoordinates)).to.equal(true);
        expect(coordinatesBelongToCityStub.calledOnce).to.equal(true);

        expect(autoDetectCityStub.calledWith(newCoordinates)).to.equal(true);
        expect(autoDetectCityStub.calledOnce).to.equal(true);

        expect(selectCitySpy.notCalled).to.equal(true);
        expect(wrapper.vm.coordinates).to.equal(oldCity.coordinates);
        expect(setMarkerSpy.notCalled).to.equal(true);

        expect(noticesSpy.calledOnceWith(
            constants.NOTICES.CITY_NOT_SUPPORTED.title,
            constants.NOTICES.CITY_NOT_SUPPORTED.message)).to.equal(true);

        formatCoordinatesStub.restore();
        coordinatesChangedStub.restore();
        coordinatesBelongToCityStub.restore();
        autoDetectCityStub.restore();
        selectCitySpy.restore();
        setMarkerSpy.restore();

        done();
    });

    //

    //focusOnCity

    it("should set city coordinates and bounds on map", (done) => {
        const city = testCities[0];

        const $route = {
            path: "/map",
            query: {}
        };

        const wrapper = createWrapper({route: $route});

        const clearMapStub = sinon.stub(wrapper.vm, "clearMap");
        const setMaxBoundsStub = sinon.stub(wrapper.vm.map, "setMaxBounds");
        const setViewStub = sinon.stub(wrapper.vm.map, "setView");
        const routerStub = sinon.stub(wrapper.vm.$router, "replace");

        wrapper.vm.focusOnCity(city);

        expect(wrapper.vm.selectedStreet).to.equal(null);
        expect(clearMapStub.calledOnce).to.equal(true);

        expect(setMaxBoundsStub.calledWith([city.bounds[0][0], city.bounds[0][2]])).to.equal(true);
        expect(setMaxBoundsStub.calledOnce).to.equal(true);

        expect(setViewStub.calledWith(new L.LatLng(city.coordinates[0], city.coordinates[1]), wrapper.vm.zoom)).to.equal(true);
        expect(setViewStub.calledOnce).to.equal(true);

        expect(routerStub.calledWith({query: {cityId: city.id, lat: undefined, lng: undefined}})).to.equal(true);

        clearMapStub.restore();
        setMaxBoundsStub.restore();
        setViewStub.restore();
        routerStub.restore();

        done();
    });

    //

    //onMapClick

    it("should set coordinates and marker using the data of map click event", (done) => {
        const $route = {
            path: "/map",
            query: {}
        };

        const clock = sinon.useFakeTimers();

        const wrapper = createWrapper({route: $route});

        const city = testCities[0];
        const coordinates = city.coordinates.map(c => c + 0.0001);

        const setCoordinatesSpy = sinon.spy(wrapper.vm, "setCoordinates");
        const clearMapStub = sinon.stub(wrapper.vm, "clearMap");
        const setMarkerStub = sinon.stub(wrapper.vm, "setMarker");

        wrapper.vm.onMapClick({latlng: {lat: coordinates[0], lng: coordinates[1]}});

        clock.next();

        expect(setCoordinatesSpy.calledOnceWith(coordinates)).to.equal(true);
        expect(setMarkerStub.calledOnce).to.equal(true);

        setCoordinatesSpy.restore();
        clearMapStub.restore();
        setMarkerStub.restore();

        clock.restore();

        done();
    });

    //

    it("should set the coordinates", (done) => {
        let wrapper = createWrapper();
        const coordinates = testCities[0].coordinates;

        wrapper.vm.setCoordinates(coordinates);

        expect(wrapper.vm.coordinates[0]).to.equal(parseFloat(coordinates[0].toFixed(appConfig.coordinatesPrecision)));
        expect(wrapper.vm.coordinates[1]).to.equal(parseFloat(coordinates[1].toFixed(appConfig.coordinatesPrecision)));

        done();
    });

    it("should set the coordinates to []", (done) => {
        let wrapper = createWrapper();

        wrapper.vm.setCoordinates([]);

        expect(wrapper.vm.coordinates.length).to.equal(0);

        done();
    });

    it("should add marker to map and open marker popup", (done) => {
        let wrapper = createWrapper();
        let marker = L.marker(testCities[0].coordinates);

        wrapper.vm.sidebar.isOpen = false;

        let sidebarFooterShownStub = sinon.stub(wrapper.vm.sidebar, "isSidebarFooterShown").returns(false);
        let addToSpy = sinon.spy(marker, "addTo");
        let markerOnSpy = sinon.spy(marker, "on");
        let closePopupSpy = sinon.spy(marker, "closePopup");
        let openPopupSpy = sinon.spy(marker, "openPopup");
        let sidebarToggle = sinon.spy(wrapper.vm.sidebar, "toggle");

        wrapper.vm.addImageMarkerToMap(marker);

        expect(markerOnSpy.withArgs("click").calledOnce).to.equal(true);
        expect(addToSpy.calledOnceWith(wrapper.vm.map)).to.equal(true);
        expect(sidebarFooterShownStub.calledOnce).to.equal(true);
        expect(openPopupSpy.calledOnce).to.equal(true);

        // Test the event handlers being called

        marker.fire("click");
        expect(closePopupSpy.calledOnce).to.equal(true);
        expect(sidebarToggle.calledOnce).to.equal(true);

        sidebarFooterShownStub.restore();

        done();
    });

    it("should add marker to map and NOT open marker popup", (done) => {
        let wrapper = createWrapper();
        let marker = L.marker(testCities[0].coordinates);

        wrapper.vm.sidebar.isOpen = true;

        let sidebarFooterShownStub = sinon.stub(wrapper.vm.sidebar, "isSidebarFooterShown").returns(true);
        let addToSpy = sinon.spy(marker, "addTo");
        let markerOnSpy = sinon.spy(marker, "on");
        let closePopupSpy = sinon.spy(marker, "closePopup");
        let openPopupSpy = sinon.spy(marker, "openPopup");
        let sidebarToggle = sinon.spy(wrapper.vm.sidebar, "toggle");

        wrapper.vm.addImageMarkerToMap(marker);

        expect(markerOnSpy.withArgs("click").calledOnce).to.equal(true);
        expect(addToSpy.calledOnceWith(wrapper.vm.map)).to.equal(true);
        expect(sidebarFooterShownStub.notCalled).to.equal(true);
        expect(openPopupSpy.notCalled).to.equal(true);

        // Test the event handlers being called

        marker.fire("click");
        expect(closePopupSpy.calledOnce).to.equal(true);
        expect(sidebarToggle.calledOnce).to.equal(true);

        sidebarFooterShownStub.restore();

        done();
    });

    it("activeNamedEntityTitle should return single named entity name", (done) => {
        let wrapper = createWrapper();
        let testStreet = {...testStreets[0]};
        wrapper.vm.selectedStreet = testStreet;

        let activeNamedEntityTitle = wrapper.vm.activeNamedEntityTitle;

        expect(activeNamedEntityTitle).to.equal(testStreet.namedEntities[0].name);

        done();
    });

    it("activeNamedEntityTitle should return the comma separated named entities names", (done) => {
        let wrapper = createWrapper();

        let testStreet = {...testStreets[0]};
        testStreet.namedEntities.push(testStreet.namedEntities[0]);
        wrapper.vm.selectedStreet = testStreet;

        let activeNamedEntityTitle = wrapper.vm.activeNamedEntityTitle;

        expect(activeNamedEntityTitle).to.equal(`${testStreet.namedEntities[0].name}, ${testStreet.namedEntities[0].name}`);

        done();
    });

    it("activeNamedEntityTitle should return the shortened list of named entity names", (done) => {
        let wrapper = createWrapper();

        let testStreet = {...testStreets[0]};
        testStreet.namedEntities.push(testStreet.namedEntities[0]);
        testStreet.namedEntities.push(testStreet.namedEntities[0]);
        wrapper.vm.selectedStreet = testStreet;

        let activeNamedEntityTitle = wrapper.vm.activeNamedEntityTitle;

        expect(activeNamedEntityTitle).to.equal(`${testStreet.namedEntities[0].name} та ${testStreet.namedEntities.length - 1} інших`);

        done();
    });
});