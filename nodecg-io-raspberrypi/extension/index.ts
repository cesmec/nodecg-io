import { NodeCG } from "nodecg/types/server";
import { NodeCGIOCore } from "nodecg-io-core/extension";
import { Service, ServiceProvider } from "nodecg-io-core/extension/types";
import { emptySuccess, success, error, Result } from "nodecg-io-core/extension/utils/result";
import { Direction, Edge, Gpio } from "onoff"; //todo test onoff vs pigpio (PWM etc.)

interface PinConfig {
    id: number;
    mode: Direction;
    edge?: Edge;
}

interface RaspberryPiServiceConfig {
    pins: PinConfig[];
}

/**
 * Pinout documentation can be found at @see https://pinout.xyz
 */
export interface GpioPins {
    [gpioPinId: number]: Gpio;
}

export interface RaspberryPiServiceClient {
    getRawClient(): GpioPins;
}

const MIN_PIN_ID = 0;
const MAX_PIN_ID = 27;

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
    if (config.pins.length > 0) {
        return emptySuccess();
    }
    return error("No GPIO pins defined in Raspberry PI config");
}

function createClient(nodecg: NodeCG): (config: RaspberryPiServiceConfig) => Promise<Result<RaspberryPiServiceClient>> {
    return async (config) => {
        try {
            nodecg.log.info(`Initializing ${config.pins.length} GPIO Pins`);
            const gpioPins: GpioPins = {};

            for (const pin of config.pins) {
                if (!Number.isInteger(pin.id) || pin.id < MIN_PIN_ID || pin.id > MAX_PIN_ID) {
                    throw new Error(`Invalid GPIO pin id "${pin.id}"`);
                }
                gpioPins[pin.id] = new Gpio(pin.id, pin.mode, pin.edge);
            }

            return success({
                getRawClient() {
                    return gpioPins;
                },
            });
        } catch (err) {
            return error(err.toString());
        }
    };
}

function stopClient(client: RaspberryPiServiceClient): void {
    const gpioPins = client.getRawClient();
    for (const pinId in gpioPins) {
        if (Object.hasOwnProperty.call(gpioPins, pinId)) {
            const gpioPin = gpioPins[(pinId as unknown) as number];
            gpioPin.unexport();
        }
    }
}
