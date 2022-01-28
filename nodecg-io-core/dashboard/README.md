# nodecg-io Dashboard

This folder contains the TypeScript / Vue.js code for the nodecg-io configuration dashboard.
The build output is configured to be the dashboard folder of nodecg-io-core which will then be mounted by NodeCG.

To use the dashboard, nodecg-io-core (including the build output of the dashboard produced by `npm run build` or `npm run watch`) needs to be served by NodeCG as its functions are expected to be available at runtime.

## Compiles and minifies for production
```
npm run build
```
Compiles and minifies dashboard for release (recommended, unless you want to make changes to the dashboard itself).
Using build creates a smaller bundle compared to watch, but does not automatically recompile when files change.

## Compiles and hot-reloads for development
```
npm run watch
```
This command automatically recompiles when included files change.
Changes are available after reloading the dashboard website and usually do not require a restart of NodeCG.

For better TypeScript support in Vue.js components, the [Volar extension](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar) is recommended for Visual Studio Code.

## Lints and fixes files
```
npm run lint
```
Lint and fix files based on the eslint config.
