import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "./db";

const COOKIE = "kene_admin";
const SESSION_DAYS = 7;

// Format: "<salt-hex>:<hash-hex>" — same format written by scripts/manage-links.mjs add-admin
export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const a = Buffer.from(hash, "hex");
  const b = scryptSync(password, salt, a.length);
  return timingSafeEqual(a, b);
}

export async function login(username: string, password: string): Promise<boolean> {
  const row = db.prepare("SELECT password_hash FROM admins WHERE username = ?").get(username) as
    | { password_hash: string }
    | undefined;
  if (!row || !verifyPassword(password, row.password_hash)) return false;

  const token = randomBytes(32).toString("hex");
  const expires = Date.now() + SESSION_DAYS * 864e5;
  db.prepare("DELETE FROM sessions WHERE expires_at < ?").run(Date.now());
  db.prepare("INSERT INTO sessions (token, username, expires_at) VALUES (?, ?, ?)").run(token, username, expires);

  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expires),
  });
  return true;
}

export async function logout() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
  store.delete(COOKIE);
}

export async function getAdmin(): Promise<string | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const row = db
    .prepare("SELECT username FROM sessions WHERE token = ? AND expires_at > ?")
    .get(token, Date.now()) as { username: string } | undefined;
  return row?.username ?? null;
}

export async function requireAdmin(): Promise<string> {
  const user = await getAdmin();
  if (!user) throw new Error("Unauthorized");
  return user;
}
