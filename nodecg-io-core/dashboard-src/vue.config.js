// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");

module.exports = {
    outputDir: path.resolve(__dirname, "..", "dashboard"),
    publicPath: "./",
    chainWebpack: (config) => {
        //https://stackoverflow.com/questions/51890879/how-to-rename-index-html-on-a-vue-js-build
        config.plugin("html").tap((opts) => {
            opts[0].filename = "../dashboard/panel.html";
            return opts;
        });
    },
};
