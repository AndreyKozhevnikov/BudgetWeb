#!/bin/bash
# See README.md for full deployment steps.

SERVER_IP="157.230.222.22"
REPO_SSH="https://github.com/AndreyKozhevnikov/BudgetWeb.git"
APP_DIR=~/BudgetWeb

# 1. Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. PM2 + nginx + certbot
sudo npm install -g pm2
sudo apt-get install -y nginx certbot python3-certbot-nginx

# 3. Clone repo and install dependencies
git clone "$REPO_SSH" "$APP_DIR"
cd "$APP_DIR"
npm install

# 4. .env
cp "$APP_DIR/.env.example" "$APP_DIR/.env"

# 5. Start app
cd "$APP_DIR"
pm2 start ecosystem.config.js
pm2 save
echo ""
echo ">>> Run the command that pm2 startup prints below, then press Enter."
pm2 startup
read -r

# 6. SSL cert
sudo certbot --nginx -d "${SERVER_IP}.sslip.io"

# 7. nginx reverse proxy
sudo tee /etc/nginx/sites-available/budgetweb > /dev/null << EOF
server {
    listen 443 ssl;
    server_name ${SERVER_IP}.sslip.io;

    ssl_certificate     /etc/letsencrypt/live/${SERVER_IP}.sslip.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${SERVER_IP}.sslip.io/privkey.pem;

    location / {
        proxy_pass         http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade \$http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}

server {
    listen 80;
    server_name ${SERVER_IP}.sslip.io;
    return 301 https://\$host\$request_uri;
}
EOF

sudo ln -sf /etc/nginx/sites-available/budgetweb /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

echo ""
echo "=== Done. Update the .env file: nano $APP_DIR/.env ==="
echo "=== Then restart: pm2 restart budgetweb ==="
