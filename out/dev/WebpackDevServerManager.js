"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.startRenderer = undefined;

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

var _bluebirdLst2;

function _load_bluebirdLst2() {
    return _bluebirdLst2 = _interopRequireDefault(require("bluebird-lst"));
}

// 1. in another process to speedup compilation
// 2. some loaders detect webpack-dev-server hot mode only if run as CLI
let startRenderer = exports.startRenderer = (() => {
    var _ref = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (projectDir, env) {
        const webpackConfigurator = yield (0, (_main || _load_main()).createConfigurator)("renderer", { production: false, configuration: { projectDir } });
        const sourceDir = webpackConfigurator.sourceDir;
        // explicitly set to null - do not handle at all and do not show info message
        if (sourceDir === null) {
            return;
        }
        const dirStat = yield (0, (_util || _load_util()).statOrNull)(sourceDir);
        if (dirStat == null || !dirStat.isDirectory()) {
            (0, (_devUtil || _load_devUtil()).logProcess)("Renderer", `No renderer source directory (${_path.relative(projectDir, sourceDir)})`, (_chalk || _load_chalk()).default.blue);
            return;
        }
        if (webpackConfigurator.hasDependency("electron-next")) {
            debug(`Renderer WDS is not started - there is electron-next dependency`);
            return;
        }
        const lineFilter = new CompoundRendererLineFilter([new OneTimeLineFilter("Project is running at "), new OneTimeLineFilter("webpack output is served from ")]);
        return yield new (_bluebirdLst2 || _load_bluebirdLst2()).default(function (resolve, reject) {
            let devServerProcess;
            try {
                devServerProcess = runWds(projectDir, env);
            } catch (e) {
                reject(e);
                return;
            }
            //tslint:disable-next-line:no-unused-expression
            new (_ChildProcessManager || _load_ChildProcessManager()).ChildProcessManager(devServerProcess, "Renderer WDS", new (_ChildProcessManager || _load_ChildProcessManager()).PromiseNotifier(resolve, reject));
            devServerProcess.on("error", function (error) {
                if (reject == null) {
                    (0, (_devUtil || _load_devUtil()).logError)("Renderer", error);
                } else {
                    reject(error);
                    reject = null;
                }
            });
            devServerProcess.stdout.on("data", function (data) {
                (0, (_devUtil || _load_devUtil()).logProcess)("Renderer", data, (_chalk || _load_chalk()).default.blue, lineFilter);
                const r = resolve;
                // we must resolve only after compilation, otherwise devtools disconnected
                if (r != null && data.includes("webpack: Compiled successfully.")) {
                    resolve = null;
                    r();
                }
            });
            (0, (_devUtil || _load_devUtil()).logProcessErrorOutput)("Renderer", devServerProcess);
        });
    });

    return function startRenderer(_x, _x2) {
        return _ref.apply(this, arguments);
    };
})();

var _chalk;

function _load_chalk() {
    return _chalk = _interopRequireDefault(require("chalk"));
}

var _path = _interopRequireWildcard(require("path"));

var _main;

function _load_main() {
    return _main = require("../main");
}

var _util;

function _load_util() {
    return _util = require("../util");
}

var _ChildProcessManager;

function _load_ChildProcessManager() {
    return _ChildProcessManager = require("./ChildProcessManager");
}

var _devUtil;

function _load_devUtil() {
    return _devUtil = require("./devUtil");
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const debug = require("debug")("electron-webpack");
function runWds(projectDir, env) {
    const isWin = process.platform === "win32";
    const webpackDevServerPath = _path.join(projectDir, "node_modules", ".bin", "webpack-dev-server" + (isWin ? ".cmd" : ""));
    debug(`Start renderer WDS ${webpackDevServerPath} on ${env.ELECTRON_WEBPACK_WDS_PORT} port`);
    return (0, (_ChildProcessManager || _load_ChildProcessManager()).run)(webpackDevServerPath, ["--color", "--env.autoClean=false", "--config", _path.join(__dirname, "../../webpack.renderer.config.js")], {
        env,
        cwd: projectDir
    });
}
class OneTimeLineFilter {
    constructor(prefix) {
        this.prefix = prefix;
        this.filtered = false;
    }
    filter(line) {
        if (!this.filtered && line.startsWith(this.prefix)) {
            this.filtered = true;
            return false;
        }
        return true;
    }
}
class CompoundRendererLineFilter {
    constructor(filters) {
        this.filters = filters;
    }
    filter(line) {
        return !this.filters.some(it => !it.filter(line));
    }
}
//# sourceMappingURL=WebpackDevServerManager.js.map