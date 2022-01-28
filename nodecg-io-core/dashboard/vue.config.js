// eslint-disable-next-line @typescript-eslint/no-var-requires
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const { SourceMapDevToolPlugin } = require("webpack");

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
        devtool: false,
        plugins: [
            new MonacoWebpackPlugin({
                languages: ["json"],
            }),
            // By excluding sourcemaps for monaco-editor for production builds, the bundle size is reduced by almost 10 MB
            new SourceMapDevToolPlugin({
                filename: "[file].map",
                exclude: process.env.NODE_ENV === "production" ? [/monaco-editor/] : [],
            }),
        ],
    },
};
