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
                <v-btn color="gray darken-1" text @click="open = false">Close</v-btn>
                <v-btn
                    color="primary"
                    text
                    @click="
                        $emit('save', name, type);
                        open = false;
                    "
                    >Save</v-btn
                >
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
import { Service } from "nodecg-io-core/extension/service";
import { defineComponent, PropType } from "vue";

export default defineComponent({
    name: "create-service",
    props: {
        services: {
            type: Array as PropType<Service<unknown, unknown>[]>,
            required: true,
        },
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
    },
});
</script>
