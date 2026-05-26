./tostart.bat

## Docker (local, no auth)

docker compose build
docker compose up

http://localhost:4000/account/aggregatedList

Uses NODE_ENV=development (auth bypassed). Secrets loaded from .env; MongoDB stays on Atlas.

http://localhost:3000/account/aggregatedList

mongodump --uri="mongodb+srv://<username>:<password>@<your-cosmos-url>/<database>?ssl=true&retrywrites=false" --out=<backup-directory>

cd c:\Program Files\mongodb-database-tools\bin\
mongodump --uri="<you uri>" --out="c:\temp\real"

bsondump --bsonFile "c:\temp\real\budgetwebdb\orders.bson" --outFile="c:\temp\real\budgetwebdb\orders.json"

mongorestore "c:\temp\realbw2025-04-03" --uri="mongodb://localhost:27017"

ssh -A root@194.87.111.186
