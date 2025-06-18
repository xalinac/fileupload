"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleLogin = handleLogin;
exports.handleLogout = handleLogout;
function handleLogin(req, res) {
    let body = "";
    req.on("data", chunk => (body += chunk.toString()));
    req.on("end", () => {
        const params = new URLSearchParams(body);
        const username = params.get("username");
        const password = params.get("password");
        if (username === "user" && password === "1234") {
            res.writeHead(200, {
                "Content-Type": "application/json",
                "Set-Cookie": "auth=secret-token; HttpOnly; Path=/; Max-Age=100",
            });
            res.end(JSON.stringify({ success: true }));
        }
        else {
            res.writeHead(401, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Неверный логин или пароль" }));
        }
    });
}
function handleLogout(req, res) {
    res.writeHead(302, {
        "Set-Cookie": "auth=; HttpOnly; Path=/; Max-Age=0",
        Location: "/login",
    });
    res.end();
}
