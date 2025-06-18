import { IncomingMessage, ServerResponse } from "http";
import * as fs from "fs";
import * as path from "path";

const ADMIN_HTML = path.resolve(process.cwd(), "views/admin.html");

export function serveAdmin(req: IncomingMessage, res: ServerResponse) {
  fs.readFile(ADMIN_HTML, (err, data) => {
    if (err) {
      res.writeHead(500);
      return res.end("Error");
    }
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(data);
  });
}
