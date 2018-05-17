"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.configure = exports.createConfigurator = exports.WebpackConfigurator = exports.getTestConfiguration = undefined;

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

var _bluebirdLst2;

function _load_bluebirdLst2() {
    return _bluebirdLst2 = _interopRequireDefault(require("bluebird-lst"));
}

// noinspection JSUnusedGlobalSymbols
let getTestConfiguration = exports.getTestConfiguration = (() => {
    var _ref = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (env) {
        const configurator = yield createConfigurator("test", env);
        return yield configurator.configure({
            testComponents: _path.join(process.cwd(), "src/renderer/components/testComponents.ts")
        });
    });

    return function getTestConfiguration(_x) {
        return _ref.apply(this, arguments);
    };
})();

let createConfigurator = exports.createConfigurator = (() => {
    var _ref2 = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (type, env) {
        if (env != null) {
            // allow to pass as `--env.autoClean=false` webpack arg
            const _env = env;
            for (const name of ["minify", "autoClean", "production"]) {
                if (_env[name] === "true") {
                    _env[name] = true;
                } else if (_env[name] === "false") {
                    _env[name] = false;
                }
            }
        }
        if (env == null) {
            env = {};
        }
        const projectDir = (env.configuration || {}).projectDir || process.cwd();
        const packageMetadata = yield (0, (_util || _load_util()).orNullIfFileNotExist)((0, (_fsExtraP || _load_fsExtraP()).readJson)(_path.join(projectDir, "package.json")));
        const electronWebpackConfig = ((yield (0, (_readConfigFile || _load_readConfigFile()).getConfig)({
            packageKey: "electronWebpack",
            configFilename: "electron-webpack",
            projectDir,
            packageMetadata: new (_lazyVal || _load_lazyVal()).Lazy(function () {
                return (_bluebirdLst2 || _load_bluebirdLst2()).default.resolve(packageMetadata);
            })
        })) || {}).result || {};
        if (env.configuration != null) {
            (0, (_deepAssign || _load_deepAssign()).deepAssign)(electronWebpackConfig, env.configuration);
        }
        yield (0, (_readConfigFile || _load_readConfigFile()).validateConfig)(electronWebpackConfig, schemeDataPromise, function (message) {
            return `${message}

How to fix:
1. Open https://webpack.electron.build/options
2. Search the option name on the page.
  * Not found? The option was deprecated or not exists (check spelling).
  * Found? Check that the option in the appropriate place. e.g. "sourceDirectory" only in the "main" or "renderer", not in the root.
`;
        });
        return new WebpackConfigurator(type, env, electronWebpackConfig, packageMetadata);
    });

    return function createConfigurator(_x2, _x3) {
        return _ref2.apply(this, arguments);
    };
})();

let configure = exports.configure = (() => {
    var _ref3 = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (type, env) {
        const configurator = yield createConfigurator(type, env);
        const sourceDir = configurator.sourceDir;
        // explicitly set to null - do not handle at all and do not show info message
        if (sourceDir === null) {
            return null;
        } else {
            return yield configurator.configure();
        }
    });

    return function configure(_x4, _x5) {
        return _ref3.apply(this, arguments);
    };
})();

let computeEntryFile = (() => {
    var _ref4 = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (srcDir, projectDir) {
        const candidates = [];
        for (const ext of ["ts", "js", "tsx"]) {
            for (const name of ["index", "main", "app"]) {
                candidates.push(`${name}.${ext}`);
            }
        }
        const file = yield (0, (_util || _load_util()).getFirstExistingFile)(candidates, srcDir);
        if (file == null) {
            throw new Error(`Cannot find entry file ${_path.relative(projectDir, _path.join(srcDir, "index.ts"))} (or main.ts, or app.ts, or index.js, or main.js, or app.js)`);
        }
        return file;
    });

    return function computeEntryFile(_x6, _x7) {
        return _ref4.apply(this, arguments);
    };
})();

let getInstalledElectronVersion = (() => {
    var _ref5 = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (projectDir) {
        for (const name of ["electron", "electron-prebuilt", "electron-prebuilt-compile"]) {
            try {
                return (yield (0, (_fsExtraP || _load_fsExtraP()).readJson)(_path.join(projectDir, "node_modules", name, "package.json"))).version;
            } catch (e) {
                if (e.code !== "ENOENT") {
                    throw e;
                }
            }
        }
    });

    return function getInstalledElectronVersion(_x8) {
        return _ref5.apply(this, arguments);
    };
})();
//# sourceMappingURL=main.js.map


exports.getAppConfiguration = getAppConfiguration;
exports.getMainConfiguration = getMainConfiguration;
exports.getRendererConfiguration = getRendererConfiguration;
exports.getDllConfiguration = getDllConfiguration;

var _fsExtraP;

function _load_fsExtraP() {
    return _fsExtraP = require("fs-extra-p");
}

var _lazyVal;

function _load_lazyVal() {
    return _lazyVal = require("lazy-val");
}

var _path = _interopRequireWildcard(require("path"));

var _readConfigFile;

function _load_readConfigFile() {
    return _readConfigFile = require("read-config-file");
}

var _deepAssign;

function _load_deepAssign() {
    return _deepAssign = require("read-config-file/out/deepAssign");
}

require("source-map-support/register");

var _webpackMerge;

function _load_webpackMerge() {
    return _webpackMerge = _interopRequireDefault(require("webpack-merge"));
}

var _ts;

function _load_ts() {
    return _ts = require("./configurators/ts");
}

var _vue;

function _load_vue() {
    return _vue = require("./configurators/vue/vue");
}

var _BaseTarget;

function _load_BaseTarget() {
    return _BaseTarget = require("./targets/BaseTarget");
}

var _MainTarget;

function _load_MainTarget() {
    return _MainTarget = require("./targets/MainTarget");
}

var _RendererTarget;

function _load_RendererTarget() {
    return _RendererTarget = require("./targets/RendererTarget");
}

var _util;

function _load_util() {
    return _util = require("./util");
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const _debug = require("debug");
// noinspection JSUnusedGlobalSymbols
function getAppConfiguration(env) {
    return (_bluebirdLst2 || _load_bluebirdLst2()).default.filter([configure("main", env), configure("renderer", env)], it => it != null);
}
// noinspection JSUnusedGlobalSymbols
function getMainConfiguration(env) {
    return configure("main", env);
}
// noinspection JSUnusedGlobalSymbols
function getRendererConfiguration(env) {
    return configure("renderer", env);
}
// in the future, if need, isRenderer = true arg can be added
// noinspection JSUnusedGlobalSymbols
function getDllConfiguration(env) {
    return configure("renderer-dll", env);
}class WebpackConfigurator {
    constructor(type, env, electronWebpackConfiguration, metadata) {
        this.type = type;
        this.env = env;
        this.electronWebpackConfiguration = electronWebpackConfiguration;
        this.metadata = metadata;
        this.electronVersionPromise = new (_lazyVal || _load_lazyVal()).Lazy(() => getInstalledElectronVersion(this.projectDir));
        this.isTest = this.type === "test";
        this.debug = _debug(`electron-webpack:${this.type}`);
        this._configuration = null;
        this.rules = [];
        this.plugins = [];
        // js must be first - e.g. iview has two files loading-bar.js and loading-bar.vue - when we require "loading-bar", js file must be resolved and not vue
        this.extensions = [".js", ".json", ".node"];
        this._electronVersion = null;
        this.entryFiles = [];
        if (electronWebpackConfiguration.renderer === undefined) {
            electronWebpackConfiguration.renderer = {};
        }
        if (electronWebpackConfiguration.main === undefined) {
            electronWebpackConfiguration.main = {};
        }
        if (metadata.dependencies == null) {
            metadata.dependencies = {};
        }
        if (metadata.devDependencies == null) {
            metadata.devDependencies = {};
        }
        this.projectDir = electronWebpackConfiguration.projectDir || process.cwd();
        this.isRenderer = type.startsWith("renderer");
        process.env.BABEL_ENV = type;
        this.isProduction = this.env.production == null ? process.env.NODE_ENV === "production" : this.env.production;
        this.debug(`isProduction: ${this.isProduction}`);
        this.sourceDir = this.getSourceDirectory(this.type);
        const commonSourceDirectory = this.electronWebpackConfiguration.commonSourceDirectory;
        this.commonSourceDirectory = commonSourceDirectory == null ? _path.join(this.projectDir, "src", "common") : _path.resolve(this.projectDir, commonSourceDirectory);
    }
    get config() {
        return this._configuration;
    }
    get electronVersion() {
        return this._electronVersion;
    }
    /**
     * Returns null if code processing for type is disabled.
     */
    getSourceDirectory(type) {
        const part = this.getPartConfiguration(type);
        if (part === null || part != null && part.sourceDirectory === null) {
            // part or sourceDirectory is explicitly set to null
            return null;
        }
        const result = part == null ? null : part.sourceDirectory;
        if (result == null) {
            return _path.join(this.projectDir, "src", type.startsWith("renderer") || type === "test" ? "renderer" : type);
        } else {
            return _path.resolve(this.projectDir, result);
        }
    }
    getPartConfiguration(type) {
        if (type === "main") {
            return this.electronWebpackConfiguration.main;
        } else {
            return this.electronWebpackConfiguration.renderer;
        }
    }
    get commonDistDirectory() {
        return _path.join(this.projectDir, "dist");
    }
    hasDependency(name) {
        return name in this.metadata.dependencies || this.hasDevDependency(name);
    }
    hasDevDependency(name) {
        return name in this.metadata.devDependencies;
    }
    /**
     * Returns the names of devDependencies that match a given string or regex.
     * If no matching dependencies are found, an empty array is returned.
     *
     * @return list of matching dependency names, e.g. `['babel-preset-react', 'babel-preset-stage-0']`
     */
    getMatchingDevDependencies(options = {}) {
        const includes = options.includes || [];
        const excludes = new Set(options.excludes || []);
        return Object.keys(this.metadata.devDependencies).filter(name => !excludes.has(name) && includes.some(prefix => name.startsWith(prefix)));
    }
    configure(entry) {
        var _this = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            _this._configuration = {
                context: _this.projectDir,
                devtool: _this.isProduction || _this.isTest ? "nosources-source-map" : "eval-source-map",
                externals: _this.computeExternals(),
                node: {
                    __dirname: !_this.isProduction,
                    __filename: !_this.isProduction
                },
                output: {
                    filename: "[name].js",
                    chunkFilename: "[name].bundle.js",
                    libraryTarget: "commonjs2",
                    path: _path.join(_this.commonDistDirectory, _this.type)
                },
                target: _this.isTest ? "node" : `electron-${_this.type === "renderer-dll" ? "renderer" : _this.type}`,
                resolve: {
                    alias: {
                        "@": _this.sourceDir,
                        common: _this.commonSourceDirectory
                    },
                    extensions: _this.extensions
                },
                module: {
                    rules: _this.rules
                },
                plugins: _this.plugins
            };
            if (entry != null) {
                _this._configuration.entry = entry;
            }
            // if electronVersion not specified, use latest
            _this._electronVersion = _this.electronWebpackConfiguration.electronVersion || (yield _this.electronVersionPromise.value) || "1.8.2";
            const target = function () {
                switch (_this.type) {
                    case "renderer":
                        return new (_RendererTarget || _load_RendererTarget()).RendererTarget();
                    case "renderer-dll":
                        return new (_RendererTarget || _load_RendererTarget()).BaseRendererTarget();
                    case "test":
                        return new (_RendererTarget || _load_RendererTarget()).BaseRendererTarget();
                    case "main":
                        return new (_MainTarget || _load_MainTarget()).MainTarget();
                    default:
                        return new (_BaseTarget || _load_BaseTarget()).BaseTarget();
                }
            }();
            _this.debug(`Target class: ${target.constructor.name}`);
            target.configureRules(_this);
            yield (_bluebirdLst2 || _load_bluebirdLst2()).default.all([target.configurePlugins(_this), (0, (_ts || _load_ts()).configureTypescript)(_this)]);
            (0, (_vue || _load_vue()).configureVue)(_this);
            if (_this.debug.enabled) {
                _this.debug(`\n\n${_this.type} config:` + JSON.stringify(_this._configuration, null, 2) + "\n\n");
            }
            if (_this.config.entry == null) {
                _this.entryFiles.push((yield computeEntryFile(_this.sourceDir, _this.projectDir)));
                _this.config.entry = {
                    [_this.type]: _this.entryFiles
                };
                const mainConfiguration = _this.electronWebpackConfiguration.main || {};
                let extraEntries = mainConfiguration.extraEntries;
                if (_this.type === "main" && extraEntries != null) {
                    if (typeof extraEntries === "string") {
                        extraEntries = [extraEntries];
                    }
                    if (Array.isArray(extraEntries)) {
                        for (const p of extraEntries) {
                            _this.config.entry[_path.basename(p, _path.extname(p))] = p;
                        }
                    } else {
                        Object.assign(_this.config.entry, extraEntries);
                    }
                }
            }
            _this._configuration = yield _this.applyCustomModifications(_this.config);
            return _this.config;
        })();
    }
    applyCustomModifications(config) {
        const applyCustom = filepath => {
            const customModule = require(_path.join(this.projectDir, filepath));
            if (typeof customModule === 'function') {
                return customModule(config);
            } else {
                return (_webpackMerge || _load_webpackMerge()).default.smart(config, customModule);
            }
        };
        if (this.type === 'renderer' && this.electronWebpackConfiguration.renderer && this.electronWebpackConfiguration.renderer.webpackConfig) {
            return applyCustom(this.electronWebpackConfiguration.renderer.webpackConfig);
        }
        if (this.type === 'renderer-dll' && this.electronWebpackConfiguration.renderer && this.electronWebpackConfiguration.renderer.webpackDllConfig) {
            return applyCustom(this.electronWebpackConfiguration.renderer.webpackDllConfig);
        }
        if (this.type === 'main' && this.electronWebpackConfiguration.main && this.electronWebpackConfiguration.main.webpackConfig) {
            return applyCustom(this.electronWebpackConfiguration.main.webpackConfig);
        }
        return config;
    }
    computeExternals() {
        const whiteListedModules = new Set(this.electronWebpackConfiguration.whiteListedModules || []);
        if (this.isRenderer) {
            whiteListedModules.add("vue");
        }
        const filter = name => !name.startsWith("@types/") && (whiteListedModules == null || !whiteListedModules.has(name));
        const externals = Object.keys(this.metadata.dependencies).filter(filter);
        externals.push("electron");
        externals.push("webpack");
        // because electron-devtools-installer specified in the devDependencies, but required in the index.dev
        externals.push("electron-devtools-installer");
        if (this.type === "main") {
            externals.push("webpack/hot/log-apply-result");
            externals.push("electron-webpack/out/electron-main-hmr/HmrClient");
            externals.push("source-map-support/source-map-support.js");
        }
        if (this.electronWebpackConfiguration.externals != null) {
            return externals.concat(this.electronWebpackConfiguration.externals);
        }
        return externals;
    }
}
exports.WebpackConfigurator = WebpackConfigurator;
const schemeDataPromise = new (_lazyVal || _load_lazyVal()).Lazy(() => (0, (_fsExtraP || _load_fsExtraP()).readJson)(_path.join(__dirname, "..", "scheme.json")));