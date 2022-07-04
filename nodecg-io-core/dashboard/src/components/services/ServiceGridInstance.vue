<script setup lang="ts">
import { ServiceInstance } from "@/utils/types";
import { PropType } from "vue";

defineProps({
    name: {
        type: String,
        required: true,
    },
    instance: {
        type: Object as PropType<ServiceInstance>,
        required: true,
    },
    needsConfig: Boolean,
});

const emit = defineEmits({
    "click:config": () => true,
    "click:delete": () => true,
});
</script>

<template>
    <v-btn
        class="service-instance"
        :aria-label="`Service ${name} of type ${instance.serviceType}`"
        @click="emit('click:config')"
    >
        <div class="service-instance-content">
            <v-card-title class="instance-title">
                <span class="ellipsis">
                    <v-icon v-if="needsConfig" color="warning" title="Needs configuration">mdi-alert</v-icon>
                    {{ name }}
                </span>
            </v-card-title>
            <v-card-subtitle class="instance-type">{{ instance.serviceType }}</v-card-subtitle>
            <v-btn
                class="btn-delete-service"
                color="error"
                icon="mdi-delete"
                size="small"
                title="Delete"
                :aria-label="`Delete service ${name}`"
                @click.stop="emit('click:delete')"
            ></v-btn>
        </div>
    </v-btn>
</template>

<style>
.service-instance {
    padding: 0;
    margin: 10px;
    min-height: 100px;
    min-width: 200px;
    max-width: 400px;
    overflow: hidden;
}

.service-instance > .v-btn__content {
    width: 100%;
}

.service-instance-content {
    display: grid;
    grid-template-columns: 1fr 50px;
    grid-template-rows: auto auto;
    grid-auto-rows: min-content;
    padding: 0;
    margin: 0;
    width: 100%;
    overflow: hidden;
}

.instance-title {
    grid-area: 1 / 1;
    max-width: 250px;
}

.instance-type {
    grid-area: 2 / 1;
}

.btn-delete-service {
    grid-area: 1 / 2 / span 2;
    place-self: center;
}
</style>
