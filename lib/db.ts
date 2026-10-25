import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, "kene.db");

// Reuse a single connection across hot reloads in dev.
declare global {
  // eslint-disable-next-line no-var
  var __keneDb: Database.Database | undefined;
}

export const db = global.__keneDb ?? new Database(DB_PATH);
if (process.env.NODE_ENV !== "production") global.__keneDb = db;

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS links (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    subtitle TEXT,
    url TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'link',
    sort_order INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1,
    click_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS admins (
    username TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    username TEXT NOT NULL REFERENCES admins(username) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL
  );
`);

export type LinkRow = {
  id: string;
  label: string;
  subtitle: string | null;
  url: string;
  icon: string;
  sort_order: number;
  active: number;
  click_count: number;
};

// Seed default links on first run only.
const count = (db.prepare("SELECT COUNT(*) AS c FROM links").get() as { c: number }).c;
if (count === 0) {
  const insert = db.prepare(
    `INSERT INTO links (id, label, subtitle, url, icon, sort_order) VALUES (@id, @label, @subtitle, @url, @icon, @sort_order)`
  );
  const seed: Omit<LinkRow, "active" | "click_count">[] = [
    {
      id: "shopee",
      label: "Belanja di Shopee",
      subtitle: "Katalog lengkap & checkout cepat",
      url: "https://shopee.co.id/kene.homewear?categoryId=100017&entryPoint=ShopByPDP&itemId=52069297949",
      icon: "shopee",
      sort_order: 1,
    },
    {
      id: "tiktokshop",
      label: "Belanja di TikTok Shop",
      subtitle: "Promo & live sale",
      url: "https://www.tiktok.com/@kene.studio",
      icon: "tiktok",
      sort_order: 2,
    },
    {
      id: "whatsapp",
      label: "Chat Admin",
      subtitle: "Tanya stok, ukuran, & pemesanan custom",
      url: "https://wa.me/6281234567890",
      icon: "whatsapp",
      sort_order: 3,
    },
  ];
  const tx = db.transaction((rows: typeof seed) => rows.forEach((r) => insert.run(r)));
  tx(seed);
}

export function getActiveLinks(): LinkRow[] {
  return db
    .prepare(
      "SELECT * FROM links WHERE active = 1 ORDER BY sort_order ASC, created_at ASC"
    )
    .all() as LinkRow[];
}

export function incrementClick(id: string): boolean {
  const result = db
    .prepare("UPDATE links SET click_count = click_count + 1 WHERE id = ?")
    .run(id);
  return result.changes > 0;
}

// ── Admin CRUD ──
export type LinkInput = Omit<LinkRow, "click_count">;

export function getAllLinks(): LinkRow[] {
  return db.prepare("SELECT * FROM links ORDER BY sort_order ASC, created_at ASC").all() as LinkRow[];
}

export function createLink(l: LinkInput) {
  db.prepare(
    `INSERT INTO links (id, label, subtitle, url, icon, sort_order, active)
     VALUES (@id, @label, @subtitle, @url, @icon, @sort_order, @active)`
  ).run(l);
}

export function updateLink(l: LinkInput) {
  db.prepare(
    `UPDATE links SET label=@label, subtitle=@subtitle, url=@url, icon=@icon,
     sort_order=@sort_order, active=@active WHERE id=@id`
  ).run(l);
}

export function deleteLink(id: string) {
  db.prepare("DELETE FROM links WHERE id = ?").run(id);
}
