import { IncomingMessage, ServerResponse } from "http";
import * as fs from "fs";
import * as path from "path";
import { loadMetadata, saveMetadata, generateId, UPLOAD_DIR } from "../utils/storage";

export function handleUpload(req: IncomingMessage, res: ServerResponse) {
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
  const chunks: Buffer[] = [];
  req.on("data", chunk => chunks.push(chunk));

  req.on("end", () => {
    const buffer = Buffer.concat(chunks);
    const parts = buffer
      .toString("latin1")
      .split(boundary)
      .filter(p => p.trim() && p.trim() !== "--");

    for (const part of parts) {
      const filenameMatch = part.match(/filename="(.+?)"/);
      if (!filenameMatch) continue;

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
          lastAccess: Date.now()
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