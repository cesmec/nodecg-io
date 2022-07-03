<script setup lang="ts">
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import { objectDeepCopy } from "@/utils/objectUtils";
import { updateServiceInstanceConfig } from "@/utils/services";
import { ObjectMap, Service, ServiceInstance } from "@/utils/types";
import type * as monaco from "monaco-editor/esm/vs/editor/editor.api"; // Types only, chunk is loaded later
import { computed, nextTick, ref, shallowRef } from "vue";

defineExpose({
    show,
});

// Shallow ref, because the editor should not be reactive and wrapped in a Vue.js Proxy.
const editor = shallowRef<monaco.editor.IStandaloneCodeEditor>();
const schema = shallowRef<ObjectMap<unknown>>();
const observer = shallowRef<ResizeObserver>();
const editorContainer = ref<HTMLElement>();
const editorElement = ref<HTMLElement>();
const dialog = ref<InstanceType<typeof ConfirmDialog>>();
const updateSymbol = ref<symbol>();

const serviceType = ref("");
const editorLoaded = ref(false);

const hasConfig = computed(() => Boolean(schema.value));

/**
 * Open the dialog to edit the service instance configuration.
 * @param instanceName Name of this service instance
 * @param instance Service instance to configure
 * @param service Service that this instance is based on
 */
function show(instanceName: string, instance: ServiceInstance, service: Service) {
    serviceType.value = instance.serviceType;
    schema.value = service.schema;

    const save = async () => {
        try {
            const configJson = editor.value?.getValue() ?? "";
            const config = JSON.parse(configJson);
            await updateServiceInstanceConfig(instanceName, config);
            return true;
        } catch (error) {
            return error instanceof Error ? error.message : String(error);
        }
    };

    dialog.value?.show(save, "Configure " + instanceName);

    // Wait one update cycle before accessing dom refs.
    nextTick(() => {
        observeForAvailableHeight();
        if (editorContainer.value && hasConfig.value) {
            // Manage monaco editor element manually instead of letting vue handle it.
            editorElement.value ??= document.createElement("div");
            editorContainer.value.appendChild(editorElement.value);

            const configJson = instance.config ? JSON.stringify(instance.config, null, 4) : "";
            updateEditor(editorElement.value, configJson);
        }
    });
}

/**
 * Initializes the editor if needed and creates a new textmodel for the configuration of the service instance.
 * @param element Root element of the editor
 * @param configJson Configuration in JSON format, can be empty when config is not yet set on the current instance.
 */
async function updateEditor(element: HTMLElement, configJson: string) {
    editor.value?.getModel()?.dispose();

    const currentSymbol = Symbol("editor-update");
    updateSymbol.value = currentSymbol;

    const {
        Uri,
        languages,
        editor: monacoEditor,
    } = await import(
        /* webpackChunkName: "monaco-editor", webpackPrefetch: true */
        "monaco-editor/esm/vs/editor/editor.api"
    );
    editorLoaded.value = true;

    // Cancel editor update if the user closed the dialog while monaco was loading.
    if (updateSymbol.value !== currentSymbol) {
        return;
    }

    // These uris can be completely made up as long the uri in the schema matches the one of the config json model.
    const schemaUri = Uri.parse("mem://nodecg-io/selectedServiceSchema.json");
    const modelUri = Uri.parse("mem://nodecg-io/selectedServiceConfig.json");

    const options = getServiceDiagnosticsOptions(schemaUri.toString(), modelUri.toString());
    languages.json.jsonDefaults.setDiagnosticsOptions(options);

    const model = monacoEditor.createModel(configJson, "json", options.validate ? modelUri : undefined);
    if (!editor.value) {
        editor.value = monacoEditor.create(element, {
            theme: "vs-dark",
            model,
        });
    } else {
        editor.value.setModel(model);
    }
    editor.value.layout();
}

/**
 * Create json diagnostics options from the model url and json schema.
 * @param schemaUri Uri for the json schema
 * @param modelUri Uri for the config json model
 */
function getServiceDiagnosticsOptions(schemaUri: string, modelUri: string): monaco.languages.json.DiagnosticsOptions {
    if (schema.value) {
        return {
            validate: true,
            schemas: [
                {
                    uri: schemaUri,
                    fileMatch: [modelUri],
                    schema: objectDeepCopy(schema.value),
                },
            ],
        };
    }
    // nothing to validate if there is no schema
    return {
        validate: false,
        schemas: [],
    };
}

/**
 * Start automatic resize of the editor to match available height.
 * Available height is the size of the dialog minus sibling elements of the editor like header and actions.
 */
function observeForAvailableHeight() {
    const cardTextElement = editorContainer.value?.parentElement;
    const cardElement = cardTextElement?.parentElement;
    if (!cardElement) return;

    const siblings = Array.from(cardElement.children).filter((e) => e !== cardTextElement);

    const resizeToAvailableHeight = () => {
        const maxHeight = window.innerHeight;
        const siblingHeightSum = siblings.reduce((h, elem) => h + elem.clientHeight, 0);
        const availableHeight = maxHeight - siblingHeightSum;

        cardTextElement.style.height = `${availableHeight}px`;

        if (editorElement.value && editorElement.value.parentElement === editorContainer.value) {
            editor.value?.layout();
        }
    };

    resizeToAvailableHeight();
    observer.value = new ResizeObserver(resizeToAvailableHeight);
    observer.value.observe(cardElement);
    for (const sibling of siblings) {
        observer.value.observe(sibling);
    }
}

function onClose() {
    observer.value?.disconnect();
    observer.value = undefined;
    updateSymbol.value = undefined;
}
</script>

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
