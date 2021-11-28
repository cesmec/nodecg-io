<template>
    <v-dialog v-model="open">
        <v-card>
            <v-card-title>
                <span class="text-h5">Create Service</span>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col cols="12">
                            <v-text-field v-model="name" label="Name" required></v-text-field>
                        </v-col>
                        <!--<v-col cols="12">
                            <v-select v-model="type" :items="['discord', 'twitch']" label="Type" required></v-select>
                        </v-col>-->
                        <v-col cols="12">
                            <!-- todo: use v-select when available -->
                            <select v-model="type" style="background: white">
                                <option
                                    v-for="service in services"
                                    :value="service.serviceType"
                                    :key="service.serviceType"
                                >
                                    {{ service.serviceType }}
                                </option>
                            </select>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="gray darken-1" text @click="close">Close</v-btn>
                <v-btn color="secondary" text @click="saveNewInstance">Create</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
import { injectionKeys } from "@/utils/constants";
import { Service } from "nodecg-io-core/extension/service";
import { defineComponent, inject, PropType } from "vue";

export default defineComponent({
    name: "nodecg-io-service-create-dialog",
    props: {
        services: {
            type: Array as PropType<Service<unknown, unknown>[]>,
            required: true,
        },
    },
    setup() {
        return {
            serviceManager: inject(injectionKeys.serviceManager),
        };
    },
    data() {
        return {
            name: "",
            type: "",
            open: false,
        };
    },
    methods: {
        show() {
            this.open = true;
        },
        close() {
            this.open = false;
            this.name = "";
            this.type = "";
        },
        async saveNewInstance() {
            try {
                await this.serviceManager?.createService(this.type, this.name);
                this.close();
            } catch (error) {
                console.log("creation failed", error);
            }
        },
    },
});
</script>
