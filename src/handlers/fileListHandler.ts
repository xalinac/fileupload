import { IncomingMessage, ServerResponse } from "http";
import * as fs from "fs";
import * as path from "path";

const META_PATH = path.join(__dirname, "../../data/meta.json");

export function apiFilesList(req: IncomingMessage, res: ServerResponse): void {
  fs.readFile(META_PATH, "utf8", (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Ошибка чтения мета-файла" }));
      return;
    }

    try {
      const meta = JSON.parse(data); // объект: id => {id, filename, uploadedAt, lastAccess}
      const filesArray = Object.values(meta); // превращаем в массив для удобства

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(filesArray));
    } catch {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Ошибка парсинга мета-файла" }));
    }
  });
}