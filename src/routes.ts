import { IncomingMessage, ServerResponse } from "http";
import { Route } from "./types";
import { serveFile } from "./utils/serveFile";
import { serveAdmin } from "./handlers/adminHandler";
import { handleUpload } from "./handlers/uploadHandler";
import { handleDownload } from "./handlers/downloadHandler";
import { handleLogin, handleLogout } from "./handlers/authHandler";
import { apiFilesList } from "./handlers/fileListHandler";
import * as path from "path";

const FRONTEND_DIR = path.join(__dirname, "../views");

export const routes: Route[] = [
  { method: "GET", path: "/", handler: serveIndex, auth: true },
  { method: "GET", path: "/index.html", handler: serveIndex, auth: true },
  { method: "GET", path: "/login", handler: serveLogin },
  { method: "POST", path: "/login", handler: handleLogin },
  { method: "GET", path: "/logout", handler: handleLogout },
  { method: "GET", path: "/style.css", handler: serveCss },
  { method: "POST", path: "/upload", handler: handleUpload, auth: true },
  { method: "GET", path: /^\/download\/[^/]+$/, handler: handleDownload, auth: true },
  { method: "GET", path: /^\/download-view\/[^/]+$/, handler: serveDownloadRedirect, auth: true },
  { method: "GET", path: "/admin", handler: serveAdmin, auth: true },
  { method: "GET", path: "/api/files", handler: apiFilesList, auth: true },
];

function serveIndex(req: IncomingMessage, res: ServerResponse) {
  serveFile(path.join(FRONTEND_DIR, "index.html"), "text/html", res, "Ошибка загрузки index.html");
}

function serveLogin(req: IncomingMessage, res: ServerResponse) {
  serveFile(path.join(FRONTEND_DIR, "login.html"), "text/html", res, "Ошибка загрузки login.html");
}

function serveCss(req: IncomingMessage, res: ServerResponse) {
  serveFile(path.join(FRONTEND_DIR, "style.css"), "text/css", res, "CSS не найден");
}

function serveDownloadRedirect(req: IncomingMessage, res: ServerResponse) {
  const id = req.url?.split("/").pop();
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