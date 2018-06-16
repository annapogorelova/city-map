import NoticesService from "../../../src/services/notices/notices-service";
import sinon from "sinon";
import {EventEmitter} from "tooleks";

describe("NoticesService test", () => {
    let noticesService;

    beforeEach((done) => {
        let eventEmitter = new EventEmitter();
        noticesService = new NoticesService(eventEmitter, 5000);

        done();
    });

    it("should create the instance of NoticesService", (done) => {
        let eventEmitter = new EventEmitter();
        let noticesService = new NoticesService(eventEmitter, 5000);

        expect(noticesService).to.be.an("object");
        expect(noticesService.eventEmitter).to.equal(eventEmitter);
        expect(noticesService.notices.length).to.equal(0);

        done();
    });

    it("should emit error notice event", (done) => {
        let eventEmitterSpy = sinon.spy(noticesService.eventEmitter, "emit");
        let title = "Error";
        let text = "Failed";

        noticesService.error(title, text);

        let notice = {
            title: title,
            text: text,
            type: "error"
        };
        expect(eventEmitterSpy.calledWithMatch("notice", notice)).to.equal(true);
        expect(eventEmitterSpy.calledOnce).to.equal(true);

        expect(noticesService.notices[0].title).to.equal(notice.title);
        expect(noticesService.notices[0].text).to.equal(notice.text);
        expect(noticesService.notices[0].type).to.equal(notice.type);

        eventEmitterSpy.restore();

        done();
    });

    it("should emit warning notice event", (done) => {
        let eventEmitterSpy = sinon.spy(noticesService.eventEmitter, "emit");
        let title = "Warning";
        let text = "Be careful";

        noticesService.warning(title, text);

        let notice = {
            title: title,
            text: text,
            type: "warning"
        };

        expect(eventEmitterSpy.calledWithMatch("notice", notice)).to.equal(true);

        expect(eventEmitterSpy.calledOnce).to.equal(true);

        expect(noticesService.notices[0].title).to.equal(notice.title);
        expect(noticesService.notices[0].text).to.equal(notice.text);
        expect(noticesService.notices[0].type).to.equal(notice.type);

        eventEmitterSpy.restore();

        done();
    });

    it("should emit success notice event", (done) => {
        let eventEmitterSpy = sinon.spy(noticesService.eventEmitter, "emit");
        let title = "Success";
        let text = "It's a success";

        noticesService.success(title, text);

        let notice = {
            title: title,
            text: text,
            type: "success"
        };

        expect(eventEmitterSpy.calledWithMatch("notice", notice)).to.equal(true);
        expect(eventEmitterSpy.calledOnce).to.equal(true);

        expect(noticesService.notices[0].title).to.equal(notice.title);
        expect(noticesService.notices[0].text).to.equal(notice.text);
        expect(noticesService.notices[0].type).to.equal(notice.type);

        eventEmitterSpy.restore();

        done();
    });

    it("should emit info notice event", (done) => {
        let eventEmitterSpy = sinon.spy(noticesService.eventEmitter, "emit");
        let title = "Info";
        let text = "Here is some useful info";

        noticesService.info(title, text);

        let notice = {
            title: title,
            text: text,
            type: "info"
        };

        expect(eventEmitterSpy.calledWithMatch("notice", notice)).to.equal(true);
        expect(eventEmitterSpy.calledOnce).to.equal(true);

        expect(noticesService.notices[0].title).to.equal(notice.title);
        expect(noticesService.notices[0].text).to.equal(notice.text);
        expect(noticesService.notices[0].type).to.equal(notice.type);

        eventEmitterSpy.restore();

        done();
    });

    it("should execute the callback on notice", (done) => {
        let eventEmitterSpy = sinon.spy(noticesService.eventEmitter, "on");
        let title = "Info";
        let text = "Here is some useful info";

        let off = noticesService.onNotice((data) => {
            expect(eventEmitterSpy.calledOnce).to.equal(true);
            expect(off).to.be.a("function");
            expect(data.title).to.equal(title);
            expect(data.text).to.equal(text);

            done();
        });

        noticesService.info(title, text);
    });

    it("should return true from noticeExists", (done) => {
        let notice = {
            title: "Titl",
            text: "Txt",
            type: "info"
        };

        noticesService.notices.push(notice);

        expect(noticesService.noticeExists(notice.type, notice.title, notice.text)).to.equal(true);

        done();
    });

    it("should return false from noticeExists", (done) => {
        let notice = {
            title: "Titl",
            text: "Txt",
            type: "info"
        };

        expect(noticesService.noticeExists(notice.type, notice.title, notice.text)).to.equal(false);

        done();
    });
});