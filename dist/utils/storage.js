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
exports.META_FILE = exports.UPLOAD_DIR = void 0;
exports.loadMetadata = loadMetadata;
exports.saveMetadata = saveMetadata;
exports.generateId = generateId;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
exports.UPLOAD_DIR = path.join(__dirname, "../../uploads");
exports.META_FILE = path.join(__dirname, "../../data/meta.json");
if (!fs.existsSync(exports.UPLOAD_DIR))
    fs.mkdirSync(exports.UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(path.dirname(exports.META_FILE)))
    fs.mkdirSync(path.dirname(exports.META_FILE), { recursive: true });
function loadMetadata() {
    if (!fs.existsSync(exports.META_FILE))
        return {};
    try {
        return JSON.parse(fs.readFileSync(exports.META_FILE, "utf8"));
    }
    catch (_a) {
        return {};
    }
}
function saveMetadata(meta) {
    fs.writeFileSync(exports.META_FILE, JSON.stringify(meta, null, 2));
}
function generateId(length = 16) {
    return crypto.randomBytes(length).toString("hex");
}
