import { NodeCG } from "nodecg/types/server";
import { NodeCGIOCore } from "nodecg-io-core/extension";
import { Service, ServiceProvider } from "nodecg-io-core/extension/types";
import { emptySuccess, success, error, Result } from "nodecg-io-core/extension/utils/result";
import { Namespace as SocketIONamespace } from "socket.io";
import { EventEmitter } from "events";

interface RaspberryPiServiceConfig {
    namespace?: string;
}

type GpioMode = "in" | "out" | "pwm";
type BinaryValue = 0 | 1;

interface GpioPinInfo {
    mode: GpioMode;
    value: number;
}

type GpioPins = Record<
    number,
    GpioPinInfo & {
        callback?: (value: number) => void;
    }
>;

export class RaspberryPiClient {
    private readonly pins: GpioPins = {};
    private readonly events = new EventEmitter();

    constructor(private readonly socket: SocketIONamespace) {
        socket.on("read", this.handleReadResponse);
        socket.on("callback", this.handleCallbackResponse);
        socket.on("connection", this.handleConnection);
    }

    waitForConnection(): Promise<void> {
        return new Promise<void>((resolve) => {
            const connectedCount = Object.keys(this.socket.connected).length;
            if (connectedCount > 0) {
                resolve();
            } else {
                this.socket.once("connection", resolve);
            }
        });
    }

    write(id: number, value: BinaryValue): void {
        const pin = this.getOrCreatePin(id, "out");
        pin.value = value;
        this.socket.emit("write", { id, value });
    }

    writePwm(id: number, value: number): void {
        const pin = this.getOrCreatePin(id, "pwm");
        pin.value = value;
        this.socket.emit("writePwm", { id, value });
    }

    read(id: number): Promise<BinaryValue> {
        const waitPromise = this.getValue(id);
        this.socket.emit("read", { id });
        return waitPromise;
    }

    setCallback(id: number, callback: (value: number) => void): void {
        const pin = this.getOrCreatePin(id, "in");
        pin.callback = callback;
        const eventName = `callback_${id}`;
        this.events.removeAllListeners(eventName);
        this.events.addListener(eventName, callback);
        this.socket.emit("callback", { id });
    }

    stop(): void {
        this.socket.off("read", this.handleReadResponse);
        this.socket.off("callback", this.handleCallbackResponse);
        this.socket.off("connection", this.handleConnection);
    }

    private getValue(id: number): Promise<BinaryValue> {
        return new Promise<BinaryValue>((resolve) => {
            this.events.once(`read_${id}`, resolve);
        });
    }

    private handleReadResponse = ({ id, value }: { id: number; value: number }) => {
        if (typeof id === "number" && typeof value === "number") {
            const pin = this.getOrCreatePin(id, "in");
            pin.value = value;
            this.events.emit(`read_${id}`, value);
        }
    };

    private handleCallbackResponse = ({ id, value }: { id: number; value: number }) => {
        if (typeof id === "number") {
            this.events.emit(`callback_${id}`, value);
        }
    };

    private handleConnection = () => {
        for (const id in this.pins) {
            if (Object.prototype.hasOwnProperty.call(this.pins, id)) {
                const pinId = parseInt(id);
                const pin = this.pins[pinId];
                switch (pin.mode) {
                    case "out":
                        this.write(pinId, pin.value as BinaryValue);
                        break;
                    case "pwm":
                        this.writePwm(pinId, pin.value);
                        break;
                    case "in":
                        if (pin.callback) {
                            this.setCallback(pinId, pin.callback);
                        }
                        break;
                }
            }
        }
    };

    private getOrCreatePin(id: number, mode: GpioMode) {
        if (!this.pins[id]) {
            this.pins[id] = { mode, value: 0 };
        }
        return this.pins[id];
    }
}

export interface RaspberryPiServiceClient {
    getRawClient(): RaspberryPiClient;
}

module.exports = (nodecg: NodeCG): ServiceProvider<RaspberryPiServiceClient> | undefined => {
    nodecg.log.info("Raspberry PI bundle started");
    const core = (nodecg.extensions["nodecg-io-core"] as unknown) as NodeCGIOCore | undefined;
    if (core === undefined) {
        nodecg.log.error("nodecg-io-core isn't loaded! Raspberry PI bundle won't function without it.");
        return undefined;
    }

    const service: Service<RaspberryPiServiceConfig, RaspberryPiServiceClient> = {
        schema: core.readSchema(__dirname, "../raspberrypi-schema.json"),
        serviceType: "raspberrypi",
        validateConfig: validateConfig,
        createClient: createClient(nodecg),
        stopClient: stopClient,
    };

    return core.registerService(service);
};

async function validateConfig(config: RaspberryPiServiceConfig): Promise<Result<void>> {
    if (typeof config.namespace === "string" && config.namespace[0] !== "/") {
        return error(`Namespace needs to begin with a "/"`);
    }
    return emptySuccess();
}

function createClient(nodecg: NodeCG): (config: RaspberryPiServiceConfig) => Promise<Result<RaspberryPiServiceClient>> {
    return async (config) => {
        try {
            const socket = nodecg.getSocketIOServer();
            const raspberrypiNamespace = socket.of(config.namespace || "/raspberrypi");

            raspberrypiNamespace.on("connection", (client) => {
                nodecg.log.info(`Raspberry PI client connected with Id: ${client.id}`);
            });

            const client = new RaspberryPiClient(raspberrypiNamespace);

            return success({
                getRawClient() {
                    return client;
                },
            });
        } catch (err) {
            return error(err.toString());
        }
    };
}

function stopClient(client: RaspberryPiServiceClient): void {
    const rawClient = client.getRawClient();
    rawClient.stop();
}
