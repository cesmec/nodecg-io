<template>
    <v-select
        :model-value="dep.serviceInstance"
        class="bundle-dependency"
        :label="dep.serviceType"
        :items="selectableInstances"
        :disabled="isDisabled"
        hide-details="auto"
        clearable
        @update:model-value="(value) => onUpdate(value)"
        @click:clear="onUpdate(undefined)"
    ></v-select>
</template>

<script lang="ts">
import { useStore } from "@/store";
import { filterObjectMap } from "@/utils/objectUtils";
import { ObjectMap, ServiceDependency, ServiceInstance } from "@/utils/types";
import { defineComponent, PropType } from "vue";

export default defineComponent({
    name: "BundleDependency",
    props: {
        dep: {
            type: Object as PropType<ServiceDependency>,
            required: true,
        },
    },
    emits: {
        update: (value: string | undefined) => typeof value === "string" || typeof value === "undefined",
    },
    setup() {
        const store = useStore();

        return {
            store,
        };
    },
    computed: {
        instances(): ObjectMap<ServiceInstance> {
            return this.store.state.instances;
        },
        selectableInstances(): string[] {
            return this.getSelectableInstances(this.$props.dep.serviceType);
        },
        isDisabled(): boolean {
            return this.selectableInstances.length === 0;
        },
    },
    methods: {
        getServiceInstances(serviceType: string) {
            return filterObjectMap(this.instances, (instance) => instance.serviceType === serviceType);
        },
        getSelectableInstances(serviceType: string): string[] {
            return Object.keys(this.getServiceInstances(serviceType));
        },
        onUpdate(value: string | undefined) {
            if (typeof value === "string" || typeof value === "undefined") {
                this.$emit("update", value);
            }
        },
    },
});
</script>

<style>
.bundle-dependency:not(:first-of-type) {
    margin-top: 8px;
}
</style>
