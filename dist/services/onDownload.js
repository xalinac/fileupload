"use strict";
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
const promises_1 = require("fs/promises");
const paths_1 = require("../config/paths");
function updateLastAccess(fileName) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, promises_1.readFile)(paths_1.META_FILE, "utf8");
            const meta = JSON.parse(data);
            for (const id in meta) {
                if (meta[id].filename === fileName) {
                    meta[id].lastAccess = Date.now();
                    yield (0, promises_1.writeFile)(paths_1.META_FILE, JSON.stringify(meta, null, 2));
                    console.log(`Обновлён lastAccess для ${fileName}`);
                    break;
                }
            }
        }
        catch (err) {
            console.error("Ошибка при обновлении lastAccess:", err);
        }
    });
}
