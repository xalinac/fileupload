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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileCleaner = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const UPLOAD_DIR = path.resolve(__dirname, "../../uploads");
const META_PATH = path.resolve(__dirname, "../../data/meta.json");
// Для теста 5 секунд, в бою - 30 дней (30 * 24 * 60 * 60 * 1000)
const MAX_FILE_AGE = 5000;
class FileCleaner {
    static cleanOldFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            const now = Date.now();
            let meta;
            try {
                const data = yield fs.readFile(META_PATH, "utf8");
                meta = JSON.parse(data);
            }
            catch (e) {
                console.error("Ошибка чтения/парсинга мета-файла:", e);
                return;
            }
            let changed = false;
            // Читаем файлы из папки uploads
            let files;
            try {
                files = yield fs.readdir(UPLOAD_DIR);
            }
            catch (e) {
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
                        yield fs.unlink(filePath);
                        console.log(`Удалён файл без мета-записи: ${file}`);
                    }
                    catch (e) {
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
                            yield fs.unlink(filePath);
                            console.log(`Удалён старый файл: ${matchingFile}`);
                        }
                        catch (e) {
                            console.error(`Ошибка удаления файла ${matchingFile}:`, e);
                            continue; // пропускаем удаление мета, если не удалось удалить файл
                        }
                        delete meta[id];
                        changed = true;
                        console.log(`Удалена запись из мета (файл удалён): ${fileMeta.filename}`);
                    }
                }
                else {
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
                    yield fs.writeFile(META_PATH, JSON.stringify(meta, null, 2), "utf8");
                    console.log("Мета-файл обновлён после очистки.");
                }
                catch (e) {
                    console.error("Ошибка записи мета-файла:", e);
                }
            }
        });
    }
    //60 * 60 * 1000
    static start(interval = 1000) {
        this.cleanOldFiles();
        setInterval(() => this.cleanOldFiles(), interval);
    }
}
exports.FileCleaner = FileCleaner;
