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

import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, "..", "data", "kene.db"));

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
  default:
    console.log(
      "Perintah: list | update <id> <url|label|subtitle> <value> | toggle <id> | order <id> <n>"
    );
}
