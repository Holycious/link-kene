# kene-link

Halaman link-in-bio untuk **kene.studio** (homedress premium), menampung tautan ke toko Shopee, TikTok Shop, dan chat WhatsApp admin dalam satu halaman. Dibuat untuk di-deploy sendiri di VM dengan subdomain `link.kene.studio`.

## Tech stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 |
| Database | SQLite via `better-sqlite3` |
| Bahasa | TypeScript |
| Runtime target | Node.js di VM sendiri (bukan serverless/edge) |

## Fitur

- Menampilkan daftar link aktif yang diambil dari database SQLite, diurutkan berdasarkan `sort_order`.
- Setiap klik pada link dicatat ke kolom `click_count` lewat endpoint API, tanpa menghalangi navigasi pengguna ke tujuan link.
- Link bisa diaktifkan/dinonaktifkan dan diubah urutannya tanpa mengubah kode.
- Halaman di-render per-request (`dynamic = "force-dynamic"`), jadi perubahan data link langsung tampil tanpa rebuild.

## Struktur proyek

```
app/
  layout.tsx            # metadata halaman & pemuatan font
  page.tsx               # halaman utama, server component yang membaca link dari DB
  globals.css             # stylesheet global
  api/click/route.ts      # endpoint POST untuk mencatat klik
components/
  LinkButton.tsx          # tombol link (client component) + pemanggilan API klik
  Icons.tsx                # komponen ikon
  PatternDivider.tsx       # elemen pembatas visual
lib/
  db.ts                    # koneksi SQLite, definisi tabel `links`, seed data awal, query helper
scripts/
  manage-links.mjs         # CLI untuk mengelola data link dari terminal
data/
  kene.db                  # file database, dibuat otomatis saat pertama kali dijalankan
```

## Skema database

Tabel `links`:

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | TEXT (primary key) | identitas unik link, mis. `shopee` |
| label | TEXT | teks utama yang ditampilkan |
| subtitle | TEXT (nullable) | teks kecil di bawah label |
| url | TEXT | tujuan link |
| icon | TEXT | kunci ikon yang dipakai (`shopee`, `tiktok`, `whatsapp`) |
| sort_order | INTEGER | urutan tampil, makin kecil makin atas |
| active | INTEGER (0/1) | menentukan apakah link ditampilkan |
| click_count | INTEGER | jumlah klik tercatat |
| created_at | TEXT | timestamp saat baris dibuat |

Database di-seed otomatis dengan 3 baris (shopee, tiktokshop, whatsapp) saat tabel masih kosong — lihat `lib/db.ts`.

## Setup & menjalankan secara lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

## Build & menjalankan production

```bash
npm run build
npm run start -- -p 3000
```

## Mengelola link lewat CLI

```bash
node scripts/manage-links.mjs list
node scripts/manage-links.mjs update <id> url "<url-baru>"
node scripts/manage-links.mjs update <id> label "<label-baru>"
node scripts/manage-links.mjs update <id> subtitle "<subtitle-baru>"
node scripts/manage-links.mjs toggle <id>
node scripts/manage-links.mjs order <id> <angka-urutan>
```

## Catatan sebelum deploy

Dua nilai di data seed (`lib/db.ts`) masih placeholder dan perlu diganti sebelum atau sesudah deploy (lewat CLI di atas):
- `tiktokshop.url` — ganti ke link toko TikTok Shop yang sebenarnya
- `whatsapp.url` — ganti ke nomor WhatsApp admin yang sebenarnya (format `https://wa.me/62xxxxxxxxxx`)

## Ringkasan langkah deploy ke VM

1. Clone/salin proyek ke VM, `npm install`, `npm run build`.
2. Jalankan sebagai service persisten (mis. PM2: `pm2 start npm --name kene-link -- run start -- -p 3000`).
3. Arahkan DNS: A record `link.kene.studio` → IP VM.
4. Pasang reverse proxy dengan HTTPS otomatis (mis. Caddy) yang meneruskan `link.kene.studio` ke `localhost:3000`.

Detail lengkap tiap langkah ada di `README.md`.
