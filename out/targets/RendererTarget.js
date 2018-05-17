"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.RendererTarget = exports.BaseRendererTarget = undefined;

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

var _bluebirdLst2;

function _load_bluebirdLst2() {
    return _bluebirdLst2 = _interopRequireDefault(require("bluebird-lst"));
}

let computeTitle = (() => {
    var _ref = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (configurator) {
        const titleFromOptions = configurator.electronWebpackConfiguration.title;
        if (titleFromOptions == null || titleFromOptions === false) {
            return null;
        }
        if (titleFromOptions !== true) {
            return titleFromOptions;
        }
        let title = configurator.metadata.productName;
        if (title == null) {
            const electronBuilderConfig = yield (0, (_readConfigFile || _load_readConfigFile()).getConfig)({
                packageKey: "build",
                configFilename: "electron-builder",
                projectDir: configurator.projectDir,
                packageMetadata: new (_lazyVal || _load_lazyVal()).Lazy(function () {
                    return (_bluebirdLst2 || _load_bluebirdLst2()).default.resolve(configurator.metadata);
                })
            });
            if (electronBuilderConfig != null) {
                title = electronBuilderConfig.result.productName;
            }
        }
        if (title == null) {
            title = configurator.metadata.name;
        }
        return title;
    });

    return function computeTitle(_x) {
        return _ref.apply(this, arguments);
    };
})();

let generateIndexFile = (() => {
    var _ref2 = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (configurator, nodeModulePath) {
        // do not use add-asset-html-webpack-plugin - no need to copy vendor files to output (in dev mode will be served directly, in production copied)
        const assets = yield (0, (_dll || _load_dll()).getDllAssets)(_path.join(configurator.commonDistDirectory, "renderer-dll"), configurator);
        const scripts = [];
        const css = [];
        for (const asset of assets) {
            if (asset.endsWith(".js")) {
                scripts.push(`<script type="text/javascript" src="${asset}"></script>`);
            } else {
                css.push(`<link rel="stylesheet" href="${asset}">`);
            }
        }
        const virtualFilePath = "/__virtual__/renderer-index.html";
        const title = yield computeTitle(configurator);
        // add node_modules to global paths so "require" works properly in development
        const VirtualModulePlugin = require("virtual-module-webpack-plugin");
        configurator.plugins.push(new VirtualModulePlugin({
            moduleName: virtualFilePath,
            contents: `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    ${title == null ? "" : `<title>${title}</title>`}
    <script>
      ${nodeModulePath == null ? "" : `require("module").globalPaths.push("${nodeModulePath.replace(/\\/g, "\\\\")}")`}
      require("source-map-support/source-map-support.js").install()
    </script>
    ${scripts.join("")}
  ${css.join("")}
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>`
        }));
        return `!!html-loader?minimize=false!${virtualFilePath}`;
    });

    return function generateIndexFile(_x2, _x3) {
        return _ref2.apply(this, arguments);
    };
})();
//# sourceMappingURL=RendererTarget.js.map


var _lazyVal;

function _load_lazyVal() {
    return _lazyVal = require("lazy-val");
}

var _path = _interopRequireWildcard(require("path"));

var _readConfigFile;

function _load_readConfigFile() {
    return _readConfigFile = require("read-config-file");
}

var _webpack;

function _load_webpack() {
    return _webpack = require("webpack");
}

var _dll;

function _load_dll() {
    return _dll = require("../configurators/dll");
}

var _vue;

function _load_vue() {
    return _vue = require("../configurators/vue/vue");
}

var _util;

function _load_util() {
    return _util = require("../util");
}

var _BaseTarget;

function _load_BaseTarget() {
    return _BaseTarget = require("./BaseTarget");
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const ExtractTextPlugin = require("extract-text-webpack-plugin");
class BaseRendererTarget extends (_BaseTarget || _load_BaseTarget()).BaseTarget {
    constructor() {
        super();
    }
    configureRules(configurator) {
        super.configureRules(configurator);
        configurator.extensions.push(".css");
        const cssHotLoader = configurator.isProduction ? [] : ["css-hot-loader"];
        configurator.rules.push({
            test: /\.css$/,
            use: cssHotLoader.concat(ExtractTextPlugin.extract({
                use: "css-loader",
                fallback: "style-loader"
            }))
        }, {
            test: /\.less$/,
            use: cssHotLoader.concat(ExtractTextPlugin.extract({
                use: [{ loader: "css-loader" }, { loader: "less-loader" }],
                fallback: "style-loader"
            }))
        }, {
            test: /\.scss/,
            use: cssHotLoader.concat(ExtractTextPlugin.extract({
                use: [{ loader: "css-loader" }, { loader: "sass-loader" }],
                fallback: "style-loader"
            }))
        }, {
            test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
            use: {
                loader: "url-loader",
                options: (0, (_BaseTarget || _load_BaseTarget()).configureFileLoader)("imgs")
            }
        }, {
            test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
            loader: "url-loader",
            options: (0, (_BaseTarget || _load_BaseTarget()).configureFileLoader)("media")
        }, {
            test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
            use: {
                loader: "url-loader",
                options: (0, (_BaseTarget || _load_BaseTarget()).configureFileLoader)("fonts")
            }
        });
        if (configurator.hasDevDependency("ejs-html-loader")) {
            configurator.rules.push({
                test: /\.ejs$/,
                loader: "ejs-html-loader"
            });
        }
        if (configurator.hasDependency("vue")) {
            (0, (_vue || _load_vue()).configureVueRenderer)(configurator);
        } else {
            configurator.rules.push({
                test: /\.(html)$/,
                use: {
                    loader: "html-loader"
                }
            });
        }
    }
    configurePlugins(configurator) {
        var _this = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            configurator.debug("Add ExtractTextPlugin plugin");
            configurator.plugins.push(new ExtractTextPlugin(`${configurator.type === "renderer-dll" ? "vendor" : "styles"}.css`));
            // https://github.com/electron-userland/electrify/issues/1
            if (!configurator.isProduction) {
                configurator.plugins.push(new (_webpack || _load_webpack()).DefinePlugin({
                    "process.env.NODE_ENV": "\"development\""
                }));
            }
            yield (_BaseTarget || _load_BaseTarget()).BaseTarget.prototype.configurePlugins.call(_this, configurator);
        })();
    }
}
exports.BaseRendererTarget = BaseRendererTarget;
class RendererTarget extends BaseRendererTarget {
    constructor() {
        super();
    }
    configurePlugins(configurator) {
        var _this2 = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            // not configurable for now, as in the electron-vue
            const customTemplateFile = _path.join(configurator.projectDir, "src/index.ejs");
            const HtmlWebpackPlugin = require("html-webpack-plugin");
            const nodeModulePath = configurator.isProduction ? null : _path.resolve(configurator.projectDir, "node_modules");
            configurator.plugins.push(new HtmlWebpackPlugin({
                filename: "index.html",
                template: (yield (0, (_util || _load_util()).statOrNull)(customTemplateFile)) == null ? yield generateIndexFile(configurator, nodeModulePath) : customTemplateFile,
                minify: false,
                nodeModules: nodeModulePath
            }));
            if (configurator.isProduction) {
                configurator.plugins.push(new (_webpack || _load_webpack()).DefinePlugin({
                    __static: `"${_path.join(configurator.projectDir, "static").replace(/\\/g, "\\\\")}"`
                }));
            } else {
                const contentBase = [_path.join(configurator.projectDir, "static"), _path.join(configurator.commonDistDirectory, "renderer-dll")];
                configurator.config.devServer = {
                    contentBase,
                    host: process.env.ELECTRON_WEBPACK_WDS_HOST || "localhost",
                    port: process.env.ELECTRON_WEBPACK_WDS_PORT || 9080,
                    hot: true,
                    overlay: true
                };
            }
            yield BaseRendererTarget.prototype.configurePlugins.call(_this2, configurator);
        })();
    }
}
exports.RendererTarget = RendererTarget;