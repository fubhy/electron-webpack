"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getDllAssets = exports.configureDll = undefined;

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

let configureDll = exports.configureDll = (() => {
    var _ref = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (configurator) {
        let dllManifest = null;
        const projectDir = configurator.projectDir;
        if (configurator.type === "renderer-dll") {
            const dll = configurator.electronWebpackConfiguration.renderer.dll;
            if (dll == null) {
                throw new Error(`renderer-dll requires DLL configuration`);
            }
            configurator.config.entry = Array.isArray(dll) ? { vendor: dll } : dll;
            dllManifest = _path.join(configurator.commonDistDirectory, configurator.type, "manifest.json");
            configurator.plugins.push(new (_webpack || _load_webpack()).DllPlugin({
                name: "[name]",
                path: dllManifest,
                context: projectDir
            }));
            const output = configurator.config.output;
            // leave as default "var"
            delete output.libraryTarget;
            output.library = "[name]";
        } else if (configurator.type === "renderer") {
            const dllDir = _path.join(configurator.commonDistDirectory, "renderer-dll");
            const dirStat = yield (0, (_util || _load_util()).statOrNull)(dllDir);
            if (dirStat == null || !dirStat.isDirectory()) {
                configurator.debug("No DLL directory");
                return null;
            }
            configurator.debug(`DLL directory: ${dllDir}`);
            configurator.plugins.push(new (_webpack || _load_webpack()).DllReferencePlugin({
                context: projectDir,
                manifest: yield (0, (_fsExtraP || _load_fsExtraP()).readJson)(_path.join(dllDir, "manifest.json"))
            }));
        }
        return dllManifest;
    });

    return function configureDll(_x) {
        return _ref.apply(this, arguments);
    };
})();

let getDllAssets = exports.getDllAssets = (() => {
    var _ref2 = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (dllDir, configurator) {
        if (configurator.electronWebpackConfiguration.renderer.dll == null) {
            return [];
        }
        const files = yield (0, (_util || _load_util()).orNullIfFileNotExist)((0, (_fsExtraP || _load_fsExtraP()).readdir)(dllDir));
        return files == null ? [] : files.filter(function (it) {
            return it.endsWith(".js") || it.endsWith(".css");
        }).sort();
    });

    return function getDllAssets(_x2, _x3) {
        return _ref2.apply(this, arguments);
    };
})();
//# sourceMappingURL=dll.js.map


var _fsExtraP;

function _load_fsExtraP() {
    return _fsExtraP = require("fs-extra-p");
}

var _path = _interopRequireWildcard(require("path"));

var _webpack;

function _load_webpack() {
    return _webpack = require("webpack");
}

var _util;

function _load_util() {
    return _util = require("../util");
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }