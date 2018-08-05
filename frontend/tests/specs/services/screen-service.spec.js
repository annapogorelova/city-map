import sinon from "sinon";
import ScreenService from "../../../src/services/screen/screen-service";

describe("ScreenService test", () => {
    const screenService = new ScreenService();

    it("isExtraSmall should return true", (done) => {
        let getWindowWidthStub = sinon.stub(screenService, "getWindowWidth").returns(500);
        let result = screenService.isExtraSmall();

        expect(result).to.equal(true);

        getWindowWidthStub.restore();
        done();
    });

    it("isExtraSmall should return false", (done) => {
        let getWindowWidthStub = sinon.stub(screenService, "getWindowWidth").returns(768);
        let result = screenService.isExtraSmall();

        expect(result).to.equal(false);

        getWindowWidthStub.restore();
        done();
    });

    it("isSmall should return true", (done) => {
        let getWindowWidthStub = sinon.stub(screenService, "getWindowWidth").returns(768);
        let result = screenService.isSmall();

        expect(result).to.equal(true);

        getWindowWidthStub.restore();
        done();
    });

    it("isSmall should return false", (done) => {
        let getWindowWidthStub = sinon.stub(screenService, "getWindowWidth").returns(992);
        let result = screenService.isSmall();

        expect(result).to.equal(false);

        getWindowWidthStub.restore();
        done();
    });

    it("isMedium should return true", (done) => {
        let getWindowWidthStub = sinon.stub(screenService, "getWindowWidth").returns(992);
        let result = screenService.isMedium();

        expect(result).to.equal(true);

        getWindowWidthStub.restore();
        done();
    });

    it("isMedium should return false", (done) => {
        let getWindowWidthStub = sinon.stub(screenService, "getWindowWidth").returns(1200);
        let result = screenService.isMedium();

        expect(result).to.equal(false);

        getWindowWidthStub.restore();
        done();
    });

    it("isLarge should return true", (done) => {
        let getWindowWidthStub = sinon.stub(screenService, "getWindowWidth").returns(1600);
        let result = screenService.isLarge();

        expect(result).to.equal(true);

        getWindowWidthStub.restore();
        done();
    });

    it("isLarge should return false", (done) => {
        let getWindowWidthStub = sinon.stub(screenService, "getWindowWidth").returns(1200);
        let result = screenService.isLarge();

        expect(result).to.equal(false);

        getWindowWidthStub.restore();
        done();
    });

    it("isPortrait should return true", (done) => {
        let getWindowStub = sinon.stub(screenService, "getWindow").returns({innerHeight: 640, innerWidth: 360});

        let result = screenService.isPortrait();

        expect(result).to.equal(true);

        getWindowStub.restore();
        done();
    });

    it("isPortrait should return false", (done) => {
        let getWindowStub = sinon.stub(screenService, "getWindow").returns({innerHeight: 360, innerWidth: 640});

        let result = screenService.isPortrait();

        expect(result).to.equal(false);

        getWindowStub.restore();
        done();
    });

    it("isLandScape should return true", (done) => {
        let getWindowStub = sinon.stub(screenService, "getWindow").returns({innerHeight: 360, innerWidth: 640});

        let result = screenService.isLandScape();

        expect(result).to.equal(true);

        getWindowStub.restore();
        done();
    });

    it("isLandScape should return false", (done) => {
        let getWindowStub = sinon.stub(screenService, "getWindow").returns({innerHeight: 640, innerWidth: 360});

        let result = screenService.isLandScape();

        expect(result).to.equal(false);

        getWindowStub.restore();
        done();
    });

    it("getWindowWidth should get width from window.innerWidth", (done) => {
        const mockWindow = {innerWidth: 360};
        const getWindowStub = sinon.stub(screenService, "getWindow").returns(mockWindow);

        const result = screenService.getWindowWidth();

        expect(result).to.equal(mockWindow.innerWidth);

        getWindowStub.restore();
        done();
    });
});