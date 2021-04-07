import { EventEmitter } from "events";

interface AuthServiceEvents {
    loginChange: [logggedIn: boolean];
    loadedChange: [loaded: boolean];
    connect: [];
}

interface AuthService {
    on<K extends keyof AuthServiceEvents>(type: K, listener: (...args: AuthServiceEvents[K]) => void): this;
    emit<K extends keyof AuthServiceEvents>(type: K, ...args: AuthServiceEvents[K]): boolean;
}

class AuthService extends EventEmitter {
    constructor() {
        super();

        // Handler for when the socket.io client re-connects which is usually a nodecg restart.
        nodecg.socket.on("connect", () => {
            // Give nodecg 200ms to fully connect so everything is usable.
            setTimeout(() => {
                /*// If a password has been entered previously try to directly login using it.
                if (inputPassword.value !== "") {
                    loadFramework();
                } else {
                    updateLoadedStatus();
                    updateFirstStartupLabel();
                }*/
                this.isLoaded();
                this.emit("connect");
            }, 200);
        });
    }

    async isLoaded(): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            nodecg.sendMessage("isLoaded", (_err, res) => resolve(res));
            setTimeout(() => resolve(false), 5000); // Fallback in case connection gets lost.
        }).then((loaded) => {
            this.emit("loadedChange", loaded);
            return loaded;
        });
    }
}

export const authService = new AuthService();
