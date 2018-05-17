"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.HmrServer = undefined;

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = _interopRequireDefault(require("bluebird-lst"));
}

var _crocket;

function _load_crocket() {
    return _crocket = _interopRequireDefault(require("crocket"));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const debug = require("debug")("electron-webpack:dev-runner");
class HmrServer {
    constructor() {
        this.state = false;
        this.ipc = new (_crocket || _load_crocket()).default();
    }
    listen() {
        return new (_bluebirdLst || _load_bluebirdLst()).default((resolve, reject) => {
            const socketPath = `/tmp/electron-main-ipc-${process.pid.toString(16)}.sock`;
            this.ipc.listen({ path: socketPath }, error => {
                if (error != null) {
                    reject(error);
                }
                if (debug.enabled) {
                    debug(`HMR Server listening on ${socketPath}`);
                }
                resolve(socketPath);
            });
        });
    }
    beforeCompile() {
        this.state = false;
    }
    built(stats) {
        this.state = true;
        setImmediate(() => {
            if (!this.state) {
                return;
            }
            const hash = stats.toJson({ assets: false, chunks: false, children: false, modules: false }).hash;
            if (debug.enabled) {
                debug(`Send built: hash ${hash}`);
            }
            this.ipc.emit("/built", { hash });
        });
    }
}
exports.HmrServer = HmrServer; //# sourceMappingURL=HmrServer.js.map