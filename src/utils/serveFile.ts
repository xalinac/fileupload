import * as fs from "fs";
import { ServerResponse } from "http";

export function serveFile(filePath: string, contentType: string, res: ServerResponse, errorMsg: string) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end(errorMsg);
    }
    // Добавляем charset=utf-8, чтобы браузер правильно понял кодировку
    res.writeHead(200, { "Content-Type": contentType + "; charset=utf-8" });
    res.end(data);
  });
}