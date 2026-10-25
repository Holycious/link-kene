# kene. — link-in-bio

Halaman tautan sederhana untuk **kene.studio**, dibangun dengan Next.js 16 + Tailwind CSS v4 + SQLite (`better-sqlite3`). Tiga tombol (Shopee, TikTok Shop, Chat Admin WhatsApp), setiap klik dicatat ke database.

## Sebelum deploy — ganti 2 link placeholder

Di `lib/db.ts`, data seed awal masih berisi **contoh**:
- `tiktokshop` → ganti `url` ke link toko TikTok Shop kamu yang asli
- `whatsapp` → ganti nomor `6281234567890` ke nomor WA admin kamu (format `62xxxxxxxxxx`, tanpa `+` atau `0` di depan)

Link Shopee sudah diisi sesuai yang kamu kirim. Edit file tersebut **sebelum** build pertama kali (karena data di-seed otomatis saat tabel masih kosong). Kalau sudah pernah jalan duluan, pakai `scripts/manage-links.mjs` (lihat di bawah) untuk update tanpa perlu rebuild.

## Jalankan secara lokal

```bash
npm install
npm run dev
```

Buka http://localhost:3000

## Build untuk production

```bash
npm run build
npm run start -- -p 3000
```

## Kelola link tanpa ngoding

```bash
node scripts/manage-links.mjs list
node scripts/manage-links.mjs update whatsapp url "https://wa.me/628xxxxxxxxxx"
node scripts/manage-links.mjs update tiktokshop url "https://www.tiktok.com/@akun-asli-kamu"
node scripts/manage-links.mjs toggle shopee        # nonaktifkan/aktifkan sementara
node scripts/manage-links.mjs order whatsapp 1      # pindah ke paling atas
```

Perubahan langsung tampil di web (halaman di-render per-request), tidak perlu rebuild/restart.

## Deploy ke VM kamu (ringkas)

1. **Push kode ke VM** (git clone / scp), lalu di VM:
   ```bash
   cd kene-link
   npm install
   npm run build
   ```
2. **Jalankan sebagai service** supaya tetap hidup setelah SSH ditutup — pakai PM2:
   ```bash
   npm install -g pm2
   pm2 start npm --name kene-link -- run start -- -p 3000
   pm2 save
   pm2 startup   # ikuti instruksi yang muncul biar auto-start saat VM reboot
   ```
3. **Arahkan DNS**: tambahkan A record `link.kene.studio` → IP VM kamu.
4. **Reverse proxy + HTTPS otomatis** — cara termudah pakai Caddy:
   ```bash
   sudo apt install -y caddy
   ```
   Isi `/etc/caddy/Caddyfile`:
   ```
   link.kene.studio {
       reverse_proxy localhost:3000
   }
   ```
   ```bash
   sudo systemctl reload caddy
   ```
   Caddy otomatis mengurus sertifikat SSL (HTTPS) untuk domain kamu.
5. Buka `https://link.kene.studio` — selesai.

### Alternatif: Docker

Kalau VM kamu lebih nyaman pakai Docker, beri tahu aku — bisa aku buatkan `Dockerfile` + `docker-compose.yml` (app + Caddy) sekalian.

## Struktur proyek

```
app/
  layout.tsx          # font & metadata
  page.tsx             # halaman utama (server component, baca link dari SQLite)
  globals.css          # token warna/tipografi + motif pattern latar
  api/click/route.ts   # endpoint pencatat klik
components/
  LinkButton.tsx       # tombol link + tracking klik
  Icons.tsx            # ikon minimal (Shopee, TikTok, WhatsApp)
  PatternDivider.tsx
lib/db.ts              # koneksi SQLite + seed data awal
scripts/manage-links.mjs  # CLI untuk edit link tanpa ngoding
data/kene.db            # dibuat otomatis saat pertama kali dijalankan (jangan di-commit)
```
