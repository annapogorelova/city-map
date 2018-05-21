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

    warning(title, text) {
        this.eventEmitter.emit("notice", {
            title: title,
            text: text,
            type: "warning",
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

    info(title, text) {
        this.eventEmitter.emit("notice", {
            title: title,
            text: text,
            type: "info",
            createdAt: Date.now()
        });
    }

    onNotice(callback) {
        return this.eventEmitter.on("notice", callback);
    }
}