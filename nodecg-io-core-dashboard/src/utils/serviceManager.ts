import {
    CreateServiceInstanceMessage,
    DeleteServiceInstanceMessage,
    UpdateInstanceConfigMessage,
} from "nodecg-io-core/extension/messageManager";
import { Service } from "nodecg-io-core/extension/service";
import { sendAuthenticatedMessage } from "./crypto";

export class ServiceManager {
    getServices(): Promise<Service<unknown, unknown>[]> {
        return nodecg.sendMessage("getServices");
    }

    createService(serviceType: string, instanceName: string) {
        return sendAuthenticatedMessage<CreateServiceInstanceMessage, void>("createServiceInstance", {
            instanceName,
            serviceType,
        });
    }

    updateInstanceConfig(instanceName: string, config: unknown) {
        return sendAuthenticatedMessage<UpdateInstanceConfigMessage, void>("updateInstanceConfig", {
            instanceName,
            config,
        });
    }

    deleteInstance(instanceName: string) {
        return sendAuthenticatedMessage<DeleteServiceInstanceMessage, boolean>("deleteServiceInstance", {
            instanceName,
        });
    }
}
