import { EventEmitter } from "events";

interface AuthServiceEvents {
    loginChange: [logggedIn: boolean];
    loadedChange: [loaded: boolean];
    connect: [];
}

interface AuthService {
    on<K extends keyof AuthServiceEvents>(type: K, listener: (...args: AuthServiceEvents[K]) => void): this;
    off<K extends keyof AuthServiceEvents>(type: K, listener: (...args: AuthServiceEvents[K]) => void): this;
    emit<K extends keyof AuthServiceEvents>(type: K, ...args: AuthServiceEvents[K]): boolean;
}

class AuthService extends EventEmitter {
    constructor() {
        super();

        // Handler for when the socket.io client re-connects which is usually a nodecg restart.
        nodecg.socket.on("connect", () => {
            // Give nodecg 200ms to fully connect so everything is usable.
            setTimeout(() => {
                this.isLoaded();
                this.emit("connect");
            }, 200);
        });
    }

    async isLoaded(): Promise<boolean> {
        const loaded: boolean = await nodecg.sendMessage("isLoaded");
        this.emit("loadedChange", loaded);
        return loaded;
    }

    isFirstStartup(): Promise<boolean> {
        return nodecg.sendMessage("isFirstStartup");
    }
}

export const authService = new AuthService();
