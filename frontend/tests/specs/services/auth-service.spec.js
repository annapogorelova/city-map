import sinon from "sinon";
import dc from "../../../src/dependency-container/index";
import AuthService from "../../../src/services/auth/auth-service";
import {EventEmitter} from "tooleks";

describe("AuthService test", () => {
    let authService = dc.get("auth");
    let testUser;

    beforeEach((done) => {
        let dateExpires = new Date();
        dateExpires.setMinutes(dateExpires.getMinutes() + 30);

        testUser = {id: 1, email: "test@gmail.com", expiresAt: dateExpires};

        done();
    });

    it("should set all properties in constructor and call initialize", (done) => {
        let api = dc.get("api");
        let localStorage = dc.get("localStorage");
        let eventEmitter = new EventEmitter();
        let eventBus = dc.get("eventBus");
        let key = "user";

        let authService = new AuthService(api, localStorage, eventEmitter, eventBus, key);

        expect(authService.apiService).to.equal(api);
        expect(authService.localStorageService).to.equal(localStorage);
        expect(authService.eventEmitter).to.equal(eventEmitter);
        expect(authService.eventBus).to.equal(eventBus);
        expect(authService.key).to.equal("user");

        done();
    });

    it("should get user on initalize the AuthService", (done) => {
        let getUserStub = sinon.stub(authService, "getUser").returns(testUser);
        let authExpiredStub = sinon.stub(authService, "isAuthExpired").returns(false);

        authService.initialize();

        expect(getUserStub.calledOnce).to.equal(true);
        expect(authExpiredStub.calledOnceWith(testUser)).to.equal(true);

        authExpiredStub.restore();
        getUserStub.restore();

        done();
    });

    it("should get user on initalize the AuthService and set it to null", (done) => {
        let getUserStub = sinon.stub(authService, "getUser").returns(testUser);
        let authExpiredStub = sinon.stub(authService, "isAuthExpired").returns(true);
        let setUserSpy = sinon.spy(authService, "setUser");

        authService.initialize();

        expect(getUserStub.calledOnce).to.equal(true);
        expect(authExpiredStub.calledOnceWith(testUser)).to.equal(true);
        expect(setUserSpy.calledOnceWith(null)).to.equal(true);

        authExpiredStub.restore();
        getUserStub.restore();
        setUserSpy.restore();

        done();
    });

    it("should set user on sign in", (done) => {
        (async () => {
            let apiServicePostStub = sinon.stub(authService.apiService, "post")
                .resolves({data: {user: testUser}});
            let setUserSpy = sinon.spy(authService, "setUser");

            const user = await authService.signIn({email: testUser.email, password: "test"});

            expect(apiServicePostStub.calledOnceWith("/auth", {
                email: testUser.email,
                password: "test"
            })).to.equal(true);
            expect(setUserSpy.calledOnceWith(testUser)).to.equal(true);
            expect(user).to.equal(testUser);

            apiServicePostStub.restore();
            setUserSpy.restore();

            done();
        })();
    });

    it("should reject from the sign in method", (done) => {
        (async () => {
            const message = "Failed to sign in";
            let apiServicePostStub = sinon.stub(authService.apiService, "post")
                .rejects({message: message});

            try {
                await authService.signIn({email: testUser.email, password: "test"});
            } catch (error) {
                expect(apiServicePostStub.calledOnceWith("/auth")).to.equal(true);
                expect(error.message).to.equal(message);
                apiServicePostStub.restore();

                done();
            }
        })();
    });

    it("should sign out the user", (done) => {
        (async () => {
            let apiServiceDeleteStub = sinon.stub(authService.apiService, "delete").resolves();
            let localStorageRemoveSpy = sinon.spy(authService.localStorageService, "remove");
            let eventEmitterSpy = sinon.spy(authService.eventEmitter, "emit");
            let eventBusSpy = sinon.spy(authService.eventBus, "emit");

            await authService.signOut();

            expect(apiServiceDeleteStub.calledOnceWith("/auth")).to.equal(true);
            expect(localStorageRemoveSpy.calledOnceWith(authService.key)).to.equal(true);
            expect(eventEmitterSpy.calledOnceWith(authService.key, null)).to.equal(true);
            expect(eventBusSpy.calledOnceWith("sign-out")).to.equal(true);

            apiServiceDeleteStub.restore();
            localStorageRemoveSpy.restore();
            eventEmitterSpy.restore();
            eventBusSpy.restore();

            done();
        })();
    });

    it("should reject from sign out", (done) => {
        (async () => {
            const message = "Failed to sign out";
            let apiServiceDeleteStub = sinon.stub(authService.apiService, "delete")
                .rejects({message: message});

            try {
                await authService.signOut();
            } catch (error) {
                expect(apiServiceDeleteStub.calledOnceWith("/auth")).to.equal(true);
                expect(error.message).to.equal(message);
                apiServiceDeleteStub.restore();

                done();
            }
        })();
    });

    it("should set the valid user", (done) => {
        let isUserValidSpy = sinon.spy(authService, "isUserValid");
        let localStorageSetSpy = sinon.spy(authService.localStorageService, "set");
        let eventEmitterSpy = sinon.spy(authService.eventEmitter, "emit");

        authService.setUser(testUser);

        expect(isUserValidSpy.calledOnceWith(testUser)).to.equal(true);
        expect(localStorageSetSpy.calledOnceWith(authService.key, testUser)).to.equal(true);
        expect(eventEmitterSpy.calledOnceWith(authService.key, testUser)).to.equal(true);

        isUserValidSpy.restore();
        localStorageSetSpy.restore();
        eventEmitterSpy.restore();

        done();
    });

    it("should remove the user if trying to set the invalid one", (done) => {
        let isUserValidSpy = sinon.spy(authService, "isUserValid");
        let localStorageSetSpy = sinon.spy(authService.localStorageService, "set");
        let localStorageRemoveSpy = sinon.spy(authService.localStorageService, "remove");
        let eventEmitterSpy = sinon.spy(authService.eventEmitter, "emit");

        authService.setUser(null);

        expect(isUserValidSpy.calledOnceWith(null)).to.equal(true);
        expect(localStorageSetSpy.notCalled).to.equal(true);
        expect(localStorageSetSpy.notCalled).to.equal(true);
        expect(eventEmitterSpy.calledOnceWith(authService.key, null)).to.equal(true);

        isUserValidSpy.restore();
        localStorageSetSpy.restore();
        localStorageRemoveSpy.restore();
        eventEmitterSpy.restore();

        done();
    });

    it("should get user from storage", (done) => {
        let localStorageServiceStub = sinon.stub(authService.localStorageService, "get").returns(testUser);
        let user = authService.getUser();

        expect(localStorageServiceStub.calledOnce).to.equal(true);
        expect(user).to.equal(testUser);

        localStorageServiceStub.restore();

        done();
    });

    it("should return true from isAuthenticated", (done) => {
        let getUserStub = sinon.stub(authService, "getUser").returns(testUser);

        let isAuthenticated = authService.isAuthenticated();

        expect(isAuthenticated).to.equal(true);
        expect(getUserStub.calledOnce).to.equal(true);

        getUserStub.restore();

        done();
    });

    it("should return 'false' from isAuthenticated (no user in local storage)", (done) => {
        let getUserStub = sinon.stub(authService, "getUser").returns(null);

        let isAuthenticated = authService.isAuthenticated();

        expect(isAuthenticated).to.equal(false);
        expect(getUserStub.calledOnce).to.equal(true);

        getUserStub.restore();

        done();
    });

    it("should return 'true' from isAuthenticated", (done) => {
        let getUserStub = sinon.stub(authService, "getUser").returns(testUser);

        let isAuthenticated = authService.isAuthenticated();

        expect(isAuthenticated).to.equal(true);
        expect(getUserStub.calledOnce).to.equal(true);

        getUserStub.restore();

        done();
    });

    it("should return 'true' from isUserValid", (done) => {
        let isUserValid = authService.isUserValid(testUser);
        expect(isUserValid).to.equal(true);

        done();
    });

    it("should return 'false' from isUserValid", (done) => {
        let isUserValid = authService.isUserValid(null);
        expect(isUserValid).to.equal(false);

        isUserValid = authService.isUserValid("user");
        expect(isUserValid).to.equal(false);

        isUserValid = authService.isUserValid(undefined);
        expect(isUserValid).to.equal(false);

        done();
    });

    it("should return 'true' from isAuthExpired", (done) => {
        let isAuthExpired = authService.isAuthExpired(null);
        expect(isAuthExpired).to.equal(true);

        let expiredUser = {...testUser, expiresAt: undefined};
        isAuthExpired = authService.isAuthExpired(expiredUser);
        expect(isAuthExpired).to.equal(true);

        let expiredDate = new Date();
        expiredDate.setSeconds(expiredDate.getSeconds() - 1);

        isAuthExpired = authService.isAuthExpired({...testUser, expiresAt: expiredDate});
        expect(isAuthExpired).to.equal(true);

        done();
    });

    it("should return 'false' from isAuthExpired", (done) => {
        let isAuthExpired = authService.isAuthExpired(testUser);
        expect(isAuthExpired).to.equal(false);

        done();
    });

    it("should subscribe to the user change", (done) => {
        let expectedValue = testUser;

        authService.onChange((value) => {
            expect(value).to.equal(expectedValue);
            done();
        });

        authService.setUser(expectedValue);
    });
});