"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.MainTarget = undefined;

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
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

var _BaseTarget;

function _load_BaseTarget() {
    return _BaseTarget = require("./BaseTarget");
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class MainTarget extends (_BaseTarget || _load_BaseTarget()).BaseTarget {
    constructor() {
        super();
    }
    configureRules(configurator) {
        super.configureRules(configurator);
        configurator.rules.push({
            test: /\.(png|jpg|gif)$/,
            use: [{
                loader: "url-loader",
                // to avoid any issues related to asar, embed any image up to 10MB as data url
                options: (0, (_BaseTarget || _load_BaseTarget()).configureFileLoader)("imgs", 10 * 1024 * 1024)
            }]
        });
    }
    configurePlugins(configurator) {
        var _this = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            yield (_BaseTarget || _load_BaseTarget()).BaseTarget.prototype.configurePlugins.call(_this, configurator);
            if (configurator.isProduction) {
                configurator.plugins.push(new (_webpack || _load_webpack()).DefinePlugin({
                    __static: `process.resourcesPath + "/static"`
                }));
                // do not add for main dev (to avoid adding to hot update chunks), our main-hmr install it
                configurator.plugins.push(new (_webpack || _load_webpack()).BannerPlugin({
                    banner: 'require("source-map-support/source-map-support.js").install();',
                    test: /\.js$/,
                    raw: true,
                    entryOnly: true
                }));
                return;
            }
            configurator.entryFiles.push(_path.join(__dirname, "../electron-main-hmr/main-hmr"));
            const devIndexFile = yield (0, (_util || _load_util()).getFirstExistingFile)(["index.dev.ts", "index.dev.js"], _path.join(configurator.projectDir, "src/main"));
            if (devIndexFile != null) {
                configurator.entryFiles.push(devIndexFile);
            }
        })();
    }
}
exports.MainTarget = MainTarget; //# sourceMappingURL=MainTarget.js.map