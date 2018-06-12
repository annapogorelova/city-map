import sinon from "sinon";
import dc from "../../../src/dependency-container/index";
import LocalStorageService from "../../../src/services/local-storage/local-storage-service";

describe("LocalStorageService test", () => {
    let localStorageService = dc.get("localStorage");
    let key = "user";
    let data = {id: 1, name: "tolo"};

    it("should create the localStorage service", (done) => {
        let localStorageService = new LocalStorageService(localStorage);

        expect(localStorageService.storage).to.not.equal(undefined);

        done();
    });

    it("should return 'false' from exists", (done) => {
        let getSpy = sinon.spy(localStorageService.storage, "getItem");
        let exists = localStorageService.exists("key");

        expect(exists).to.equal(false);
        expect(getSpy.calledOnceWith("key")).to.equal(true);

        getSpy.restore();

        done();
    });

    it("should return 'true' from exists", (done) => {
        let getStub = sinon.stub(localStorageService.storage, "getItem").returns({name: "hello"});
        let exists = localStorageService.exists("key");

        expect(exists).to.equal(true);
        expect(getStub.calledOnceWith("key")).to.equal(true);

        getStub.restore();

        done();
    });

    it("should set data to storage", (done) => {
        let setItemMock = sinon.mock(localStorageService.storage)
            .expects("setItem")
            .withArgs(key, JSON.stringify(data))
            .once();

        localStorageService.set(key, data);

        setItemMock.verify();
        setItemMock.restore();

        done();
    });

    it("should remove item from storage", (done) => {
        let removeItemMock = sinon.mock(localStorageService.storage)
            .expects("removeItem")
            .withArgs(key)
            .once();

        localStorageService.remove(key);

        removeItemMock.verify();
        removeItemMock.restore();

        done();
    });

    it("should get item from storage (key exists)", (done) => {
        let getItemStub = sinon.stub(localStorageService.storage, "getItem").returns(JSON.stringify(data));
        let existsStub = sinon.stub(localStorageService, "exists").returns(true);

        let item = localStorageService.get(key);

        expect(item).to.deep.equal(data);
        expect(existsStub.calledOnceWith(key)).to.equal(true);

        existsStub.restore();
        getItemStub.restore();

        done();
    });

    it("should get item from storage (key does not exist)", (done) => {
        let existsStub = sinon.stub(localStorageService, "exists").returns(false);

        let item = localStorageService.get(key);

        expect(item).to.equal(undefined);
        expect(existsStub.calledOnceWith(key)).to.equal(true);

        existsStub.restore();

        done();
    });


    it("should get item from storage (value undefined)", (done) => {
        let getItemStub = sinon.stub(localStorageService.storage, "getItem").returns(undefined);
        let existsStub = sinon.stub(localStorageService, "exists").returns(false);

        let item = localStorageService.get(key);

        expect(item).to.equal(undefined);
        expect(existsStub.calledOnceWith(key)).to.equal(true);

        existsStub.restore();
        getItemStub.restore();

        done();
    });
});