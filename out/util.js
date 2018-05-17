"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.statOrNull = undefined;

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

var _bluebirdLst2;

function _load_bluebirdLst2() {
    return _bluebirdLst2 = _interopRequireDefault(require("bluebird-lst"));
}

let statOrNull = exports.statOrNull = (() => {
    var _ref = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (file) {
        return orNullIfFileNotExist((0, (_fsExtraP || _load_fsExtraP()).stat)(file));
    });

    return function statOrNull(_x) {
        return _ref.apply(this, arguments);
    };
})();

exports.orNullIfFileNotExist = orNullIfFileNotExist;
exports.orIfFileNotExist = orIfFileNotExist;
exports.getFirstExistingFile = getFirstExistingFile;
exports.getFreePort = getFreePort;

var _fsExtraP;

function _load_fsExtraP() {
    return _fsExtraP = require("fs-extra-p");
}

var _net;

function _load_net() {
    return _net = require("net");
}

var _path = _interopRequireWildcard(require("path"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function orNullIfFileNotExist(promise) {
    return orIfFileNotExist(promise, null);
}
function orIfFileNotExist(promise, fallbackValue) {
    return promise.catch(e => {
        if (e.code === "ENOENT" || e.code === "ENOTDIR") {
            return fallbackValue;
        }
        throw e;
    });
}
function getFirstExistingFile(names, rootDir) {
    return (_bluebirdLst2 || _load_bluebirdLst2()).default.filter(names.map(it => rootDir == null ? it : _path.join(rootDir, it)), it => statOrNull(it).then(it => it != null)).then(it => it.length > 0 ? it[0] : null);
}
function getFreePort(defaultHost, defaultPort) {
    return new (_bluebirdLst2 || _load_bluebirdLst2()).default((resolve, reject) => {
        const server = (0, (_net || _load_net()).createServer)({ pauseOnConnect: true });
        server.addListener("listening", () => {
            const port = server.address().port;
            server.close(() => resolve(port));
        });
        function doListen(port) {
            server.listen({
                host: defaultHost,
                port,
                backlog: 1,
                exclusive: true
            });
        }
        server.on("error", e => {
            if (e.code === "EADDRINUSE") {
                server.close(() => doListen(0));
            } else {
                reject(e);
            }
        });
        doListen(defaultPort);
    });
}
//# sourceMappingURL=util.js.map