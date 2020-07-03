import * as io from "socket.io-client";
import { readFile } from "fs";
import { Gpio } from "pigpio";

interface Config {
    url: string;
    retryTimeout: number;
}

init();

async function init() {
    const config = await readConfig();
    if (typeof config.url !== "string") {
        throw new Error("Url must be a string");
    }

    tryConnect(config);
}

async function tryConnect(config: Config) {
    try {
        await connect(config);
    } catch (error) {
        let timeout = config.retryTimeout;
        if (typeof timeout !== "number") {
            timeout = 5000;
        }
        setTimeout(() => tryConnect(config), timeout);
    }
}

async function connect(config: Config) {
    const client = new Client();
    const connection = io(config.url);
    connection.on("read", ({ id }: { id: number }) => {
        connection.emit("read", { id, value: client.read(id) });
    });
    connection.on("write", ({ id, value }: { id: number; value: number }) => {
        client.write(id, value);
    });
    connection.on("writePwm", ({ id, value }: { id: number; value: number }) => {
        client.writePwm(id, value);
    });
    connection.on("callback", ({ id }: { id: number }) => {
        client.setCallback(id, (value) => {
            connection.emit("callback", { value });
        });
    });
}

function readConfig(): Promise<Config> {
    return new Promise<Config>((resolve, reject) => {
        readFile("config.json", "utf8", (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(JSON.parse(data));
            }
        });
    });
}

class Client {
    private readonly pins: Record<number, Gpio> = {};

    read(id: number) {
        const pin = this.getPin(id, Gpio.INPUT);
        return pin.digitalRead();
    }

    write(id: number, value: number) {
        const pin = this.getPin(id, Gpio.OUTPUT);
        pin.digitalWrite(value);
    }

    writePwm(id: number, value: number) {
        const pin = this.getPin(id, Gpio.OUTPUT);
        pin.pwmWrite(value);
    }

    setCallback(id: number, callback: (value: number) => void) {
        const pin = this.getPin(id, Gpio.INPUT, true);
        pin.on("alert", callback);
    }

    private getPin(id: number, mode: number, alert?: boolean) {
        if (!this.pins[id]) {
            this.pins[id] = new Gpio(id, { mode, alert });
        }
        return this.pins[id];
    }
}
