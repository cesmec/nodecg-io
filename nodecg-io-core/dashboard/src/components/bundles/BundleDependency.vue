<script setup lang="ts">
import { useStoreState } from "@/store";
import { filterObjectMap } from "@/utils/objectUtils";
import { ServiceDependency } from "@/utils/types";
import { computed, PropType } from "vue";

const props = defineProps({
    dependency: {
        type: Object as PropType<ServiceDependency>,
        required: true,
    },
});

const emit = defineEmits({
    update: (value: string | undefined) => typeof value === "string" || typeof value === "undefined",
});

const { instances } = useStoreState();

const selectableInstances = computed(() => Object.keys(getServiceInstances(props.dependency.serviceType)));
const isDisabled = computed(() => selectableInstances.value.length === 0);

function getServiceInstances(serviceType: string) {
    return filterObjectMap(instances.value, (instance) => instance.serviceType === serviceType);
}

function onUpdate(value: string) {
    if (value) {
        emit("update", value);
    }
}
</script>

<template>
    <v-select
        :model-value="dependency.serviceInstance"
        class="bundle-dependency"
        :label="dependency.serviceType"
        :items="selectableInstances"
        :disabled="isDisabled"
        hide-details="auto"
        clearable
        @update:model-value="(value) => onUpdate(value)"
        @click:clear="emit('update', undefined)"
    ></v-select>
</template>

<style>
.bundle-dependency:not(:first-of-type) {
    margin-top: 8px;
}
</style>
