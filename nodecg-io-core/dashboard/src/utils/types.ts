import {
    Service as NodecgIoService,
    ServiceDependency as NodecgIoServiceDependency,
    ServiceInstance as NodecgIoServiceInstance,
} from "nodecg-io-core/extension/service";

export { ObjectMap } from "nodecg-io-core/extension/service";

// In the dashboard, the config type will always be unknown and the client unavailable.
export type Service = NodecgIoService<unknown, never>;
export type ServiceDependency = NodecgIoServiceDependency<never>;
export type ServiceInstance = NodecgIoServiceInstance<unknown, never>;

/**
 * Represents a Bundle by its dependencies and is considered active when all dependencies are set.
 */
export interface Bundle {
    dependencies: ServiceDependency[];
    active: boolean;
}
