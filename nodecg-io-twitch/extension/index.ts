import { NodeCG } from "nodecg/types/server";
import { NodeCGIOCore } from "nodecg-io-core/extension";
import { Service, ServiceProvider } from "nodecg-io-core/extension/types";
import { emptySuccess, success } from "nodecg-io-core/extension/utils/result";
import * as fs from "fs";
import * as path from "path";

interface TwitchConfig {
	oauthKey: string
}

export interface TwitchClient {
	testString?: string
}

module.exports = (nodecg: NodeCG): ServiceProvider<TwitchClient> | undefined => {
	nodecg.log.info("Twitch bundle started");
	const core: NodeCGIOCore = nodecg.extensions['nodecg-io-core'] as any;
	if (core === undefined) {
		nodecg.log.error("nodecg-io-core isn't loaded! Twitch bundle won't function without it.");
		return undefined;
	}

	const service: Service<TwitchConfig, TwitchClient> = {
		schema: fs.readFileSync(path.resolve(__dirname, "../twitch-schema.json"), "utf8"),
		serviceType: "twitch",
		validateConfig: async (config: TwitchConfig) => {
			nodecg.log.info("Validating twitch config:");
			nodecg.log.info(JSON.stringify(config));
			return emptySuccess();
		},
		createClient: async (config: TwitchConfig) => {
			nodecg.log.info("Creating twitch client of this config:");
			nodecg.log.info(JSON.stringify(config));
			return success({
				testString: config ? config.oauthKey : undefined
			});
		}
	};

	core.serviceManager.registerService(service);
	return core.bundleManager.createServiceProvider(service);
};
