"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.BaseTarget = undefined;

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

exports.configureFileLoader = configureFileLoader;

var _path = _interopRequireWildcard(require("path"));

var _webpack;

function _load_webpack() {
    return _webpack = require("webpack");
}

var _dll;

function _load_dll() {
    return _dll = require("../configurators/dll");
}

var _eslint;

function _load_eslint() {
    return _eslint = require("../configurators/eslint");
}

var _js;

function _load_js() {
    return _js = require("../configurators/js");
}

var _WatchMatchPlugin;

function _load_WatchMatchPlugin() {
    return _WatchMatchPlugin = require("../plugins/WatchMatchPlugin");
}

var _WebpackRemoveOldAssetsPlugin;

function _load_WebpackRemoveOldAssetsPlugin() {
    return _WebpackRemoveOldAssetsPlugin = require("../plugins/WebpackRemoveOldAssetsPlugin");
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class BaseTarget {
    configureRules(configurator) {
        const rules = configurator.rules;
        const babelLoader = (0, (_js || _load_js()).createBabelLoader)(configurator);
        if (configurator.type !== "main" && configurator.hasDependency("iview")) {
            rules.push({
                test: /iview.src.*?js$/,
                use: babelLoader
            });
        }
        rules.push({
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            use: babelLoader
        }, {
            test: /\.node$/,
            use: "node-loader"
        });
        if (configurator.hasDevDependency("nunjucks-loader")) {
            rules.push({
                test: /\.(njk|nunjucks)$/,
                loader: "nunjucks-loader"
            });
        }
        (0, (_eslint || _load_eslint()).configureEslint)(configurator);
    }
    configurePlugins(configurator) {
        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            const plugins = configurator.plugins;
            const dllManifest = yield (0, (_dll || _load_dll()).configureDll)(configurator);
            if (configurator.isProduction) {
                if (configurator.env.minify !== false) {
                    const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
                    plugins.push(new UglifyJsPlugin({
                        parallel: true,
                        sourceMap: true,
                        uglifyOptions: {
                            compress: {
                                ecma: 7
                            }
                        }
                    }));
                }
                plugins.push(new (_webpack || _load_webpack()).DefinePlugin({
                    "process.env.NODE_ENV": "\"production\""
                }));
                plugins.push(new (_webpack || _load_webpack()).LoaderOptionsPlugin({ minimize: true }));
                // do not use ModuleConcatenationPlugin for HMR
                // https://github.com/webpack/webpack-dev-server/issues/949
                plugins.push(new (_webpack || _load_webpack()).optimize.ModuleConcatenationPlugin());
            } else {
                configureDevelopmentPlugins(configurator);
            }
            if (configurator.env.autoClean !== false) {
                plugins.push(new (_WebpackRemoveOldAssetsPlugin || _load_WebpackRemoveOldAssetsPlugin()).WebpackRemoveOldAssetsPlugin(dllManifest));
            }
            plugins.push(new (_webpack || _load_webpack()).NoEmitOnErrorsPlugin());
            const additionalEnvironmentVariables = Object.keys(process.env).filter(function (it) {
                return it.startsWith("ELECTRON_WEBPACK_");
            });
            if (additionalEnvironmentVariables.length > 0) {
                plugins.push(new (_webpack || _load_webpack()).EnvironmentPlugin(additionalEnvironmentVariables));
            }
        })();
    }
}
exports.BaseTarget = BaseTarget;
function configureFileLoader(prefix, limit = 10 * 1024) {
    return {
        limit,
        name: `${prefix}/[name]--[folder].[ext]`
    };
}
function isAncestor(file, dir) {
    return file.length > dir.length && file[dir.length] === _path.sep && file.startsWith(dir);
}
function configureDevelopmentPlugins(configurator) {
    const plugins = configurator.plugins;
    plugins.push(new (_webpack || _load_webpack()).NamedModulesPlugin());
    plugins.push(new (_webpack || _load_webpack()).DefinePlugin({
        __static: `"${_path.join(configurator.projectDir, "static").replace(/\\/g, "\\\\")}"`
    }));
    plugins.push(new (_webpack || _load_webpack()).HotModuleReplacementPlugin());
    if (configurator.hasDevDependency("webpack-build-notifier")) {
        const WebpackNotifierPlugin = require("webpack-build-notifier");
        plugins.push(new WebpackNotifierPlugin({
            title: `Webpack - ${configurator.type}`,
            suppressSuccess: "initial",
            sound: false
        }));
    }
    if (configurator.hasDevDependency("webpack-notifier")) {
        const WebpackNotifierPlugin = require("webpack-notifier");
        plugins.push(new WebpackNotifierPlugin({ title: `Webpack - ${configurator.type}` }));
    }
    // watch common code
    let commonSourceDir = configurator.electronWebpackConfiguration.commonSourceDirectory;
    if (commonSourceDir == null) {
        // not src/common, because it is convenient to just put some code into src to use it
        commonSourceDir = _path.join(configurator.projectDir, "src");
    }
    const alienSourceDir = configurator.getSourceDirectory(configurator.type === "main" ? "renderer" : "main");
    configurator.plugins.push(new (_WatchMatchPlugin || _load_WatchMatchPlugin()).WatchFilterPlugin(file => {
        return file === commonSourceDir || isAncestor(file, commonSourceDir) && alienSourceDir != null && !file.startsWith(alienSourceDir);
    }, require("debug")(`electron-webpack:watch-${configurator.type}`)));
}
//# sourceMappingURL=BaseTarget.js.map