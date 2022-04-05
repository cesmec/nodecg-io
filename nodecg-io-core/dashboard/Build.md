# nodecg-io Dashboard

This folder contains the code for the nodecg-io configuration dashboard.
The built files in the dist folder will be used as a dashboard panel of nodecg-io-core when it is mounted by NodeCG.

After running a build of nodecg-io, NodeCG can be started as usual and you can start using the dashboard.

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
Note: The initial watch build should be completed *before* starting NodeCG.

For better TypeScript support in Vue.js components, the [Volar extension](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar) is recommended when using Visual Studio Code.

## Lints and fixes files
```
npm run lint
```
Lint and fix files based on the eslint config.
