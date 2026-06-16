#!/bin/bash
# =============================================================================
# MariaDB setup — ListOfDealDO
# =============================================================================

DB_NAME="ListOfDealDO2"
DB_USER="loduser"
DB_PASS="change_this_password"

# 1. Install
apt install -y mariadb-server

# 2. Enable and start
systemctl enable mariadb
systemctl start mariadb
systemctl status mariadb

# 3. Secure installation (interactive — follow the prompts)
echo ""
echo ">>> Running mysql_secure_installation. Follow the prompts, then press Enter when done."
mysql_secure_installation
read -r

# 4. Create database and user
mysql -u root << EOF
CREATE DATABASE IF NOT EXISTS ${DB_NAME};
CREATE USER IF NOT EXISTS '${DB_USER}'@'%' IDENTIFIED BY '${DB_PASS}';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'%';
FLUSH PRIVILEGES;
EXIT;
EOF

echo ">>> Database '${DB_NAME}' and user '${DB_USER}' created."

# 5. Allow remote connections (bind to all interfaces)
sed -i 's/^bind-address\s*=\s*127\.0\.0\.1/bind-address = 0.0.0.0/' \
    /etc/mysql/mariadb.conf.d/50-server.cnf

# 6. Restart to apply config change
systemctl restart mariadb

echo ""
echo "=== Done. MariaDB is listening on 0.0.0.0:3306 ==="
echo "=== DB: ${DB_NAME}  User: ${DB_USER}  Pass: ${DB_PASS} ==="
