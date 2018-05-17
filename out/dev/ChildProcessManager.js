"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.PromiseNotifier = exports.ChildProcessManager = undefined;
exports.run = run;

var _child_process;

function _load_child_process() {
    return _child_process = require("child_process");
}

var _path = _interopRequireWildcard(require("path"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const debug = require("debug")("electron-webpack");
function run(programm, args, options) {
    const isWin = process.platform === "win32";
    return (0, (_child_process || _load_child_process()).spawn)(isWin ? _path.join(__dirname, "../../vendor/runnerw.exe") : programm, isWin ? [programm].concat(args) : args, options);
}
class ChildProcessManager {
    constructor(child, debugLabel, promiseNotifier) {
        this.mainProcessExitCleanupCallback = null;
        this.child = child;
        require("async-exit-hook")(callback => {
            this.mainProcessExitCleanupCallback = callback;
            const child = this.child;
            if (child == null) {
                return;
            }
            this.child = null;
            if (promiseNotifier != null) {
                promiseNotifier.resolve();
            }
            if (debug.enabled) {
                debug(`Send SIGINT to ${debugLabel}`);
            }
            if (process.platform === "win32") {
                child.stdin.end(Buffer.from([5, 5]));
            } else {
                child.kill("SIGINT");
            }
        });
        child.on("close", code => {
            const mainProcessExitCleanupCallback = this.mainProcessExitCleanupCallback;
            if (mainProcessExitCleanupCallback != null) {
                this.mainProcessExitCleanupCallback = null;
                mainProcessExitCleanupCallback();
            }
            const child = this.child;
            if (child == null) {
                return;
            }
            this.child = null;
            const message = `${debugLabel} exited with code ${code}`;
            if (promiseNotifier != null) {
                promiseNotifier.reject(new Error(message));
            }
            if (code === 0) {
                if (debug.enabled) {
                    debug(message);
                    // otherwise no newline in the terminal
                    process.stderr.write("\n");
                }
            } else {
                process.stderr.write(`${message}\n`);
            }
        });
    }
}
exports.ChildProcessManager = ChildProcessManager;
class PromiseNotifier {
    constructor(_resolve, _reject) {
        this._resolve = _resolve;
        this._reject = _reject;
    }
    resolve() {
        const r = this._resolve;
        if (r != null) {
            this._resolve = null;
            r();
        }
    }
    reject(error) {
        if (this._resolve != null) {
            this._resolve = null;
        }
        const _reject = this._reject;
        if (_reject != null) {
            this._reject = null;
            _reject(error);
        }
    }
}
exports.PromiseNotifier = PromiseNotifier; //# sourceMappingURL=ChildProcessManager.js.map