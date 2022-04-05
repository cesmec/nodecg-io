import { sortBundles } from "@/utils/bundles";
import { config, ConfigData, isLoaded } from "@/utils/crypto";
import { filterObjectMap } from "@/utils/objectUtils";
import { Bundle, ObjectMap, Service, ServiceInstance } from "@/utils/types";
import { inject, InjectionKey, reactive } from "vue";

export interface State {
    /** All bundles currently stored in nodecg-io. */
    bundles: ObjectMap<Bundle>;
    /** All services of nodecg-io that bundles can depend on. These can be considered constant and should not change at runtime. */
    services: Service[];
    /** All service instances that have been created. */
    instances: ObjectMap<ServiceInstance>;
    /** Is the client currently connected to NodeCG? */
    connected: boolean;
    /** Is nodecg-io already loaded? */
    loaded: boolean;
    /** Did the user successfully login to nodecg-io? */
    loggedIn: boolean;
}

/**
 * Global state for the nodecg-io Dashboard.
 * Note: All methods of the Store class should be declared as properties instead of instance methods, so they are bound to the instance.
 */
class Store {
    state: State;

    constructor(initialState: State) {
        this.state = reactive(initialState) as State;
    }

    get serviceTypes(): string[] {
        return this.state.services.map((service) => service.serviceType);
    }

    filterInstances = (search: string | undefined) => {
        const lowercase = search?.toLowerCase();

        return filterObjectMap<ServiceInstance>(
            this.state.instances,
            (instance, key) =>
                !lowercase || key.toLowerCase().includes(lowercase) || instance.serviceType?.includes(lowercase),
        );
    };

    filterBundles = (search: string | undefined) => {
        const lowercase = search?.toLowerCase();

        return filterObjectMap<Bundle>(
            this.state.bundles,
            (bundle, key) =>
                !lowercase ||
                key.toLowerCase().includes(lowercase) ||
                bundle.dependencies.some((svc) => svc.serviceType.includes(lowercase)),
        );
    };

    isLoaded = async (): Promise<boolean> => {
        const loaded = await isLoaded();
        this.state.loaded = loaded;
        return loaded;
    };

    configUpdate = (configData: ConfigData | undefined) => {
        if (configData) {
            this.state.bundles = sortBundles(configData.bundles);
            this.state.services = configData.services;
            this.state.instances = configData.instances;
        }
    };

    connected = (isConnected: boolean) => {
        this.state.connected = isConnected;
    };

    loaded = (isLoaded: boolean) => {
        this.state.loaded = isLoaded;
    };

    loggedIn = (isLoggedIn: boolean) => {
        this.state.loggedIn = isLoggedIn;
    };
}

const initialState: State = {
    bundles: {},
    services: [],
    instances: {},
    connected: nodecg.socket.connected,
    loaded: false,
    loggedIn: false,
};
const store = Object.freeze(new Store(initialState));

// Load initial values
store.isLoaded();
store.configUpdate(config.data);

// Automatically update store on config changes
config.onChange(store.configUpdate);

// Make connected in the store reflect the socket state
nodecg.socket.on("connect", () => {
    store.connected(true);
});
nodecg.socket.on("disconnect", () => {
    store.connected(false);
});

export const injectionKey: InjectionKey<Readonly<Store>> = Symbol("nodecg-io-store");
export const useStore = () => inject(injectionKey, store);
export { store };
