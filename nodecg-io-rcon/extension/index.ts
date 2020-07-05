import { NodeCG } from "nodecg/types/server";
import { ServiceProvider } from "nodecg-io-core/extension/types";
import { emptySuccess, success, Result } from "nodecg-io-core/extension/utils/result";
import { ServiceBundle } from "nodecg-io-core/extension/serviceBundle";
import { Rcon } from "rcon-client";

interface RconServiceConfig {
    host: string;
    port: number;
    password: string;
}

export interface RconServiceClient {
    getRawClient(): Rcon;
    sendMessage(message: string): Promise<string>;
}

module.exports = (nodecg: NodeCG): ServiceProvider<RconServiceClient> | undefined => {
    const rconService = new RconService(nodecg, "rcon", __dirname, "../rcon-schema.json");
    return rconService.register();
};

class RconService extends ServiceBundle<RconServiceConfig, RconServiceClient> {
    async validateConfig(config: RconServiceConfig): Promise<Result<void>> {
        const rcon = new Rcon({
            host: config.host,
            port: config.port,
            password: config.password,
        });

        // We need one error handler or node will exit the process on an error.
        rcon.on("error", (_err) => {});

        await rcon.connect(); // This will throw an exception if there is an error.
        rcon.end();
        return emptySuccess();
    }

    async createClient(config: RconServiceConfig): Promise<Result<RconServiceClient>> {
        const rcon = new Rcon({
            host: config.host,
            port: config.port,
            password: config.password,
        });

        // We need one error handler or node will exit the process on an error.
        rcon.on("error", (_err) => {});

        await rcon.connect(); // This will throw an exception if there is an error.
        this.nodecg.log.info("Successfully connected to the rcon server.");

        return success({
            getRawClient() {
                return rcon;
            },
            sendMessage(message: string) {
                return sendMessage(rcon, message);
            },
        });
    }

    stopClient(client: RconServiceClient): void {
        client
            .getRawClient()
            .end()
            .then(() => {
                console.log("Stopped rcon client successfully.");
            });
    }
}

function sendMessage(client: Rcon, message: string): Promise<string> {
    return client.send(message);
}
