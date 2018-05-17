"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.WebpackRemoveOldAssetsPlugin = exports.walk = exports.CONCURRENCY = exports.MAX_FILE_REQUESTS = undefined;

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

var _bluebirdLst2;

function _load_bluebirdLst2() {
    return _bluebirdLst2 = _interopRequireDefault(require("bluebird-lst"));
}

let walk = exports.walk = (() => {
    var _ref = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (initialDirPath, filter) {
        const result = [];
        const queue = [initialDirPath];
        let addDirToResult = false;
        while (queue.length > 0) {
            const dirPath = queue.pop();
            const childNames = yield (0, (_util || _load_util()).orNullIfFileNotExist)((0, (_fsExtraP || _load_fsExtraP()).readdir)(dirPath));
            if (childNames == null) {
                continue;
            }
            if (addDirToResult) {
                result.push(dirPath);
            } else {
                addDirToResult = true;
            }
            childNames.sort();
            const dirs = [];
            // our handler is async, but we should add sorted files, so, we add file to result not in the mapper, but after map
            const sortedFilePaths = yield (_bluebirdLst2 || _load_bluebirdLst2()).default.map(childNames, function (name) {
                const filePath = dirPath + _path.sep + name;
                return (0, (_fsExtraP || _load_fsExtraP()).lstat)(filePath).then(function (stat) {
                    if (filter != null && !filter(filePath, stat)) {
                        return null;
                    }
                    if (stat.isDirectory()) {
                        dirs.push(name);
                        return null;
                    } else {
                        return filePath;
                    }
                });
            }, CONCURRENCY);
            for (const child of sortedFilePaths) {
                if (child != null) {
                    result.push(child);
                }
            }
            dirs.sort();
            for (const child of dirs) {
                queue.push(dirPath + _path.sep + child);
            }
        }
        return result;
    });

    return function walk(_x, _x2) {
        return _ref.apply(this, arguments);
    };
})();

var _fsExtraP;

function _load_fsExtraP() {
    return _fsExtraP = require("fs-extra-p");
}

var _path = _interopRequireWildcard(require("path"));

var _util;

function _load_util() {
    return _util = require("../util");
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const MAX_FILE_REQUESTS = exports.MAX_FILE_REQUESTS = 8;
const CONCURRENCY = exports.CONCURRENCY = { concurrency: MAX_FILE_REQUESTS };
const debug = require("debug")("electron-webpack:clean");
class WebpackRemoveOldAssetsPlugin {
    constructor(dllManifest) {
        this.dllManifest = dllManifest;
    }
    apply(compiler) {
        compiler.plugin("after-emit", (compilation, callback) => {
            const newlyCreatedAssets = compilation.assets;
            const outDir = compiler.options.output.path;
            walk(outDir, (file, stat) => {
                // dll plugin
                if (file === this.dllManifest) {
                    return false;
                }
                const relativePath = file.substring(outDir.length + 1);
                if (stat.isFile()) {
                    return newlyCreatedAssets[relativePath] == null;
                } else if (stat.isDirectory()) {
                    for (const p of Object.keys(newlyCreatedAssets)) {
                        if (p.length > relativePath.length && (p[relativePath.length] === "/" || p[relativePath.length] === "\\") && p.startsWith(relativePath)) {
                            return false;
                        }
                    }
                    return true;
                }
                return false;
            }).then(it => {
                if (it.length === 0) {
                    return null;
                }
                if (debug.enabled) {
                    debug(`Remove outdated files:\n  ${it.join("\n  ")}`);
                }
                return (_bluebirdLst2 || _load_bluebirdLst2()).default.map(it, it => (0, (_fsExtraP || _load_fsExtraP()).remove)(it), CONCURRENCY);
            }).then(() => callback()).catch(callback);
        });
    }
}
exports.WebpackRemoveOldAssetsPlugin = WebpackRemoveOldAssetsPlugin; //# sourceMappingURL=WebpackRemoveOldAssetsPlugin.js.map