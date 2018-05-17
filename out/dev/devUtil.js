"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DelayedFunction = undefined;
exports.logProcessErrorOutput = logProcessErrorOutput;
exports.logError = logError;
exports.logProcess = logProcess;
exports.getCommonEnv = getCommonEnv;

var _chalk;

function _load_chalk() {
    return _chalk = _interopRequireDefault(require("chalk"));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function filterText(s, lineFilter) {
    const lines = s.trim().split(/\r?\n/).filter(it => {
        if (lineFilter != null && !lineFilter.filter(it)) {
            return false;
        }
        // https://github.com/electron/electron/issues/4420
        // this warning can be safely ignored
        if (it.includes("Couldn't set selectedTextBackgroundColor from default ()")) {
            return false;
        }
        return !it.includes("Warning: This is an experimental feature and could change at any time.") && !it.includes("No type errors found") && !it.includes("webpack: Compiled successfully.");
    });
    if (lines.length === 0) {
        return null;
    }
    return "  " + lines.join(`\n  `) + "\n";
}
function logProcessErrorOutput(label, childProcess) {
    childProcess.stderr.on("data", data => {
        logProcess(label, data.toString(), (_chalk || _load_chalk()).default.red);
    });
}
function logError(label, error) {
    logProcess(label, error.stack || error.toString(), (_chalk || _load_chalk()).default.red);
}
const LABEL_LENGTH = 28;
function logProcess(label, data, labelColor, lineFilter = null) {
    const log = filterText(data.toString(), lineFilter);
    if (log == null || log.length === 0) {
        return;
    }
    process.stdout.write(labelColor.bold(`┏ ${label} ${"-".repeat(LABEL_LENGTH - label.length - 1)}`) + "\n\n" + log + "\n" + labelColor.bold(`┗ ${"-".repeat(LABEL_LENGTH)}`) + "\n");
}
class DelayedFunction {
    constructor(executor) {
        this.handle = null;
        this.executor = () => {
            this.handle = null;
            executor();
        };
    }
    schedule() {
        this.cancel();
        this.handle = setTimeout(this.executor, 5000);
    }
    cancel() {
        const handle = this.handle;
        if (handle != null) {
            this.handle = null;
            clearTimeout(handle);
        }
    }
}
exports.DelayedFunction = DelayedFunction;
function getCommonEnv() {
    return Object.assign({}, process.env, { NODE_ENV: "development",
        // to force debug colors in the child process
        DEBUG_COLORS: true, DEBUG_FD: "1" });
}
//# sourceMappingURL=devUtil.js.map