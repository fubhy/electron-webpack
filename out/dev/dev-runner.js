"use strict";

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

var _bluebirdLst2;

function _load_bluebirdLst2() {
    return _bluebirdLst2 = _interopRequireDefault(require("bluebird-lst"));
}

// do not remove main.js to allow IDE to keep breakpoints
let emptyMainOutput = (() => {
    var _ref = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
        const outDir = _path.join(projectDir, "dist", "main");
        const files = yield (0, (_util || _load_util()).orNullIfFileNotExist)((0, (_fsExtraP || _load_fsExtraP()).readdir)(outDir));
        if (files == null) {
            return;
        }
        yield (_bluebirdLst2 || _load_bluebirdLst2()).default.map(files.filter(function (it) {
            return !it.startsWith(".") && it !== "main.js";
        }), function (it) {
            return (0, (_fsExtraP || _load_fsExtraP()).remove)(outDir + _path.sep + it);
        });
    });

    return function emptyMainOutput() {
        return _ref.apply(this, arguments);
    };
})();

let main = (() => {
    var _ref2 = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
        const devRunner = new DevRunner();
        yield devRunner.start();
    });

    return function main() {
        return _ref2.apply(this, arguments);
    };
})();

var _chalk;

function _load_chalk() {
    return _chalk = _interopRequireDefault(require("chalk"));
}

var _child_process;

function _load_child_process() {
    return _child_process = require("child_process");
}

var _fsExtraP;

function _load_fsExtraP() {
    return _fsExtraP = require("fs-extra-p");
}

var _path = _interopRequireWildcard(require("path"));

require("source-map-support/register");

var _webpack;

function _load_webpack() {
    return _webpack = _interopRequireDefault(require("webpack"));
}

var _HmrServer;

function _load_HmrServer() {
    return _HmrServer = require("../electron-main-hmr/HmrServer");
}

var _main;

function _load_main() {
    return _main = require("../main");
}

var _util;

function _load_util() {
    return _util = require("../util");
}

var _devUtil;

function _load_devUtil() {
    return _devUtil = require("./devUtil");
}

var _WebpackDevServerManager;

function _load_WebpackDevServerManager() {
    return _WebpackDevServerManager = require("./WebpackDevServerManager");
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const projectDir = process.cwd();
let socketPath = null;
const debug = require("debug")("electron-webpack");
class DevRunner {
    start() {
        var _this = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            const wdsHost = "localhost";
            const wdsPort = yield (0, (_util || _load_util()).getFreePort)(wdsHost, 9080);
            const env = Object.assign({}, (0, (_devUtil || _load_devUtil()).getCommonEnv)(), { ELECTRON_WEBPACK_WDS_HOST: wdsHost, ELECTRON_WEBPACK_WDS_PORT: wdsPort });
            const hmrServer = new (_HmrServer || _load_HmrServer()).HmrServer();
            yield (_bluebirdLst2 || _load_bluebirdLst2()).default.all([(0, (_WebpackDevServerManager || _load_WebpackDevServerManager()).startRenderer)(projectDir, env), hmrServer.listen().then(function (it) {
                socketPath = it;
            }), emptyMainOutput().then(function () {
                return _this.startMainCompilation(hmrServer);
            })]);
            hmrServer.ipc.on("error", function (error) {
                (0, (_devUtil || _load_devUtil()).logError)("Main", error);
            });
            const electronArgs = process.env.ELECTRON_ARGS;
            const args = electronArgs != null && electronArgs.length > 0 ? JSON.parse(electronArgs) : [`--inspect=${yield (0, (_util || _load_util()).getFreePort)("127.0.0.1", 5858)}`];
            args.push(_path.join(projectDir, "dist/main/main.js"));
            // we should start only when both start and main are started
            startElectron(args, env);
        })();
    }
    startMainCompilation(hmrServer) {
        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            const mainConfig = yield (0, (_main || _load_main()).configure)("main", {
                production: false,
                autoClean: false,
                forkTsCheckerLogger: {
                    info: function () {
                        // ignore
                    },
                    warn: function (message) {
                        (0, (_devUtil || _load_devUtil()).logProcess)("Main", message, (_chalk || _load_chalk()).default.yellow);
                    },
                    error: function (message) {
                        (0, (_devUtil || _load_devUtil()).logProcess)("Main", message, (_chalk || _load_chalk()).default.red);
                    }
                }
            });
            yield new (_bluebirdLst2 || _load_bluebirdLst2()).default(function (resolve, reject) {
                const compiler = (0, (_webpack || _load_webpack()).default)(mainConfig);
                const printCompilingMessage = new (_devUtil || _load_devUtil()).DelayedFunction(function () {
                    (0, (_devUtil || _load_devUtil()).logProcess)("Main", "Compiling...", (_chalk || _load_chalk()).default.yellow);
                });
                compiler.plugin("compile", function () {
                    hmrServer.beforeCompile();
                    printCompilingMessage.schedule();
                });
                let watcher = compiler.watch({}, function (error, stats) {
                    printCompilingMessage.cancel();
                    if (watcher == null) {
                        return;
                    }
                    if (error != null) {
                        if (reject == null) {
                            (0, (_devUtil || _load_devUtil()).logError)("Main", error);
                        } else {
                            reject(error);
                            reject = null;
                        }
                        return;
                    }
                    (0, (_devUtil || _load_devUtil()).logProcess)("Main", stats.toString({
                        colors: true
                    }), (_chalk || _load_chalk()).default.yellow);
                    if (resolve != null) {
                        resolve();
                        resolve = null;
                        return;
                    }
                    hmrServer.built(stats);
                });
                require("async-exit-hook")(function (callback) {
                    debug(`async-exit-hook: ${callback == null}`);
                    const w = watcher;
                    if (w == null) {
                        return;
                    }
                    watcher = null;
                    w.close(function () {
                        return callback();
                    });
                });
            });
        })();
    }
}

main().catch(error => {
    console.error(error);
});
function startElectron(electronArgs, env) {
    const electronProcess = (0, (_child_process || _load_child_process()).spawn)(require("electron").toString(), electronArgs, {
        env: Object.assign({}, env, { ELECTRON_HMR_SOCKET_PATH: socketPath })
    });
    // required on windows
    require("async-exit-hook")(() => {
        electronProcess.kill("SIGINT");
    });
    let queuedData = null;
    electronProcess.stdout.on("data", data => {
        data = data.toString();
        // do not print the only line - doesn't make sense
        if (data.trim() === "[HMR] Updated modules:") {
            queuedData = data;
            return;
        }
        if (queuedData != null) {
            data = queuedData + data;
            queuedData = null;
        }
        (0, (_devUtil || _load_devUtil()).logProcess)("Electron", data, (_chalk || _load_chalk()).default.blue);
    });
    (0, (_devUtil || _load_devUtil()).logProcessErrorOutput)("Electron", electronProcess);
    electronProcess.on("close", exitCode => {
        debug(`Electron exited with exit code ${exitCode}`);
        if (exitCode === 100) {
            setImmediate(() => {
                startElectron(electronArgs, env);
            });
        } else {
            process.emit("message", "shutdown");
        }
    });
}
//# sourceMappingURL=dev-runner.js.map