import {
    CreateServiceInstanceMessage,
    DeleteServiceInstanceMessage,
    UpdateInstanceConfigMessage,
} from "nodecg-io-core/extension/messageManager";
import { sendAuthenticatedMessage } from "./crypto";

export function createServiceInstance(serviceType: string, instanceName: string) {
    return sendAuthenticatedMessage<CreateServiceInstanceMessage, void>("createServiceInstance", {
        instanceName,
        serviceType,
    });
}

export function updateServiceInstanceConfig(instanceName: string, config: unknown) {
    return sendAuthenticatedMessage<UpdateInstanceConfigMessage, void>("updateInstanceConfig", {
        instanceName,
        config,
    });
}

export function deleteServiceInstance(instanceName: string) {
    return sendAuthenticatedMessage<DeleteServiceInstanceMessage, boolean>("deleteServiceInstance", {
        instanceName,
    });
}
