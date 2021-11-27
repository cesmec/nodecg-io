import { InjectionKey } from "vue";
import { ServiceManager } from "./serviceManager";

export const injectionKeys = {
    serviceManager: Symbol("serviceManager") as InjectionKey<ServiceManager>,
};
