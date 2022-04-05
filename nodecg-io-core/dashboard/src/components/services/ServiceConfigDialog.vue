<template>
    <ConfirmDialog
        ref="dialog"
        fullscreen
        canConfirmWithCtrlS
        confirmText="Save"
        :confirmDisabled="!hasConfig"
        class="config-dialog"
        @close="onClose"
    >
        <template v-slot:subtitle>
            <span>{{ serviceType }}</span>
        </template>
        <div ref="editorContainer" class="editor-container">
            <div v-if="!hasConfig" class="editor-centered">
                <p>This service cannot be configured.</p>
            </div>
            <div v-else-if="!editorLoaded" class="editor-centered">
                <v-progress-circular indeterminate :size="50" color="secondary"></v-progress-circular>
            </div>
        </div>
    </ConfirmDialog>
</template>

<script lang="ts">
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import { objectDeepCopy } from "@/utils/objectUtils";
import { updateServiceInstanceConfig } from "@/utils/services";
import { ObjectMap, Service, ServiceInstance } from "@/utils/types";
import type * as monaco from "monaco-editor/esm/vs/editor/editor.api"; // Types only, chunk is loaded later
import { defineComponent, nextTick, ref, shallowRef } from "vue";

export default defineComponent({
    name: "ServiceConfigDialog",
    components: {
        ConfirmDialog,
    },
    setup() {
        return {
            // Shallow ref, because the editor should not be reactive and wrapped in a Vue.js Proxy.
            editor: shallowRef<monaco.editor.IStandaloneCodeEditor>(),
            schema: shallowRef<ObjectMap<unknown>>(),
            observer: shallowRef<ResizeObserver>(),
            editorContainer: ref<HTMLElement>(),
            editorElement: ref<HTMLElement>(),
            dialog: ref<InstanceType<typeof ConfirmDialog>>(),
            updateSymbol: ref<symbol>(),
        };
    },
    data() {
        return {
            serviceType: "",
            editorLoaded: false,
        };
    },
    computed: {
        hasConfig(): boolean {
            return Boolean(this.schema);
        },
    },
    methods: {
        show(instanceName: string, instance: ServiceInstance, service: Service) {
            this.serviceType = instance.serviceType;
            this.schema = service.schema;

            const save = async () => {
                try {
                    const configJson = this.editor?.getValue() ?? "";
                    const config = JSON.parse(configJson);
                    await updateServiceInstanceConfig(instanceName, config);
                    return true;
                } catch (error) {
                    return error instanceof Error ? error.message : String(error);
                }
            };

            this.dialog?.show(save, "Configure " + instanceName);

            // Wait one update cycle before accessing dom refs.
            nextTick(() => {
                this.observeForAvailableHeight();
                if (this.editorContainer && this.hasConfig) {
                    // Manage monaco editor element manually instead of letting vue handle it.
                    this.editorElement ??= document.createElement("div");
                    this.editorContainer.appendChild(this.editorElement);

                    const configJson = instance.config ? JSON.stringify(instance.config, null, 4) : "";
                    this.updateEditor(this.editorElement, configJson);
                }
            });
        },
        /**
         * Initializes the editor if needed and creates a new textmodel for the configuration of the service instance.
         * @param element Root element of the editor
         * @param configJson Configuration in JSON format, can be empty when config is not yet set on the current instance.
         */
        async updateEditor(element: HTMLElement, configJson: string) {
            this.editor?.getModel()?.dispose();

            const updateSymbol = Symbol("editor-update");
            this.updateSymbol = updateSymbol;

            const { Uri, languages, editor } = await import(
                /* webpackChunkName: "monaco-editor", webpackPrefetch: true */
                "monaco-editor/esm/vs/editor/editor.api"
            );
            this.editorLoaded = true;

            // Cancel editor update if the user closed the dialog while monaco was loading.
            if (this.updateSymbol !== updateSymbol) {
                return;
            }

            // These uris can be completely made up as long the uri in the schema matches the one of the config json model.
            const schemaUri = Uri.parse("mem://nodecg-io/selectedServiceSchema.json");
            const modelUri = Uri.parse("mem://nodecg-io/selectedServiceConfig.json");

            const options = this.getServiceDiagnosticsOptions(schemaUri.toString(), modelUri.toString());
            languages.json.jsonDefaults.setDiagnosticsOptions(options);

            const model = editor.createModel(configJson, "json", options.validate ? modelUri : undefined);
            if (!this.editor) {
                this.editor = editor.create(element, {
                    theme: "vs-dark",
                    model,
                });
            } else {
                this.editor.setModel(model);
            }
            this.editor.layout();
        },
        /**
         * Create json diagnostics options from the model url and json schema.
         * @param schemaUri Uri for the json schema
         * @param modelUri Uri for the config json model
         */
        getServiceDiagnosticsOptions(schemaUri: string, modelUri: string): monaco.languages.json.DiagnosticsOptions {
            if (this.schema) {
                return {
                    validate: true,
                    schemas: [
                        {
                            uri: schemaUri,
                            fileMatch: [modelUri],
                            schema: objectDeepCopy(this.schema),
                        },
                    ],
                };
            }
            // nothing to validate if there is no schema
            return {
                validate: false,
                schemas: [],
            };
        },
        /**
         * Start automatic resize of the editor to match available height.
         * Available height is the size of the dialog minus sibling elements of the editor like header and actions.
         */
        observeForAvailableHeight() {
            const cardTextElement = this.editorContainer?.parentElement;
            const cardElement = cardTextElement?.parentElement;
            if (!cardElement) return;

            const siblings = Array.from(cardElement.children).filter((e) => e !== cardTextElement);

            const resizeToAvailableHeight = () => {
                const maxHeight = window.innerHeight;
                const siblingHeightSum = siblings.reduce((h, elem) => h + elem.clientHeight, 0);
                const availableHeight = maxHeight - siblingHeightSum;

                cardTextElement.style.height = `${availableHeight}px`;

                if (this.editorElement && this.editorElement.parentElement === this.editorContainer) {
                    this.editor?.layout();
                }
            };

            resizeToAvailableHeight();
            this.observer = new ResizeObserver(resizeToAvailableHeight);
            this.observer.observe(cardElement);
            for (const sibling of siblings) {
                this.observer.observe(sibling);
            }
        },
        onClose() {
            this.observer?.disconnect();
            this.observer = undefined;
            this.updateSymbol = undefined;
        },
    },
});
</script>

<style>
.editor-container,
.editor-container > * {
    width: 100%;
    height: 100%;
}

.editor-container > .editor-centered {
    display: grid;
    place-items: center;
}

.config-dialog .v-card-text {
    opacity: 1;
}
</style>
