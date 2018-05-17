"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.configureTypescript = undefined;

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

let configureTypescript = exports.configureTypescript = (() => {
    var _ref = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (configurator) {
        const hasTsChecker = configurator.hasDevDependency("fork-ts-checker-webpack-plugin") || configurator.hasDevDependency("electron-webpack-ts");
        if (!(hasTsChecker || configurator.hasDevDependency("ts-loader"))) {
            return;
        }
        // add after js
        configurator.extensions.splice(1, 0, ".ts", ".tsx");
        const isTranspileOnly = configurator.isTest || hasTsChecker && !configurator.isProduction;
        const tsConfigFile = yield (0, (_util || _load_util()).getFirstExistingFile)([_path.join(configurator.sourceDir, "tsconfig.json"), _path.join(configurator.projectDir, "tsconfig.json")], null);
        // check to produce clear error message if no tsconfig.json
        if (tsConfigFile == null) {
            throw new Error(`Please create tsconfig.json in the "${configurator.projectDir}":\n\n{\n  "extends": "./node_modules/electron-webpack/tsconfig-base.json"\n}\n\n`);
        }
        if (configurator.debug.enabled) {
            configurator.debug(`Using ${tsConfigFile}`);
        }
        // no sense to use fork-ts-checker-webpack-plugin for production build
        if (isTranspileOnly && !configurator.isTest) {
            const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
            configurator.plugins.push(new ForkTsCheckerWebpackPlugin({
                tsconfig: tsConfigFile,
                logger: configurator.env.forkTsCheckerLogger || {
                    info: function () {
                        // ignore
                    },
                    warn: console.warn.bind(console),
                    error: console.error.bind(console)
                }
            }));
        }
        const tsLoaderOptions = {
            // use transpileOnly mode to speed-up compilation
            // in the test mode also, because checked during dev or production build
            transpileOnly: isTranspileOnly,
            appendTsSuffixTo: [/\.vue$/],
            configFile: tsConfigFile
        };
        if (configurator.debug.enabled) {
            configurator.debug(`ts-loader options: ${JSON.stringify(tsLoaderOptions, null, 2)}`);
        }
        configurator.rules.push({
            test: /\.tsx?$/,
            exclude: /node_modules/,
            use: [{
                loader: "ts-loader",
                options: tsLoaderOptions
            }]
        });
    });

    return function configureTypescript(_x) {
        return _ref.apply(this, arguments);
    };
})();
//# sourceMappingURL=ts.js.map


var _path = _interopRequireWildcard(require("path"));

var _util;

function _load_util() {
    return _util = require("../util");
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }