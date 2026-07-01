# BudgetWeb — VDS Deployment

## Prerequisites

- A fresh Ubuntu/Debian VDS
- A GitHub account with access to this repo
- Azure AD app registration with a valid client secret

---

## Step 1 — Connect via SSH

```bash
ssh root@<YOUR_SERVER_IP>
```

---

## Step 2 — Generate SSH key and add it to GitHub

```bash
ssh-keygen -t ed25519 -C "budgetweb-deploy" -f ~/.ssh/id_ed25519 -N ""
cat ~/.ssh/id_ed25519.pub
```

Copy the output, then go to:  
**GitHub → Settings → SSH and GPG keys → New SSH key → paste & save**

Test the connection:

```bash
ssh -T git@github.com
# expected: "Hi <user>! You've successfully authenticated..."
```

---

## Step 3 — Run the app setup script

Set `SERVER_IP` and `REPO_SSH` at the top of `setup-budgetweb.sh`, then:

```bash
bash setup-budgetweb.sh
```

The script pauses after `pm2 startup` — copy-paste the command it prints, run it, then press Enter to continue.

---

## Step 4 — Run the MariaDB setup script (if needed)

Set `DB_PASS` at the top of `setup-mariadb.sh`, then:

```bash
bash setup-mariadb.sh
```

The script pauses for `mysql_secure_installation` — follow the prompts, then press Enter to continue.

---

## Step 5 — Edit .env

```bash
nano ~/BudgetWeb/.env
```

Fill in all empty values. `REDIRECT_URI` is pre-filled from `SERVER_IP`.

---

## Step 6 — Restart the app

```bash
pm2 restart budgetweb
pm2 logs budgetweb
```

---

## Local dev

./tostart.bat

## Docker (local, no auth)

Build the image and start the container:

```bash
docker compose build
docker compose up
```

Or without compose:

```bash
docker build -t budgetweb .
docker run -p 4000:3000 --env-file .env -e NODE_ENV=development budgetweb
```

App is served at:

http://localhost:4000/account/aggregatedList

`docker-compose.yml` sets `NODE_ENV=development` (Azure AD auth bypassed), `CANCREATEUSER=TRUE`, and `CANDELETEENTITIES=TRUE`. Other secrets (`MONGODB_URI`, `DX_LICENSE_KEY`, etc.) are loaded from the local `.env` via `env_file` — MongoDB stays on Atlas (cloud).

http://localhost:3000/account/aggregatedList

mongodump --uri="mongodb+srv://<username>:<password>@<your-cosmos-url>/<database>?ssl=true&retrywrites=false" --out=<backup-directory>

cd c:\Program Files\mongodb-database-tools\bin\
mongodump --uri="<you uri>" --out="c:\temp\real"

bsondump --bsonFile "c:\temp\real\budgetwebdb\orders.bson" --outFile="c:\temp\real\budgetwebdb\orders.json"

mongorestore "c:\temp\realbw2025-04-03" --uri="mongodb://localhost:27017"

ssh -A root@194.87.111.186
