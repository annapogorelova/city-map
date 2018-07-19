import CityMap from "../../../src/components/city-map/city-map.vue";
import {mount, createLocalVue} from "@vue/test-utils";
import dc from "../../../src/dependency-container/index";
import VueRouter from "vue-router";
import sinon from "sinon";
import {optional} from "tooleks";
import constants from "../../../src/constants";
import appConfig from "../../../src/app.config";

describe("CityMap test", () => {
    let localVue, router;

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

    function getMapBounds(city) {
        return optional(() => [city.bounds[0][0], city.bounds[0][2]]);
    }

    function createWrapper({route} = {}) {
        const $route = {
            path: "/map",
            query: {}
        };

        return mount(CityMap, {
            localVue,
            mocks: {
                $route: route || $route,
                $router: router
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

        done();
    });

    it("has hooks", () => {
        expect(typeof(CityMap.created)).to.equal("function");
        expect(typeof(CityMap.mounted)).to.equal("function");
        expect(typeof(CityMap.beforeDestroy)).to.equal("function");
    });

    it("should subscribe to 'search' and 'city-selected' on created hook", (done) => {
        let wrapper = createWrapper();

        expect(wrapper.vm.searchEventOff).to.not.equal(undefined);
        expect(wrapper.vm.citySelectOff).to.not.equal(undefined);

        done();
    });

    it("should unsubscribe from 'search' and 'city-selected' on destroy", (done) => {
        const destroySpy = sinon.stub();

        const $route = {
            path: "/map",
            query: {}
        };

        let wrapper = mount(CityMap, {
            localVue,
            mocks: {
                $route: $route,
                $router: router
            },
            destroyed() {
                destroySpy();
            },
            attachToDocument: true
        });

        let searchEventOffSpy = sinon.spy(wrapper.vm, "searchEventOff");
        let citySelectOffSpy = sinon.spy(wrapper.vm, "citySelectOff");

        wrapper.destroy();

        expect(destroySpy.called).to.equal(true);
        expect(searchEventOffSpy.called).to.equal(true);
        expect(citySelectOffSpy.called).to.equal(true);

        done();
    });

    it("should have cityId null", (done) => {
        const $route = {
            path: "/map",
            query: {}
        };

        let wrapper = createWrapper({route: $route});

        expect(wrapper.vm.cityId).to.equal(null);
        done();
    });

    it("should take cityId from url query", (done) => {
        const $route = {
            path: "/map",
            query: {cityId: 1}
        };

        let wrapper = createWrapper({route: $route});

        expect(wrapper.vm.cityId).to.equal(1);
        done();
    });

    it("should set city on 'city-selected' event (previous city not set)", (done) => {
        let wrapper = createWrapper();

        const panToSpy = sinon.spy(wrapper.vm.$refs.map, "panTo");
        const setMaxBoundsSpy = sinon.spy(wrapper.vm.map, "setMaxBounds");
        const setMapZoomSpy = sinon.spy(wrapper.vm.map, "setZoom");
        const setCoordinatesSpy = sinon.spy(wrapper.vm, "setCoordinates");

        const city = testCities[0];
        wrapper.vm.selectCity(city);

        expect(wrapper.vm.city).to.equal(city);
        expect(wrapper.vm.selectedStreet).to.equal(null);
        expect(setMaxBoundsSpy.calledWith(getMapBounds(city))).to.equal(true);
        expect(panToSpy.calledOnceWith(city.coordinates)).to.equal(true);
        expect(setCoordinatesSpy.calledOnceWith(city.coordinates)).to.equal(true);
        expect(setMapZoomSpy.calledOnceWith(wrapper.vm.zoom)).to.equal(true);

        panToSpy.restore();
        setMaxBoundsSpy.restore();
        setMapZoomSpy.restore();
        setCoordinatesSpy.restore();

        done();
    });

    it("should set new city on 'city-selected'", (done) => {
        let wrapper = createWrapper();

        const panToSpy = sinon.spy(wrapper.vm.$refs.map, "panTo");
        const setMaxBoundsSpy = sinon.spy(wrapper.vm.map, "setMaxBounds");
        const setMapZoomSpy = sinon.spy(wrapper.vm.map, "setZoom");
        const setCoordinatesSpy = sinon.spy(wrapper.vm, "setCoordinates");

        const initialCity = testCities[0];
        wrapper.vm.city = initialCity;

        expect(wrapper.vm.city.id).to.equal(initialCity.id);
        expect(wrapper.vm.city.name).to.equal(initialCity.name);
        expect(wrapper.vm.selectedStreet).to.equal(undefined);

        // city $watch should trigger
        expect(panToSpy.calledOnceWith(initialCity.coordinates)).to.equal(true);
        expect(setMaxBoundsSpy.calledWith(getMapBounds(initialCity))).to.equal(true);
        expect(setMapZoomSpy.calledOnceWith(wrapper.vm.zoom)).to.equal(true);
        expect(setCoordinatesSpy.calledOnceWith(initialCity.coordinates)).to.equal(true);

        panToSpy.resetHistory();
        setMaxBoundsSpy.resetHistory();
        setMapZoomSpy.resetHistory();
        setCoordinatesSpy.resetHistory();

        const city = testCities[1];
        wrapper.vm.selectCity(city);

        expect(wrapper.vm.city).to.equal(city);
        expect(wrapper.vm.selectedStreet).to.equal(null);

        expect(panToSpy.calledOnceWith(city.coordinates)).to.equal(true);
        expect(setMaxBoundsSpy.calledWith(getMapBounds(city))).to.equal(true);
        expect(setMapZoomSpy.calledOnceWith(wrapper.vm.zoom)).to.equal(true);
        expect(setCoordinatesSpy.calledOnceWith(city.coordinates)).to.equal(true);

        done();
    });

    it("should load the city when $route.query.cityId is set for the first time", (done) => {
        const $route = {
            path: "/map",
            query: {cityId: undefined}
        };

        let wrapper = createWrapper({route: $route});

        const city = testCities[0];

        let selectCitySpy = sinon.spy(wrapper.vm, "selectCity");
        let citiesServiceStub = sinon.stub(wrapper.vm.citiesService, "getCity").resolves({data: city});

        wrapper.setData({$route: {query: {cityId: city.id}}});

        expect(citiesServiceStub.calledWith(city.id)).to.equal(true);

        wrapper.vm.$nextTick(() => {
            expect(selectCitySpy.calledWith(city)).to.equal(true);
            expect(wrapper.vm.city).to.equal(city);
            expect(wrapper.vm.selectedStreet).to.equal(null);

            done();
        });
    });

    it("should load the city when $route.query.cityId is changed (city exists)", (done) => {
        const $route = {
            path: "/map",
            query: {cityId: undefined}
        };

        let wrapper = createWrapper({route: $route});

        wrapper.vm.city = testCities[0];
        wrapper.vm.selectedStreet = testStreets[0];

        const newCity = testCities[1];

        let selectCitySpy = sinon.spy(wrapper.vm, "selectCity");
        let citiesServiceStub = sinon.stub(wrapper.vm.citiesService, "getCity").resolves({data: newCity});

        wrapper.setData({$route: {query: {cityId: newCity.id}}});

        expect(citiesServiceStub.calledWith(newCity.id)).to.equal(true);

        wrapper.vm.$nextTick(() => {
            expect(selectCitySpy.calledWith(newCity)).to.equal(true);
            expect(wrapper.vm.city).to.equal(newCity);
            expect(wrapper.vm.selectedStreet).to.equal(null);

            done();
        });
    });

    it("should not load the new city if the cityId has not changed", (done) => {
        const $route = {
            path: "/map",
            query: {cityId: 1}
        };

        let wrapper = createWrapper({route: $route});

        const city = testCities[0];
        wrapper.vm.city = city;

        let citiesServiceStub = sinon.stub(wrapper.vm.citiesService, "getCity").resolves({data: city});

        wrapper.setData({$route: {query: {cityId: city.id}}});

        expect(citiesServiceStub.notCalled).to.equal(true);

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

            let wrapper = createWrapper({route: $route});
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

    it("should react to street not found", (done) => {
        (async () => {
            const $route = {
                path: "/map",
                query: {}
            };

            let wrapper = createWrapper({route: $route});
            let noticesServiceSpy = sinon.spy(wrapper.vm.noticesService, "info");

            sinon.stub(wrapper.vm.streetsService, "search").resolves({data: []});

            await wrapper.vm.onSearchStreet("aslld");

            expect(wrapper.vm.coordinates.length).to.equal(0);
            expect(wrapper.vm.selectedStreet).to.equal(null);

            expect(noticesServiceSpy.calledWith(
                constants.NOTICES.STREET_NOT_FOUND.title,
                constants.NOTICES.STREET_NOT_FOUND.message)).to.equal(true);

            done();
        })();
    });

    it("should reject when streetName is empty", (done) => {
        (async () => {
            const $route = {
                path: "/map",
                query: {}
            };

            let wrapper = createWrapper({route: $route});

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

            let wrapper = createWrapper({route: $route});

            const coordinates = testCities[0].coordinates;
            const street = testStreets[0];
            const isLocated = false;

            const getStreetStub = sinon.stub(wrapper.vm.streetsService, "getStreetByCoordinates").resolves({data: street});

            const foundStreet = await wrapper.vm.findClosestStreet(coordinates, testCities[0].id, isLocated);

            expect(getStreetStub.calledOnceWith({coordinates: coordinates, cityId: testCities[0].id, isLocated: isLocated})).to.equal(true);
            expect(foundStreet).to.equal(street);

            done();
        })();
    });

    it("should set marker when map emits 'locationsuccess' event", (done) => {
        let wrapper = createWrapper();

        const coordinates = testCities[0].coordinates;

        let setMarkerSpy = sinon.spy(wrapper.vm, "setMarker");
        let setCoordinatesSpy = sinon.spy(wrapper.vm, "setCoordinates");

        wrapper.vm.$refs.map.$emit("locationsuccess", {latitude: coordinates[0], longitude: coordinates[1]});

        expect(setCoordinatesSpy.calledOnceWith(coordinates)).to.deep.equal(true);
        expect(setMarkerSpy.calledOnce).to.equal(true);

        setMarkerSpy.restore();
        setCoordinatesSpy.restore();

        done();
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
            expect(popup.isOpen()).to.equal(true);

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

    it("should get the location from the $route query", (done) => {
        (async () => {
            const $route = {
                path: "/map",
                query: {
                    cityId: testCities[0].id,
                    lat: testCities[0].coordinates[0],
                    lng: testCities[0].coordinates[1]
                }
            };

            let wrapper = createWrapper({route: $route});

            const location = await wrapper.vm.getLocation();

            expect(location[0]).to.equal(testCities[0].coordinates[0]);
            expect(location[1]).to.equal(testCities[0].coordinates[1]);

            done();
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

    it("should show notice error when failed to retrieve the location from navigator.geolocation", (done) => {
        let wrapper = createWrapper();

        let getCurrentPositionStub = sinon.stub(navigator.geolocation, "getCurrentPosition").callsArg(1);

        wrapper.vm.getLocation().catch(() => {
            expect(getCurrentPositionStub.calledOnce).to.equal(true);
            getCurrentPositionStub.restore();
            done();
        })
    });

    it("should react to 'search' event", (done) => {
        let wrapper = createWrapper();

        let onSearchStreetStub = sinon.stub(wrapper.vm, "onSearchStreet");

        wrapper.vm.eventBus.emit("search", testStreets[0].name);

        expect(onSearchStreetStub.calledOnceWith(testStreets[0].name)).to.equal(true);

        done();
    });

    it("should react to 'city-selected' event", (done) => {
        let wrapper = createWrapper();

        let selectCityStub = sinon.stub(wrapper.vm, "selectCity");

        wrapper.vm.eventBus.emit("city-selected", testCities[0]);

        expect(selectCityStub.calledOnceWith(testCities[0])).to.equal(true);

        done();
    });

    it("should return the default image", (done) => {
        let wrapper = createWrapper();

        const defaultImage = wrapper.vm.defaultImage;

        expect(defaultImage).to.equal(require("../../../static/images/default-image.png"));

        done();
    });

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
                $router: router
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

    it("should successfully process the result of location and city in init method", (done) => {
        (async () => {
            try {
                let wrapper = createWrapper();
                wrapper.vm.city = testCities[0];
                const coordinates = testCities[0].coordinates;
                let getLocationStub = sinon.stub(wrapper.vm, "getLocation").resolves(coordinates);
                let cityDeferStub = sinon.stub(wrapper.vm.cityDefer, "promisify").resolves(testCities[0]);
                let setMarkerStub = sinon.stub(wrapper.vm, "setMarker").resolves();
                let setCoordinatesSpy = sinon.spy(wrapper.vm, "setCoordinates");

                await wrapper.vm.init();

                expect(getLocationStub.calledOnce).to.equal(true);
                expect(cityDeferStub.calledOnce).to.equal(true);
                expect(setCoordinatesSpy.calledOnceWith(coordinates)).to.equal(true);
                expect(setMarkerStub.calledOnceWith(wrapper.vm.coordinates, testCities[0].id)).to.equal(true);
                expect(setMarkerStub.calledAfter(setCoordinatesSpy)).to.equal(true);

                getLocationStub.restore();
                cityDeferStub.restore();
                setMarkerStub.restore();
                setCoordinatesSpy.restore();

                done();
            } catch (e) {
                console.log(e)
            }
        })();
    });

    it("should not set coordinates when location regected", (done) => {
        (async () => {
            let wrapper = createWrapper();
            wrapper.vm.city = testCities[0];
            let getLocationStub = sinon.stub(wrapper.vm, "getLocation").rejects();
            let cityDeferSpy = sinon.stub(wrapper.vm.cityDefer, "promisify");
            let setMarkerSpy = sinon.spy(wrapper.vm, "setMarker");
            let noticeErrorSpy = sinon.spy(wrapper.vm.noticesService, "error");
            let setCoordinatesSpy = sinon.spy(wrapper.vm, "setCoordinates");

            try {
                await wrapper.vm.init();
            } catch (e) {
                expect(getLocationStub.calledOnce).to.equal(true);
                expect(cityDeferSpy.calledOnce).to.equal(true);
                expect(setCoordinatesSpy.notCalled).to.equal(true);
                expect(setMarkerSpy.notCalled).to.equal(true);

                getLocationStub.restore();
                cityDeferSpy.restore();
                setMarkerSpy.restore();
                noticeErrorSpy.restore();
                setCoordinatesSpy.restore();

                done();
            }
        })();
    });

    it("should set coordinates and marker on map click", (done) => {
        let wrapper = createWrapper();
        wrapper.vm.city = testCities[0];
        const coordinates = testCities[0].coordinates;
        let setMarkerSpy = sinon.spy(wrapper.vm, "setMarker");
        let setCoordinatesSpy = sinon.spy(wrapper.vm, "setCoordinates");
        let clearMapSpy = sinon.spy(wrapper.vm, "clearMap");

        wrapper.vm.map.fire("click", {latlng: {lat: coordinates[0], lng: coordinates[1]}});

        setTimeout(() => {
            expect(setCoordinatesSpy.calledOnceWith(coordinates)).to.equal(true);
            expect(setMarkerSpy.calledAfter(setCoordinatesSpy)).to.equal(true);
            expect(setMarkerSpy.calledOnceWith(wrapper.vm.coordinates, testCities[0].id)).to.equal(true);
            expect(clearMapSpy.called).to.equal(true);

            done();
        }, 1000);
    });

    it("should set the coordinates", (done) => {
        let wrapper = createWrapper();
        const coordinates = testCities[0].coordinates;

        wrapper.vm.setCoordinates(coordinates);

        expect(wrapper.vm.coordinates[0]).to.equal(coordinates[0].toFixed(appConfig.coordinatesPrecision));
        expect(wrapper.vm.coordinates[1]).to.equal(coordinates[1].toFixed(appConfig.coordinatesPrecision));

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