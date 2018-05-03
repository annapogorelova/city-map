export default class NoticesService {
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;
    }

    error(title, text) {
        this.eventEmitter.emit("notice", {
            title: title,
            text: text,
            type: "error",
            createdAt: Date.now()
        });
    }

    success(title, text) {
        this.eventEmitter.emit("notice", {
            title: title,
            text: text,
            type: "success",
            createdAt: Date.now()
        });
    }

    onNotice(callback) {
        this.eventEmitter.on("notice", callback);
    }
}