export default class NoticesService {
    constructor(eventEmitter, clearInterval) {
        this.eventEmitter = eventEmitter;
        this.notices = [];

        setInterval(() => {
            this.notices = [];
        }, clearInterval);
    }

    error(title, text) {
        if(!this.noticeExists("error", title, text)) {
            let notice = {
                title: title,
                text: text,
                type: "error",
                createdAt: Date.now()
            };

            this.notices.push(notice);
            this.eventEmitter.emit("notice", notice);
        }
    }

    warning(title, text) {
        if(!this.noticeExists("warning", title, text)) {
            let notice = {
                title: title,
                text: text,
                type: "warning",
                createdAt: Date.now()
            };

            this.notices.push(notice);
            this.eventEmitter.emit("notice", notice);
        }
    }

    success(title, text) {
        if(!this.noticeExists("success", title, text)) {
            let notice = {
                title: title,
                text: text,
                type: "success",
                createdAt: Date.now()
            };

            this.notices.push(notice);
            this.eventEmitter.emit("notice", notice);
        }
    }

    info(title, text) {
        if(!this.noticeExists("info", title, text)) {
            let notice = {
                title: title,
                text: text,
                type: "info",
                createdAt: Date.now()
            };

            this.notices.push(notice);
            this.eventEmitter.emit("notice", notice);
        }
    }

    noticeExists(type, title, text) {
        return this.notices.find(n => n.type === type && n.title === title && n.text === text) !== undefined;
    }

    onNotice(callback) {
        return this.eventEmitter.on("notice", callback);
    }
}