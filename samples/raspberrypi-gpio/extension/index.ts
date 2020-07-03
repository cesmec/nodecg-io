import { NodeCG } from "nodecg/types/server";
import { ServiceProvider } from "nodecg-io-core/extension/types";
import { RaspberryPiServiceClient } from "nodecg-io-raspberrypi-server/extension";

function delay(milliseconds: number) {
    return new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
}

module.exports = function (nodecg: NodeCG) {
    nodecg.log.info("Sample bundle for Raspberry PI started");

    // This explicit cast determines the client type in the requireService call
    const raspberrypi = (nodecg.extensions["nodecg-io-raspberrypi-server"] as unknown) as
        | ServiceProvider<RaspberryPiServiceClient>
        | undefined;

    raspberrypi?.requireService(
        "raspberrypi-sample",
        async (raspberrypi) => {
            nodecg.log.info("Raspberry PI client has been updated.");

            const client = raspberrypi.getRawClient();

            await client.waitForConnection();

            const ledPinId = 17;
            const buttonPinId = 27;

            nodecg.log.info(`Blinking LED on pin ${ledPinId}`);

            client.setCallback(buttonPinId, (value) => {
                nodecg.log.info(`Button value: ${value}`);
            });

            for (let i = 0; i < 10; i++) {
                client.write(ledPinId, 1);
                await delay(500);
                client.write(ledPinId, 0);
                await delay(500);
            }

            nodecg.log.info("Stopped blinking LED");
        },
        () => nodecg.log.info("Raspberry PI client has been unset."),
    );
};
