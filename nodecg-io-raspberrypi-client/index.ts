import * as io from "socket.io-client";
import { readFile } from "fs";
import { Gpio, terminate } from "pigpio";

interface Config {
    url: string;
    retryTimeout: number;
    debounceTime: number;
}

const pwmMaxValue = 255;

init();

process.on("exit", terminate);

async function init() {
    const config = await readConfig();
    if (typeof config.url !== "string") {
        throw new Error("Url must be a string");
    }
    if (typeof config.retryTimeout !== "number") {
        config.retryTimeout = 5000;
    }
    if (typeof config.debounceTime !== "number") {
        config.debounceTime = 10000;
    }

    connect(config);
}

function connect(config: Config) {
    console.log(`Connecting to ${config.url}`);
    const client = new Client(config);
    const connection = io(config.url);
    connection.on("read", ({ id }: { id: number }) => {
        if (typeof id === "number") {
            connection.emit("read", { id, value: client.read(id) });
        }
    });
    connection.on("write", ({ id, value }: { id: number; value: number }) => {
        if (typeof id === "number" && typeof value === "number") {
            client.write(id, value);
        }
    });
    connection.on("writePwm", ({ id, value }: { id: number; value: number }) => {
        if (typeof id === "number" && typeof value === "number") {
            client.writePwm(id, value);
        }
    });
    connection.on("interrupt", ({ id }: { id: number }) => {
        if (typeof id === "number") {
            client.setInterruptCallback(id, (value) => {
                connection.emit("interrupt", { id, value });
            });
        }
    });
    connection.on("disconnect", () => {
        client.stop();
    });
}

function readConfig(): Promise<Config> {
    return new Promise<Config>((resolve, reject) => {
        readFile("config.json", "utf8", (err, data) => {
            if (err) {
                reject(err);
            } else {
                try {
                    resolve(JSON.parse(data));
                } catch (error) {
                    reject(error);
                }
            }
        });
    });
}

class Client {
    private readonly pins: Record<number, Gpio> = {};

    constructor(private readonly config: Config) {}

    read(id: number) {
        const pin = this.getPin(id, Gpio.INPUT);
        return pin.digitalRead();
    }

    write(id: number, value: number) {
        if (value === 0 || value === 1) {
            const pin = this.getPin(id, Gpio.OUTPUT);
            pin.digitalWrite(value);
        }
    }

    writePwm(id: number, value: number) {
        if (value >= 0 && value <= pwmMaxValue) {
            const pin = this.getPin(id, Gpio.OUTPUT);
            pin.pwmWrite(value);
        }
    }

    setInterruptCallback(id: number, callback: (value: number) => void) {
        const pin = this.getPin(id, Gpio.INPUT, true);
        pin.glitchFilter(this.config.debounceTime);
        pin.on("alert", callback);
    }

    stop() {
        for (const id in this.pins) {
            if (Object.prototype.hasOwnProperty.call(this.pins, id)) {
                const pin = this.pins[id];
                pin.removeAllListeners();
            }
        }
        terminate();
    }

    private getPin(id: number, mode: number, alert?: boolean) {
        if (!this.pins[id]) {
            this.pins[id] = new Gpio(id, { mode, alert });
        }
        return this.pins[id];
    }
}
