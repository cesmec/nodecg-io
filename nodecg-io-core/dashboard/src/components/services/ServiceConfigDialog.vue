<template>
    <v-dialog v-model="open" fullscreen>
        <v-card>
            <v-card-title>
                <span class="text-h5">Configure Service</span>
            </v-card-title>
            <v-card-subtitle>
                {{ instanceName }}
            </v-card-subtitle>
            <v-card-text>
                <div ref="editorParent" class="editor-container"></div>
            </v-card-text>
            <v-card-actions>
                <span class="error">{{ error }}</span>
                <v-spacer></v-spacer>
                <v-btn color="gray darken-1" text @click="close">Close</v-btn>
                <v-btn class="btn-save" color="secondary" text @click="save" :disabled="saving">
                    <v-progress-circular class="save-progress" v-if="saving" indeterminate color="secondary" />
                    <span v-else>Save</span>
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
import { injectionKeys } from "@/utils/constants";
import { objectDeepCopy } from "@/utils/objectUtils";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { ObjectMap, Service, ServiceInstance } from "nodecg-io-core/extension/service";
import { defineComponent, inject, ref } from "vue";

// monaco works better when it's not in a vue Proxy object
// however, doing it this way limits it to only one instance
let editor: monaco.editor.IStandaloneCodeEditor | undefined = undefined;

export default defineComponent({
    name: "ServiceConfigDialog",
    setup() {
        const editorParent = ref<HTMLElement>();
        const editorElement = ref<HTMLElement>();
        return {
            editorParent,
            editorElement,
            serviceManager: inject(injectionKeys.serviceManager),
        };
    },
    data() {
        return {
            open: false,
            instanceName: "",
            config: "",
            error: "",
            schema: undefined as ObjectMap<unknown> | undefined,
            saving: false,
        };
    },
    watch: {
        async open(newValue: boolean) {
            this.error = "";

            // wait one update cycle before accessing dom refs
            await Promise.resolve();

            if (newValue && this.editorParent) {
                // manage monaco editor element manually instead of letting vue handle it
                this.editorElement ??= document.createElement("div");
                this.editorParent.appendChild(this.editorElement);
                this.updateEditor(this.editorElement);
            }
        },
    },
    mounted() {
        window.addEventListener("resize", this.resize, { passive: true });
        window.addEventListener("keydown", this.keydown);
    },
    unmounted() {
        window.removeEventListener("resize", this.resize);
        window.removeEventListener("keydown", this.keydown);
    },
    methods: {
        show(instanceName: string, instance: ServiceInstance<unknown, unknown>, service: Service<unknown, unknown>) {
            this.instanceName = instanceName;
            this.config = JSON.stringify(instance.config, null, 4);
            this.schema = service.schema;
            this.open = true;
        },
        close() {
            this.open = false;
            this.saving = false;
        },
        keydown(e: KeyboardEvent) {
            if (this.open && e.ctrlKey && e.key === "s") {
                e.preventDefault();
                this.save();
            }
        },
        async save() {
            if (this.saving) {
                return;
            }
            this.config = editor?.getValue() ?? "";
            this.error = "";
            this.saving = true;
            try {
                const config = JSON.parse(this.config);
                await this.serviceManager?.updateInstanceConfig(this.instanceName, config);
                this.close();
            } catch (error) {
                console.log("config save failed", error);
                this.error = error instanceof Error ? error.message : String(error);
            }
            this.saving = false;
        },
        updateEditor(element: HTMLElement) {
            editor?.getModel()?.dispose();

            // This model uri can be completely made up as long the uri in the schema matches with the one in the language model.
            const modelUri = monaco.Uri.parse(`mem://nodecg-io/selectedServiceSchema.json`);

            const options = this.getServiceDiagnosticsOptions(modelUri.toString());
            monaco.languages.json.jsonDefaults.setDiagnosticsOptions(options);

            const model = monaco.editor.createModel(this.config, "json", options.validate ? modelUri : undefined);
            if (!editor) {
                editor = monaco.editor.create(element, {
                    model,
                    theme: "vs-dark",
                });
            } else {
                editor.setModel(model);
            }
            editor.layout();
        },
        getServiceDiagnosticsOptions(modelUri: string): monaco.languages.json.DiagnosticsOptions {
            if (this.schema) {
                return {
                    validate: true,
                    schemas: [
                        {
                            uri: modelUri,
                            fileMatch: [modelUri],
                            schema: objectDeepCopy(this.schema),
                        },
                    ],
                };
            }
            return {
                validate: false, // if not set we disable validation again.
                schemas: [],
            };
        },
        resize() {
            if (this.editorElement && this.editorParent && this.editorElement.parentElement === this.editorParent) {
                editor?.layout();
            }
        },
    },
});
</script>

<style>
.editor-container {
    width: 100%;
    height: calc(100vh - 150px);
}

.editor-container > * {
    width: 100%;
    height: 100%;
}

.btn-save {
    position: relative;
}

.save-progress {
    position: absolute;
}

.error {
    color: red;
}
</style>
