"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureStorageDir = ensureStorageDir;
exports.storagePath = storagePath;
exports.relativeStoragePath = relativeStoragePath;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const config_1 = require("./config");
async function ensureStorageDir() {
    await promises_1.default.mkdir(config_1.config.storageDir, { recursive: true });
    return config_1.config.storageDir;
}
function storagePath(fileName) {
    return path_1.default.join(config_1.config.storageDir, fileName);
}
function relativeStoragePath(filePath) {
    return path_1.default.relative(config_1.config.storageDir, filePath);
}
//# sourceMappingURL=files.js.map