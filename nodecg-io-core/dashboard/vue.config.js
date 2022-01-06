// eslint-disable-next-line @typescript-eslint/no-var-requires
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");

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
