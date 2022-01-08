// eslint-disable-next-line @typescript-eslint/no-var-requires
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");

process.env.VUE_APP_TITLE = "nodecg-io Dashboard";

/**
 * @type {import("@vue/cli-service").ProjectOptions}
 */
module.exports = {
    outputDir: "dist",
    publicPath: "./",

    pluginOptions: {},
    transpileDependencies: ["vuetify"],

    configureWebpack: {
        plugins: [
            new MonacoWebpackPlugin({
                languages: ["json"],
            }),
        ],
    },
};
