"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCookies = parseCookies;
function parseCookies(cookieHeader) {
    const cookies = {};
    if (!cookieHeader)
        return cookies;
    for (const cookie of cookieHeader.split(";")) {
        const [name, ...val] = cookie.trim().split("=");
        cookies[name] = val.join("=");
    }
    return cookies;
}
