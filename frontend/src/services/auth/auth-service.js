export default class AuthService {
    constructor(apiService, localStorageService, eventEmitter, key) {
        this.apiService = apiService;
        this.localStorageService = localStorageService;
        this.eventEmitter = eventEmitter;
        this.key = key;
        this.initialize();
    }

    initialize() {
        const user = this.getUser();
        if (this.isAuthExpired(user)) {
            this.setUser(null);
        }
    }

    signIn({email, password}) {
        return this.apiService.post("/auth", {email: email, password: password}).then(response => {
            this.setUser(response.data.user);
            return response.data;
        });
    }

    signOut() {
        return this.apiService.delete("/auth").then(() => {
            this.localStorageService.remove(this.key);
            this.eventEmitter.emit(this.key, null);
        });
    }

    setUser(user) {
        if (this.isUserValid(user)) {
            this.localStorageService.set(this.key, user);
        } else {
            this.localStorageService.remove(this.key);
        }
        this.eventEmitter.emit(this.key, user);
    }

    getUser() {
        return this.localStorageService.get(this.key);
    }

    isAuthenticated() {
        return this.localStorageService.exists(this.key);
    }

    isUserValid(user) {
        return typeof user === "object" && user !== null;
    }

    isAuthExpired(user) {
        return !this.isUserValid(user) ||
            !user.expiresAt ||
            new Date().getTime() > new Date(user.expiresAt).getTime();
    }

    onChange(callback) {
        this.eventEmitter.on(this.key, callback);
    }
}