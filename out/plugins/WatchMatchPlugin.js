"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
class WatchFilterPlugin {
    constructor(filter, debug) {
        this.filter = filter;
        this.debug = debug;
    }
    apply(compiler) {
        compiler.plugin("after-environment", () => {
            compiler.watchFileSystem = new IgnoringWatchFileSystem(compiler.watchFileSystem, this.filter, this.debug);
        });
    }
}
exports.WatchFilterPlugin = WatchFilterPlugin;
class IgnoringWatchFileSystem {
    constructor(wfs, filter, debug) {
        this.wfs = wfs;
        this.filter = filter;
        this.debug = debug;
    }
    watch(files, dirs, missing, startTime, options, callback, callbackUndelayed) {
        const includedFiles = [];
        const includedDirs = [];
        const excludedFiles = [];
        const excludedDirs = [];
        separate(this.filter, files, includedFiles, excludedFiles);
        separate(this.filter, dirs, includedDirs, excludedDirs);
        if (this.debug.enabled) {
            this.debug(`files:${stringifyList(files)}\ndirs:${stringifyList(dirs)}\nmissing:${stringifyList(missing)}`);
            this.debug(`includedFiles:${stringifyList(includedFiles)}\nincludedDirs:${stringifyList(includedDirs)}\nexcludedFiles:${stringifyList(excludedFiles)}\nexcludedDirs:${stringifyList(excludedDirs)}`);
        }
        return this.wfs.watch(includedFiles, includedDirs, missing, startTime, options, (error, filesModified, dirsModified, missingModified, fileTimestamps, dirTimestamps) => {
            if (error != null) {
                callback(error);
                return;
            }
            for (const p of excludedFiles) {
                fileTimestamps[p] = 1;
            }
            for (const p of excludedDirs) {
                dirTimestamps[p] = 1;
            }
            callback(null, filesModified, dirsModified, missingModified, fileTimestamps, dirTimestamps);
        }, callbackUndelayed);
    }
}
function separate(filter, list, included, excluded) {
    for (const file of list) {
        (filter(file) ? included : excluded).push(file);
    }
}
function stringifyList(list) {
    return `\n  ${list.map(it => it.startsWith(process.cwd()) ? it.substring(process.cwd().length + 1) : it).join(",\n  ")}`;
}
//# sourceMappingURL=WatchMatchPlugin.js.map