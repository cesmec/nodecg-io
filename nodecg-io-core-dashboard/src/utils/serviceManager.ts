import {
    CreateServiceInstanceMessage,
    DeleteServiceInstanceMessage,
    UpdateInstanceConfigMessage,
} from "nodecg-io-core/extension/messageManager";
import { sendAuthenticatedMessage } from "./crypto";

export class ServiceManager {
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
