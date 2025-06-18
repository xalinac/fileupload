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
exports.handleDownload = handleDownload;
exports.deleteOldFiles = deleteOldFiles;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// === Константы ===
const UPLOAD_DIR = path.join(__dirname, "../uploads");
const META_FILE = path.join(__dirname, "../data/meta.json");
const DOWNLOADS_LOG = path.join(__dirname, "../data/downloads.json");
if (!fs.existsSync(UPLOAD_DIR))
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(path.dirname(META_FILE)))
    fs.mkdirSync(path.dirname(META_FILE), { recursive: true });
// === Метаданные ===
function loadMetadata() {
    if (!fs.existsSync(META_FILE))
        return {};
    try {
        return JSON.parse(fs.readFileSync(META_FILE, "utf8"));
    }
    catch (_a) {
        return {};
    }
}
function saveMetadata(meta) {
    fs.writeFileSync(META_FILE, JSON.stringify(meta, null, 2));
}
// === Генерация ID ===
function generateId() {
    return Math.floor(Date.now() + Math.random() * 1e5).toString(36);
}
// === Загрузка ===
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
            const id = generateId();
            const savedPath = path.join(UPLOAD_DIR, id + "_" + filename);
            fs.writeFile(savedPath, fileBuffer, err => {
                if (err) {
                    res.writeHead(500, { "Content-Type": "application/json" });
                    return res.end(JSON.stringify({ error: "Ошибка при сохранении файла" }));
                }
                const meta = loadMetadata();
                meta[id] = {
                    id,
                    filename,
                    uploadedAt: Date.now(),
                    lastAccess: 0
                };
                saveMetadata(meta);
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
// === Скачивание ===
function handleDownload(req, res) {
    var _a, _b;
    const id = (_b = (_a = req.url) === null || _a === void 0 ? void 0 : _a.split("/").pop()) === null || _b === void 0 ? void 0 : _b.split(".")[0];
    if (!id) {
        res.writeHead(400);
        return res.end("Invalid download link");
    }
    const meta = loadMetadata();
    const entry = meta[id];
    if (!entry) {
        res.writeHead(404);
        return res.end("File not found");
    }
    const filepath = path.join(UPLOAD_DIR, id + "_" + entry.filename);
    if (!fs.existsSync(filepath)) {
        res.writeHead(404);
        return res.end("File missing");
    }
    entry.lastAccess = Date.now();
    saveMetadata(meta);
    res.writeHead(200, {
        "Content-Disposition": `attachment; filename="${entry.filename}"`,
        "Content-Type": "application/octet-stream"
    });
    fs.createReadStream(filepath).pipe(res);
}
// === Удаление старых ===
function deleteOldFiles() {
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const meta = loadMetadata();
    let changed = false;
    for (const id in meta) {
        const entry = meta[id];
        const lastAccess = entry.lastAccess || entry.uploadedAt;
        if (now - lastAccess > THIRTY_DAYS_MS) {
            const filepath = path.join(UPLOAD_DIR, id + "_" + entry.filename);
            if (fs.existsSync(filepath)) {
                try {
                    fs.unlinkSync(filepath);
                    console.log("Удалён:", filepath);
                }
                catch (err) {
                    console.error("Ошибка удаления:", filepath);
                    continue;
                }
            }
            delete meta[id];
            changed = true;
        }
    }
    if (changed)
        saveMetadata(meta);
}
