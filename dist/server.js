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
const http_1 = require("http");
const routes_1 = require("./routes");
const parseCookies_1 = require("./utils/parseCookies");
const FileCleaner_1 = require("./services/FileCleaner");
const HOST = "localhost";
const PORT = 3000;
const server = (0, http_1.createServer)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const url = parseUrl(req);
        const cookies = (0, parseCookies_1.parseCookies)(req.headers.cookie);
        const isAuthenticated = cookies.auth === "secret-token";
        const route = matchRoute(req.method, url.pathname);
        if (!route) {
            return sendNotFound(res);
        }
        if (route.auth && !isAuthenticated) {
            return redirectToLogin(req, res);
        }
        route.handler(req, res);
    }
    catch (err) {
        console.error("Ошибка на сервере:", err);
        res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Внутренняя ошибка сервера");
    }
}));
server.listen(PORT, () => {
    console.log(`Server is running at http://${HOST}:${PORT}`);
    FileCleaner_1.FileCleaner.start(); // запуск чистки после старта сервера
});
// =================
// Вспомогательные функции
// =================
function parseUrl(req) {
    const host = req.headers.host || "localhost";
    return new URL(req.url || "/", `http://${host}`);
}
function matchRoute(method, path) {
    return routes_1.routes.find(route => route.method === method &&
        (typeof route.path === "string" ? route.path === path : route.path.test(path || "")));
}
function sendNotFound(res) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Файл не найден");
}
function redirectToLogin(req, res) {
    const redirectUrl = encodeURIComponent(req.url || "/");
    res.writeHead(302, { Location: `/login?redirect=${redirectUrl}` });
    res.end();
}
