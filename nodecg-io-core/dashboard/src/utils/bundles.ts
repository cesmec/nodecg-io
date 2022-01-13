import { SetServiceDependencyMessage } from "nodecg-io-core/extension/messageManager";
import { sendAuthenticatedMessage } from "./crypto";
import { Bundle, ObjectMap, ServiceDependency } from "./types";

export function updateBundleDependency(bundleName: string, dep: ServiceDependency, instanceName: string | undefined) {
    return sendAuthenticatedMessage<SetServiceDependencyMessage, void>("setServiceDependency", {
        bundleName,
        instanceName,
        serviceType: dep.serviceType,
    });
}

/**
 * Sorts the bundles by their active state. Active bundles appear first.
 * @param bundles Bundles as stored in config
 * @returns Sorted bundles with active property
 */
export function sortBundles(bundles: ObjectMap<ServiceDependency[]>): ObjectMap<Bundle> {
    const sorted: ObjectMap<Bundle> = {};
    const inactiveBundles: ObjectMap<Bundle> = {};
    for (const key in bundles) {
        if (Object.prototype.hasOwnProperty.call(bundles, key)) {
            const dependencies = bundles[key];
            const bundle: Bundle = {
                dependencies,
                active: isBundleActive(dependencies),
            };
            if (bundle.active) {
                sorted[key] = bundle;
            } else {
                inactiveBundles[key] = bundle;
            }
        }
    }

    return Object.assign(sorted, inactiveBundles);
}

function isBundleActive(bundle: ServiceDependency[]) {
    return bundle.every((svc) => svc.serviceInstance);
}
