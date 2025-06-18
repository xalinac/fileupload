import { IncomingMessage, ServerResponse } from "http";
import * as fs from "fs";
import * as path from "path";
import { loadMetadata, saveMetadata, UPLOAD_DIR } from "../utils/storage";

export function handleDownload(req: IncomingMessage, res: ServerResponse) {
  const id = req.url?.split("/").pop()?.split(".")[0];
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

export function deleteOldFiles() {
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  const meta = loadMetadata();
  let changed = false;

  for (const id in meta) {
    const entry = meta[id];
    const lastAccess = entry.lastAccess || entry.uploadedAt;
    const filepath = path.join(UPLOAD_DIR, id + "_" + entry.filename);

    if (now - lastAccess > THIRTY_DAYS_MS && fs.existsSync(filepath)) {
      try {
        fs.unlinkSync(filepath);
        console.log("Удалён:", filepath);
        delete meta[id];
        changed = true;
      } catch (err) {
        console.error("Ошибка удаления:", filepath);
      }
    }
  }

  if (changed) saveMetadata(meta);
}