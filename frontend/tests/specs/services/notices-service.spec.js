import NoticesService from "../../../src/services/notices/notices-service";
import dc from "../../../src/dependency-container/index";
import sinon from "sinon";
import {EventEmitter} from "tooleks";

describe("NoticesService test", () => {
    let noticesService = dc.get("notices");

    it("should create the instance of NoticesService", (done) => {
        let eventEmitter = new EventEmitter();
        let noticesService = new NoticesService(eventEmitter);

        expect(noticesService).to.be.an("object");
        expect(noticesService.eventEmitter).to.equal(eventEmitter);

        done();
    });

    it("should emit error notice event", (done) => {
        let eventEmitterSpy = sinon.spy(noticesService.eventEmitter, "emit");
        let title = "Error";
        let text = "Failed";

        noticesService.error(title, text);

        expect(eventEmitterSpy.calledWithMatch("notice", {
            title: title,
            text: text,
            type: "error"
        })).to.equal(true);
        expect(eventEmitterSpy.calledOnce).to.equal(true);

        eventEmitterSpy.restore();

        done();
    });

    it("should emit warning notice event", (done) => {
        let eventEmitterSpy = sinon.spy(noticesService.eventEmitter, "emit");
        let title = "Warning";
        let text = "Be careful";

        noticesService.warning(title, text);

        expect(eventEmitterSpy.calledWithMatch("notice", {
            title: title,
            text: text,
            type: "warning"
        })).to.equal(true);
        expect(eventEmitterSpy.calledOnce).to.equal(true);

        eventEmitterSpy.restore();

        done();
    });

    it("should emit success notice event", (done) => {
        let eventEmitterSpy = sinon.spy(noticesService.eventEmitter, "emit");
        let title = "Success";
        let text = "It's a success";

        noticesService.success(title, text);

        expect(eventEmitterSpy.calledWithMatch("notice", {
            title: title,
            text: text,
            type: "success"
        })).to.equal(true);
        expect(eventEmitterSpy.calledOnce).to.equal(true);

        eventEmitterSpy.restore();

        done();
    });

    it("should emit info notice event", (done) => {
        let eventEmitterSpy = sinon.spy(noticesService.eventEmitter, "emit");
        let title = "Info";
        let text = "Here is some useful info";

        noticesService.info(title, text);

        expect(eventEmitterSpy.calledWithMatch("notice", {
            title: title,
            text: text,
            type: "info"
        })).to.equal(true);
        expect(eventEmitterSpy.calledOnce).to.equal(true);

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
});