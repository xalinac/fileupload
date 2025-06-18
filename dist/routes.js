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
exports.routes = void 0;
const serveFile_1 = require("./utils/serveFile");
const adminHandler_1 = require("./handlers/adminHandler");
const uploadHandler_1 = require("./handlers/uploadHandler");
const downloadHandler_1 = require("./handlers/downloadHandler");
const authHandler_1 = require("./handlers/authHandler");
const fileListHandler_1 = require("./handlers/fileListHandler");
const path = __importStar(require("path"));
const FRONTEND_DIR = path.join(__dirname, "../views");
exports.routes = [
    { method: "GET", path: "/", handler: serveIndex, auth: true },
    { method: "GET", path: "/index.html", handler: serveIndex, auth: true },
    { method: "GET", path: "/login", handler: serveLogin },
    { method: "POST", path: "/login", handler: authHandler_1.handleLogin },
    { method: "GET", path: "/logout", handler: authHandler_1.handleLogout },
    { method: "GET", path: "/style.css", handler: serveCss },
    { method: "POST", path: "/upload", handler: uploadHandler_1.handleUpload, auth: true },
    { method: "GET", path: /^\/download\/[^/]+$/, handler: downloadHandler_1.handleDownload, auth: true },
    { method: "GET", path: /^\/download-view\/[^/]+$/, handler: serveDownloadRedirect, auth: true },
    { method: "GET", path: "/admin", handler: adminHandler_1.serveAdmin, auth: true },
    { method: "GET", path: "/api/files", handler: fileListHandler_1.apiFilesList, auth: true },
];
function serveIndex(req, res) {
    (0, serveFile_1.serveFile)(path.join(FRONTEND_DIR, "index.html"), "text/html", res, "Ошибка загрузки index.html");
}
function serveLogin(req, res) {
    (0, serveFile_1.serveFile)(path.join(FRONTEND_DIR, "login.html"), "text/html", res, "Ошибка загрузки login.html");
}
function serveCss(req, res) {
    (0, serveFile_1.serveFile)(path.join(FRONTEND_DIR, "style.css"), "text/css", res, "CSS не найден");
}
function serveDownloadRedirect(req, res) {
    var _a;
    const id = (_a = req.url) === null || _a === void 0 ? void 0 : _a.split("/").pop();
    if (!id) {
        res.writeHead(400);
        return res.end("Неверная ссылка");
    }
    const html = `
<html>
<head>
  <meta charset="utf-8" />
  <title>Downloading...</title>
  <script>
    setTimeout(() => { window.location.href = "/index.html"; }, 1000);
  </script>
</head>
<body>
  <p>Начинается загрузка...</p>
  <iframe src="/download/${id}" style="display:none;"></iframe>
</body>
</html>
`;
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
}
