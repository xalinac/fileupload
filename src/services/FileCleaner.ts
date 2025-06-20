import * as fs from "fs/promises";
import * as path from "path";

const UPLOAD_DIR = path.resolve(__dirname, "../../uploads");
const META_PATH = path.resolve(__dirname, "../../data/meta.json");
// Максимальный возраст файла 30 дней
const MAX_FILE_AGE = 30 * 24 * 60 * 60 * 1000;

interface FileMeta {
  id: string;
  filename: string;
  uploadedAt: number;
  lastAccess: number;
}

type Meta = Record<string, FileMeta>;

export class FileCleaner {
  static async cleanOldFiles() {
    const now = Date.now();

    let meta: Meta;
    try {
      const data = await fs.readFile(META_PATH, "utf8");
      meta = JSON.parse(data);
    } catch (e) {
      console.error("Ошибка чтения/парсинга мета-файла:", e);
      return;
    }

    let changed = false;

    // Читаем файлы из папки uploads
    let files: string[];
    try {
      files = await fs.readdir(UPLOAD_DIR);
    } catch (e) {
      console.error("Ошибка чтения папки uploads:", e);
      return;
    }

    // Создаем Set для удобной проверки существования файлов
    const filesSet = new Set(files);

    // Удаляем файлы без мета-записей (чистим "мусор")
    for (const file of files) {
      const hasMeta = Object.values(meta).some(fileMeta => file.endsWith(fileMeta.filename));
      if (!hasMeta) {
        const filePath = path.join(UPLOAD_DIR, file);
        try {
          await fs.unlink(filePath);
          console.log(`Удалён файл без мета-записи: ${file}`);
        } catch (e) {
          console.error(`Ошибка удаления файла без мета ${file}:`, e);
        }
      }
    }

    // Проходим по всем мета-записям
    for (const [id, fileMeta] of Object.entries(meta)) {
      // Ищем файл, который заканчивается на fileMeta.filename
      const matchingFile = files.find(f => f.endsWith(fileMeta.filename));

      if (matchingFile) {
        // Файл есть — проверяем возраст по lastAccess
        if (now - fileMeta.lastAccess > MAX_FILE_AGE) {
          // Удаляем файл и мета-запись
          const filePath = path.join(UPLOAD_DIR, matchingFile);
          try {
            await fs.unlink(filePath);
            console.log(`Удалён старый файл: ${matchingFile}`);
          } catch (e) {
            console.error(`Ошибка удаления файла ${matchingFile}:`, e);
            continue; // пропускаем удаление мета, если не удалось удалить файл
          }

          delete meta[id];
          changed = true;
          console.log(`Удалена запись из мета (файл удалён): ${fileMeta.filename}`);
        }
      } else {
        // Файла нет, проверяем возраст записи meta
        if (now - fileMeta.lastAccess > MAX_FILE_AGE) {
          delete meta[id];
          changed = true;
          console.log(`Удалена устаревшая мета-запись (файла нет): ${fileMeta.filename}`);
        }
      }
    }

    // Записываем обновленный мета-файл, если что-то изменилось
    if (changed) {
      try {
        await fs.writeFile(META_PATH, JSON.stringify(meta, null, 2), "utf8");
        console.log("Мета-файл обновлён после очистки.");
      } catch (e) {
        console.error("Ошибка записи мета-файла:", e);
      }
    }
  }

  //Очистка файлов каждый час
  static start(interval = 60 * 60 * 1000) {
    this.cleanOldFiles();
    setInterval(() => this.cleanOldFiles(), interval);
  }
}