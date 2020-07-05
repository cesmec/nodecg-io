import { NodeCG } from "nodecg/types/server";
import { NodeCGIOCore } from "nodecg-io-core/extension";
import { Service, ServiceProvider } from "nodecg-io-core/extension/types";
import { emptySuccess, success, error, Result } from "nodecg-io-core/extension/utils/result";
import { Namespace as SocketIONamespace, Socket, Server } from "socket.io";
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

    constructor(private readonly server: Server, private readonly namespace: SocketIONamespace) {
        namespace.on("connection", this.handleConnection);
    }

    waitForConnection(): Promise<void> {
        return new Promise<void>((resolve) => {
            const connectedCount = Object.keys(this.namespace.connected).length;
            if (connectedCount > 0) {
                resolve();
            } else {
                this.namespace.once("connection", resolve);
            }
        });
    }

    write(id: number, value: BinaryValue): void {
        const pin = this.getOrCreatePin(id, "out");
        pin.value = value;
        this.namespace.emit("write", { id, value });
    }

    writePwm(id: number, value: number): void {
        const pin = this.getOrCreatePin(id, "pwm");
        pin.value = value;
        this.namespace.emit("writePwm", { id, value });
    }

    read(id: number): Promise<BinaryValue> {
        this.getOrCreatePin(id, "in");
        const waitPromise = this.getValue(id);
        this.namespace.emit("read", { id });
        return waitPromise;
    }

    setInterruptCallback(id: number, callback: (value: number) => void): void {
        const pin = this.getOrCreatePin(id, "in");
        pin.callback = callback;
        const eventName = `interrupt_${id}`;
        this.events.removeAllListeners(eventName);
        this.events.addListener(eventName, callback);
        this.namespace.emit("interrupt", { id });
    }

    stop(): void {
        for (const key in this.namespace.connected) {
            if (Object.prototype.hasOwnProperty.call(this.namespace.connected, key)) {
                const client = this.namespace.connected[key];
                client.disconnect();
                this.cleanupClient(client);
            }
        }
        this.namespace.off("connection", this.handleConnection);
        delete this.server.nsps[this.namespace.name];
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

    private handleInterrupt = ({ id, value }: { id: number; value: number }) => {
        if (typeof id === "number" && typeof value === "number") {
            this.events.emit(`interrupt_${id}`, value);
        }
    };

    private handleConnection = (client: Socket) => {
        client.on("read", this.handleReadResponse);
        client.on("interrupt", this.handleInterrupt);
        client.once("disconnect", () => this.cleanupClient(client));

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
                            this.setInterruptCallback(pinId, pin.callback);
                        } else {
                            this.read(pinId);
                        }
                        break;
                }
            }
        }
    };

    private cleanupClient(client: Socket) {
        client.off("read", this.handleReadResponse);
        client.off("interrupt", this.handleInterrupt);
    }

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
    if (typeof config.namespace === "string" && config.namespace.length > 0 && config.namespace[0] !== "/") {
        return error(`The namespace must begin with a "/"`);
    }
    return emptySuccess();
}

function createClient(nodecg: NodeCG): (config: RaspberryPiServiceConfig) => Promise<Result<RaspberryPiServiceClient>> {
    return async (config) => {
        try {
            const socketServer = nodecg.getSocketIOServer();
            const namespace = socketServer.of(config.namespace || "/raspberrypi");

            namespace.on("connection", (client) => {
                nodecg.log.info(`Raspberry PI client connected with Id: ${client.id}`);
            });

            const client = new RaspberryPiClient(socketServer, namespace);

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
