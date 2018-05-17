"use strict";

var _electronDevtoolsInstaller;

function _load_electronDevtoolsInstaller() {
    return _electronDevtoolsInstaller = _interopRequireDefault(require("electron-devtools-installer"));
}

var _electronDevtoolsInstaller2;

function _load_electronDevtoolsInstaller2() {
    return _electronDevtoolsInstaller2 = require("electron-devtools-installer");
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// install vue-devtools
require("electron").app.on("ready", () => {
    (0, (_electronDevtoolsInstaller || _load_electronDevtoolsInstaller()).default)((_electronDevtoolsInstaller2 || _load_electronDevtoolsInstaller2()).VUEJS_DEVTOOLS).catch(error => {
        console.log("Unable to install `vue-devtools`: \n", error);
    });
});
//# sourceMappingURL=vue-main-dev-entry.js.map