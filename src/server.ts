import { createServer, IncomingMessage, ServerResponse } from "http";
import { routes } from "./routes";
import { parseCookies } from "./utils/parseCookies";
import { FileCleaner } from "./services/FileCleaner";

const HOST = "localhost";
const PORT = 3000;

const server = createServer(async (req, res) => {
  try {
    const url = parseUrl(req);
    const cookies = parseCookies(req.headers.cookie);
    const isAuthenticated = cookies.auth === "secret-token";

    const route = matchRoute(req.method, url.pathname);

    if (!route) {
      return sendNotFound(res);
    }

    if (route.auth && !isAuthenticated) {
      return redirectToLogin(req, res);
    }

    route.handler(req, res);
  } catch (err) {
    console.error("Ошибка на сервере:", err);
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Внутренняя ошибка сервера");
  }
});

server.listen(PORT, () => {
  console.log(`Server is running at http://${HOST}:${PORT}`);
  FileCleaner.start(); // запуск чистки после старта сервера
});


// =================
// Вспомогательные функции
// =================

function parseUrl(req: IncomingMessage): URL {
  const host = req.headers.host || "localhost";
  return new URL(req.url || "/", `http://${host}`);
}

function matchRoute(method?: string, path?: string) {
  return routes.find(route =>
    route.method === method &&
    (typeof route.path === "string" ? route.path === path : route.path.test(path || ""))
  );
}

function sendNotFound(res: ServerResponse) {
  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Файл не найден");
}

function redirectToLogin(req: IncomingMessage, res: ServerResponse) {
  const redirectUrl = encodeURIComponent(req.url || "/");
  res.writeHead(302, { Location: `/login?redirect=${redirectUrl}` });
  res.end();
}