"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleDownload = handleDownload;
exports.deleteOldFiles = deleteOldFiles;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const storage_1 = require("../utils/storage");
function handleDownload(req, res) {
    var _a, _b;
    const id = (_b = (_a = req.url) === null || _a === void 0 ? void 0 : _a.split("/").pop()) === null || _b === void 0 ? void 0 : _b.split(".")[0];
    if (!id) {
        res.writeHead(400);
        return res.end("Invalid download link");
    }
    const meta = (0, storage_1.loadMetadata)();
    const entry = meta[id];
    if (!entry) {
        res.writeHead(404);
        return res.end("File not found");
    }
    const filepath = path.join(storage_1.UPLOAD_DIR, id + "_" + entry.filename);
    if (!fs.existsSync(filepath)) {
        res.writeHead(404);
        return res.end("File missing");
    }
    entry.lastAccess = Date.now();
    (0, storage_1.saveMetadata)(meta);
    res.writeHead(200, {
        "Content-Disposition": `attachment; filename="${entry.filename}"`,
        "Content-Type": "application/octet-stream"
    });
    fs.createReadStream(filepath).pipe(res);
}
function deleteOldFiles() {
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const meta = (0, storage_1.loadMetadata)();
    let changed = false;
    for (const id in meta) {
        const entry = meta[id];
        const lastAccess = entry.lastAccess || entry.uploadedAt;
        const filepath = path.join(storage_1.UPLOAD_DIR, id + "_" + entry.filename);
        if (now - lastAccess > THIRTY_DAYS_MS && fs.existsSync(filepath)) {
            try {
                fs.unlinkSync(filepath);
                console.log("Удалён:", filepath);
                delete meta[id];
                changed = true;
            }
            catch (err) {
                console.error("Ошибка удаления:", filepath);
            }
        }
    }
    if (changed)
        (0, storage_1.saveMetadata)(meta);
}
