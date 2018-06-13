import sinon from "sinon";
import SignIn from "../../../src/components/auth/sign-in";
import AuthMixin from "../../../src/mixins/auth-mixin";
import NavigationMixin from "../../../src/mixins/navigation-mixin";
import { mount, createLocalVue } from '@vue/test-utils';
import VueRouter from "vue-router";
import dc from "../../../src/dependency-container";

describe("SignIn component test", () => {
    let localVue, router;

    beforeEach((done) => {
        localVue = createLocalVue();
        localVue.prototype.$dc = dc;
        router = new VueRouter();
        localVue.use(router);

        done();
    });

    it("should navigate to 'admin-streets' if authenticated", (done) => {
        let authMixinStub = sinon.stub(AuthMixin, "data").returns({
            isAuthenticated: true
        });

        let routerMock = sinon.mock(router).expects("push").once().withArgs({name: "admin-streets"});

        mount(SignIn, {
            localVue,
            mocks: {
                $route: {
                    path: "/sign-in"
                },
                $router: router
            },
            mixins: [AuthMixin],
            attachToDocument: true
        });

        expect(authMixinStub.called).to.equal(true);
        routerMock.verify();

        authMixinStub.restore();
        routerMock.restore();

        done();
    });

    it("should not navigate to 'admin-streets' if not authenticated", (done) => {
        let authMixinStub = sinon.stub(AuthMixin, "data").returns({
            isAuthenticated: false
        });

        let routerMock = sinon.mock(router).expects("push").never();

        mount(SignIn, {
            localVue,
            mocks: {
                $route: {
                    path: "/sign-in"
                },
                $router: router
            },
            mixins: [AuthMixin],
            attachToDocument: true
        });

        expect(authMixinStub.called).to.equal(true);
        routerMock.verify();

        authMixinStub.restore();
        routerMock.restore();

        done();
    });

    it("should have formData empty after initialization", (done) => {
        let wrapper = mount(SignIn, {
            localVue,
            mocks: {
                $route: {
                    path: "/sign-in"
                },
                $router: router
            },
            attachToDocument: true
        });

        expect(wrapper.vm.formData.email).to.equal(null);
        expect(wrapper.vm.formData.password).to.equal(null);
        expect(wrapper.vm.isFormValid).to.equal(false);

        done();
    });

    it("should update isFormValid on formData change (valid)", (done) => {
        let wrapper = mount(SignIn, {
            localVue,
            mocks: {
                $route: {
                    path: "/sign-in"
                },
                $router: router
            },
            attachToDocument: true
        });

        wrapper.setData({formData: {email: "tolo@mail.com", password: "tolotolo"}});

        expect(wrapper.vm.isFormValid).to.equal(true);

        done();
    });

    it("should update isFormValid on formData change (invalid)", (done) => {
        let wrapper = mount(SignIn, {
            localVue,
            mocks: {
                $route: {
                    path: "/sign-in"
                },
                $router: router
            },
            attachToDocument: true
        });

        wrapper.setData({formData: {email: "tolo@mail.com", password: ""}});

        expect(wrapper.vm.isFormValid).to.equal(false);

        done();
    });

    it("should call authService.signIn inside onSubmit when formData is valid", (done) => {
        (async () => {
            let goToPathSpy = sinon.spy();

            let navigationMixinStub = sinon.stub(NavigationMixin, "methods").value({
                goToPath: () => {
                    goToPathSpy();
                }
            });

            let authMixinStub = sinon.stub(AuthMixin, "data").returns({
                isAuthenticated: false
            });

            let wrapper = mount(SignIn, {
                localVue,
                mocks: {
                    $route: {
                        path: "/sign-in",
                        query: { }
                    },
                    $router: router
                },
                mixins: [AuthMixin, NavigationMixin],
                attachToDocument: true
            });

            let signInStub = sinon.stub(wrapper.vm.authService, "signIn").resolves();
            let formData = {email: "tolo@mail.com", password: "tolotolo"};

            wrapper.setData({formData: formData, isFormValid: true});

            await wrapper.vm.submit();

            expect(signInStub.calledOnceWith({
                email: formData.email,
                password: formData.password
            })).to.equal(true);

            expect(goToPathSpy.calledOnce).to.equal(true);

            signInStub.restore();
            navigationMixinStub.restore();
            authMixinStub.restore();

            done();
        })();
    });

    it("should not call authService.signIn inside onSubmit when formData is invalid", (done) => {
        (async () => {
            let authMixinStub = sinon.stub(AuthMixin, "data").returns({
                isAuthenticated: false
            });

            let wrapper = mount(SignIn, {
                localVue,
                mocks: {
                    $route: {
                        path: "/sign-in",
                        query: { }
                    },
                    $router: router
                },
                mixins: [AuthMixin],
                attachToDocument: true
            });

            let signInSpy = sinon.spy(wrapper.vm.authService, "signIn");
            let formData = {email: "", password: ""};

            wrapper.setData({formData: formData, isFormValid: false});

            try {
                await wrapper.vm.submit();
            } catch (error) {
                expect(signInSpy.notCalled).to.equal(true);

                signInSpy.restore();
                authMixinStub.restore();

                done();
            }
        })();
    });

    it("should catch the authService signIn method rejection", (done) => {
        (async () => {
            let authMixinStub = sinon.stub(AuthMixin, "data").returns({
                isAuthenticated: false
            });

            let wrapper = mount(SignIn, {
                localVue,
                mocks: {
                    $route: {
                        path: "/sign-in",
                        query: {}
                    },
                    $router: router
                },
                mixins: [AuthMixin],
                attachToDocument: true
            });

            let signInStub = sinon.stub(wrapper.vm.authService, "signIn").rejects();
            let formData = {email: "tolo@mail.com", password: "tolotolo"};
            wrapper.setData({formData: formData, isFormValid: true});

            try {
                await wrapper.vm.submit();
            } catch (error) {
                signInStub.restore();

                done();
            }
        })();
    });
});