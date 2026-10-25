#!/usr/bin/env node
// Small CLI to manage links without touching code.
//
// Usage:
//   node scripts/manage-links.mjs list
//   node scripts/manage-links.mjs update <id> url "<new-url>"
//   node scripts/manage-links.mjs update <id> label "<new-label>"
//   node scripts/manage-links.mjs update <id> subtitle "<new-subtitle>"
//   node scripts/manage-links.mjs toggle <id>        # enable/disable a link
//   node scripts/manage-links.mjs order <id> <n>     # set sort order (lower = higher up)
//   node scripts/manage-links.mjs add-admin <username> [password]   # buat/reset admin (password ditanya jika kosong)
//   node scripts/manage-links.mjs remove-admin <username>
//   node scripts/manage-links.mjs list-admins

import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { randomBytes, scryptSync } from "crypto";
import { createInterface } from "readline/promises";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
fs.mkdirSync(dataDir, { recursive: true });
const db = new Database(path.join(dataDir, "kene.db"));
db.exec(`
  CREATE TABLE IF NOT EXISTS admins (username TEXT PRIMARY KEY, password_hash TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    username TEXT NOT NULL REFERENCES admins(username) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL
  );
`);

const [, , cmd, ...args] = process.argv;

const ALLOWED_FIELDS = new Set(["url", "label", "subtitle"]);

function list() {
  const rows = db
    .prepare("SELECT id, label, url, active, click_count, sort_order FROM links ORDER BY sort_order")
    .all();
  console.table(rows);
}

function update(id, field, value) {
  if (!ALLOWED_FIELDS.has(field)) {
    console.error(`Field tidak dikenal: ${field}. Gunakan salah satu dari: ${[...ALLOWED_FIELDS].join(", ")}`);
    process.exit(1);
  }
  const result = db.prepare(`UPDATE links SET ${field} = ? WHERE id = ?`).run(value, id);
  console.log(result.changes ? `OK: ${id}.${field} diperbarui.` : `Link dengan id "${id}" tidak ditemukan.`);
}

function toggle(id) {
  const row = db.prepare("SELECT active FROM links WHERE id = ?").get(id);
  if (!row) return console.error(`Link dengan id "${id}" tidak ditemukan.`);
  db.prepare("UPDATE links SET active = ? WHERE id = ?").run(row.active ? 0 : 1, id);
  console.log(`OK: ${id} sekarang ${row.active ? "nonaktif" : "aktif"}.`);
}

function order(id, n) {
  db.prepare("UPDATE links SET sort_order = ? WHERE id = ?").run(Number(n), id);
  console.log(`OK: urutan ${id} diubah ke ${n}.`);
}

async function addAdmin(username, password) {
  if (!username) return console.error("Pemakaian: add-admin <username> [password]");
  if (!password) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    password = await rl.question("Password: ");
    rl.close();
  }
  if (password.length < 8) return console.error("Password minimal 8 karakter.");
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  db.prepare(
    "INSERT INTO admins (username, password_hash) VALUES (?, ?) ON CONFLICT(username) DO UPDATE SET password_hash = excluded.password_hash"
  ).run(username, `${salt}:${hash}`);
  db.prepare("DELETE FROM sessions WHERE username = ?").run(username);
  console.log(`OK: admin "${username}" disimpan.`);
}

switch (cmd) {
  case "list":
    list();
    break;
  case "update":
    update(args[0], args[1], args[2]);
    break;
  case "toggle":
    toggle(args[0]);
    break;
  case "order":
    order(args[0], args[1]);
    break;
  case "add-admin":
    await addAdmin(args[0], args[1]);
    break;
  case "remove-admin":
    db.prepare("DELETE FROM sessions WHERE username = ?").run(args[0]);
    console.log(db.prepare("DELETE FROM admins WHERE username = ?").run(args[0]).changes ? "OK: admin dihapus." : "Admin tidak ditemukan.");
    break;
  case "list-admins":
    console.table(db.prepare("SELECT username FROM admins").all());
    break;
  default:
    console.log(
      "Perintah: list | update <id> <url|label|subtitle> <value> | toggle <id> | order <id> <n> | add-admin <user> [pass] | remove-admin <user> | list-admins"
    );
}
