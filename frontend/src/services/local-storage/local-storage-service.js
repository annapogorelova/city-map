export default class LocalStorageService {
    constructor(storage) {
        this.storage = storage;
    }

    get(key) {
        if (this.exists(key)) {
            const rawValue = this.storage.getItem(key);
            return typeof rawValue !== "undefined" ? JSON.parse(rawValue) : undefined;
        }
    }

    set(key, data) {
        return this.storage.setItem(key, JSON.stringify(data));
    }

    remove(key) {
        this.storage.removeItem(key);
    }

    exists(key) {
        return this.storage.getItem(key) !== null;
    }
}