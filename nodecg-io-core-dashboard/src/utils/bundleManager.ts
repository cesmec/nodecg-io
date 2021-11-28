import { SetServiceDependencyMessage } from "nodecg-io-core/extension/messageManager";
import { ObjectMap, ServiceDependency } from "nodecg-io-core/extension/service";
import { sendAuthenticatedMessage } from "./crypto";

export interface Bundle {
    dependencies: ServiceDependency<unknown>[];
    active: boolean;
}

export class BundleManager {
    updateBundleDependency(bundleName: string, dep: ServiceDependency<unknown>) {
        return sendAuthenticatedMessage<SetServiceDependencyMessage, void>("setServiceDependency", {
            bundleName,
            instanceName: dep.serviceInstance,
            serviceType: dep.serviceType,
        });
    }

    /**
     * Sorts the bundles by active state. Active bundles appear first.
     * @param bundles Bundles as stored in config
     * @returns Sorted bundles with active property
     */
    static sortBundles(bundles: ObjectMap<ServiceDependency<unknown>[]>): ObjectMap<Bundle> {
        const sorted: ObjectMap<Bundle> = {};
        const inactiveBundles: ObjectMap<Bundle> = {};
        for (const key in bundles) {
            if (Object.prototype.hasOwnProperty.call(bundles, key)) {
                const dependencies = bundles[key];
                const bundle: Bundle = {
                    dependencies,
                    active: this.isBundleActive(dependencies),
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

    private static isBundleActive(bundle: ServiceDependency<unknown>[]) {
        return bundle.every((svc) => svc.serviceInstance);
    }
}
