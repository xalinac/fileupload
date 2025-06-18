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
exports.handleUpload = handleUpload;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const storage_1 = require("../utils/storage");
function handleUpload(req, res) {
    const contentType = req.headers["content-type"] || "";
    if (!contentType.startsWith("multipart/form-data")) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Expected multipart/form-data" }));
    }
    const boundaryMatch = contentType.match(/boundary=(.+)$/);
    if (!boundaryMatch) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Boundary not found" }));
    }
    const boundary = "--" + boundaryMatch[1];
    const chunks = [];
    req.on("data", chunk => chunks.push(chunk));
    req.on("end", () => {
        const buffer = Buffer.concat(chunks);
        const parts = buffer
            .toString("latin1")
            .split(boundary)
            .filter(p => p.trim() && p.trim() !== "--");
        for (const part of parts) {
            const filenameMatch = part.match(/filename="(.+?)"/);
            if (!filenameMatch)
                continue;
            const filename = path.basename(filenameMatch[1]);
            const splitIndex = part.indexOf("\r\n\r\n");
            const fileContent = part.substring(splitIndex + 4, part.length - 2);
            const fileBuffer = Buffer.from(fileContent, "latin1");
            const id = (0, storage_1.generateId)();
            const savedPath = path.join(storage_1.UPLOAD_DIR, id + "_" + filename);
            fs.writeFile(savedPath, fileBuffer, err => {
                if (err) {
                    res.writeHead(500, { "Content-Type": "application/json" });
                    return res.end(JSON.stringify({ error: "Ошибка при сохранении файла" }));
                }
                const meta = (0, storage_1.loadMetadata)();
                meta[id] = {
                    id,
                    filename,
                    uploadedAt: Date.now(),
                    lastAccess: Date.now()
                };
                (0, storage_1.saveMetadata)(meta);
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({
                    message: "Файл успешно загружен",
                    id,
                    downloadUrl: `/download/${id}`
                }));
            });
            return;
        }
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Файл не найден в multipart" }));
    });
}
