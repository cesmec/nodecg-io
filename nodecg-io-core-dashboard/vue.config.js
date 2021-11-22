// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");

module.exports = {
    outputDir: path.resolve(__dirname, "..", "nodecg-io-core", "dashboard"),
    publicPath: "./",

    transpileDependencies: ["vuetify"],
    
    configureWebpack: {
        plugins: [new MonacoWebpackPlugin()],
    },
};
