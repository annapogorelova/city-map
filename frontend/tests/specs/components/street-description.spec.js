import StreetDescription from "../../../src/components/city-map/street-description";
import {shallowMount, createLocalVue} from "@vue/test-utils";
import VueRouter from "vue-router";

describe("StreetDescription test", () => {
    let localVue, router;

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

    beforeEach((done) => {
        localVue = createLocalVue();
        router = new VueRouter();
        localVue.use(router);

        done();
    });

    it("should have the named entity description in html", (done) => {
        let wrapper = shallowMount(StreetDescription, {
            propsData: {
                street: testStreets[0]
            },
            localVue,
            attachToDocument: true
        });

        expect(wrapper.find(".named-entity-container").exists()).to.equal(true);

        done();
    });

    it("should not have the named entity description in html", (done) => {
        let wrapper = shallowMount(StreetDescription, {
            propsData: {
                street: testStreets[1]
            },
            localVue,
            attachToDocument: true
        });

        expect(wrapper.find(".named-entity-container").exists()).to.equal(false);

        done();
    });

    it("should return the default image", (done) => {
        let wrapper = shallowMount(StreetDescription, {
            propsData: {
                street: testStreets[0]
            },
            localVue
        });

        expect(wrapper.vm.defaultImage).to.equal(require("../../../assets/images/default-image.png"));

        done();
    });
});