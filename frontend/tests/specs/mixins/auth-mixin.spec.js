import {shallowMount, createLocalVue} from "@vue/test-utils";
import sinon from "sinon";
import dc from "../../../src/dependency-container";
import AuthMixin from "../../../src/mixins/auth-mixin";
import VueRouter from "vue-router";
import DummyComponent from "./dummy-component";

describe("Auth mixin test", () => {
    let localVue, router;

    beforeEach((done) => {
        localVue = createLocalVue();
        localVue.prototype.$dc = dc;
        router = new VueRouter();
        localVue.use(router);
        done();
    });

    it("should have 'authService' inherited from the AuthMixin", (done) => {
        let wrapper = shallowMount(DummyComponent, {
            localVue,
            mixins: [AuthMixin]
        });

        expect(wrapper.vm.authService).to.be.an('object');
        expect(wrapper.vm.unsubscribeFromAuthChanges).not.to.be.an('undefined');

        done();
    });

    it("should return 'false' as initial value from isAuthenticated", (done) => {
        let isAuthenticatedStub = sinon.stub(localVue.prototype.$dc.get("auth"), "isAuthenticated").returns(false);

        let wrapper = shallowMount(DummyComponent, {
            localVue,
            mixins: [AuthMixin]
        });

        expect(wrapper.vm.isAuthenticated).to.equal(false);

        isAuthenticatedStub.restore();

        done();
    });

    it("should return 'true' as initial value from isAuthenticated", (done) => {
        let isAuthenticatedStub = sinon.stub(localVue.prototype.$dc.get("auth"), "isAuthenticated").returns(true);

        let wrapper = shallowMount(DummyComponent, {
            localVue,
            mixins: [AuthMixin]
        });

        expect(wrapper.vm.isAuthenticated).to.equal(true);

        isAuthenticatedStub.restore();

        done();
    });

    it("should sign out when the route requires auth and user is not authenticated", (done) => {
        let isAuthenticatedStub = sinon.stub(localVue.prototype.$dc.get("auth"), "isAuthenticated").returns(false);

        const clock = sinon.useFakeTimers();

        const $route = {
            name: "admin-streets",
            meta: {
                requiresAuth: true
            }
        };

        let wrapper = shallowMount(DummyComponent, {
            localVue,
            mocks: {
                $route: $route,
                $router: router
            },
            mixins: [AuthMixin]
        });

        let goToSignInPageStub = sinon.stub(wrapper.vm, "goToSignInPage").returns();
        let signOutStub = sinon.stub(wrapper.vm.authService, "signOut").returns();
        let noticesInfoStub = sinon.stub(wrapper.vm.$dc.get("notices"), "info").returns();

        clock.next();

        expect(goToSignInPageStub.calledOnce).to.equal(true);
        expect(signOutStub.calledOnce).to.equal(true);
        expect(noticesInfoStub.calledOnce).to.equal(true);

        isAuthenticatedStub.restore();
        goToSignInPageStub.restore();
        noticesInfoStub.restore();

        clock.restore();

        done();
    });
});