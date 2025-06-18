import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

export const UPLOAD_DIR = path.join(__dirname, "../../uploads");
export const META_FILE = path.join(__dirname, "../../data/meta.json");

export interface FileMeta {
  id: string;
  filename: string;
  uploadedAt: number;
  lastAccess: number;
}

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(path.dirname(META_FILE))) fs.mkdirSync(path.dirname(META_FILE), { recursive: true });

export function loadMetadata(): Record<string, FileMeta> {
  if (!fs.existsSync(META_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(META_FILE, "utf8"));
  } catch {
    return {};
  }
}

export function saveMetadata(meta: Record<string, FileMeta>) {
  fs.writeFileSync(META_FILE, JSON.stringify(meta, null, 2));
}

export function generateId(length = 16): string {
  return crypto.randomBytes(length).toString("hex");
}