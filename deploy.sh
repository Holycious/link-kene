#!/usr/bin/env bash
# Deploy kene-link ke VM lewat `ssh kene-web`.
# Pemakaian: ./deploy.sh        (deploy / update)
# Override: HOST=kene-web APP_DIR=/opt/kene-link DOMAIN=link.kene.studio PORT=3000 ./deploy.sh
set -euo pipefail
cd "$(dirname "$0")"

HOST="${HOST:-kene-web}"
APP_DIR="${APP_DIR:-/opt/kene-link}"
DOMAIN="${DOMAIN:-link.kene.studio}"
PORT="${PORT:-3000}"

echo "==> Sinkronisasi kode ke $HOST:$APP_DIR"
ssh "$HOST" "sudo mkdir -p '$APP_DIR' && sudo chown -R \$USER '$APP_DIR'"
# data/ (SQLite) tidak ikut dikirim & tidak dihapus agar data produksi aman
rsync -az --delete \
  --exclude node_modules --exclude .next --exclude .git \
  --exclude data --exclude '.env*' \
  ./ "$HOST:$APP_DIR/"

echo "==> Setup & build di server"
ssh "$HOST" bash -s -- "$APP_DIR" "$DOMAIN" "$PORT" <<'REMOTE'
set -euo pipefail
APP_DIR=$1; DOMAIN=$2; PORT=$3

# Node.js 22 (+ toolchain untuk build better-sqlite3)
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 20 ]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi
sudo apt-get install -y build-essential python3 >/dev/null

command -v pm2 >/dev/null || sudo npm i -g pm2

# Caddy (HTTPS otomatis)
if ! command -v caddy >/dev/null; then
  sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl gpg
  curl -1sLf https://dl.cloudsmith.io/public/caddy/stable/gpg.key | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt | sudo tee /etc/apt/sources.list.d/caddy-stable.list >/dev/null
  sudo apt-get update && sudo apt-get install -y caddy
fi

cd "$APP_DIR"
mkdir -p data
npm ci
npm run build

pm2 startOrReload ecosystem.config.cjs 2>/dev/null || \
  pm2 start npm --name kene-link -- run start -- -p "$PORT"
pm2 save
sudo env PATH="$PATH" pm2 startup systemd -u "$USER" --hp "$HOME" >/dev/null || true

printf '%s {\n  reverse_proxy localhost:%s\n}\n' "$DOMAIN" "$PORT" | sudo tee /etc/caddy/Caddyfile >/dev/null
sudo systemctl enable --now caddy
sudo systemctl reload caddy

pm2 status kene-link
REMOTE

echo "==> Selesai. Pastikan A record $DOMAIN mengarah ke IP VM (port 80/443 terbuka)."
