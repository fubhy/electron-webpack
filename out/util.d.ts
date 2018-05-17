/// <reference types="node" />
import BluebirdPromise from "bluebird-lst";
import { Stats } from "fs-extra-p";
export declare function statOrNull(file: string): Promise<Stats | null>;
export declare function orNullIfFileNotExist<T>(promise: Promise<T>): Promise<T | null>;
export declare function orIfFileNotExist<T>(promise: Promise<T>, fallbackValue: T): Promise<T>;
export declare function getFirstExistingFile(names: Array<string>, rootDir: string | null): Promise<string | null>;
export declare function getFreePort(defaultHost: string, defaultPort: number): BluebirdPromise<{}>;
