export function parseCookies(cookieHeader?: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  for (const cookie of cookieHeader.split(";")) {
    const [name, ...val] = cookie.trim().split("=");
    cookies[name] = val.join("=");
  }
  return cookies;
}