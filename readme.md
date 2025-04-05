./tostart.bat

http://localhost:3000/account/aggregatedList


mongodump --uri="mongodb+srv://<username>:<password>@<your-cosmos-url>/<database>?ssl=true&retrywrites=false" --out=<backup-directory>

mongodump --uri="<you uri>" --out="c:\temp\real"

bsondump --bsonFile "c:\temp\real\budgetwebdb\orders.bson" --outFile="c:\temp\real\budgetwebdb\orders.json"


mongorestore "c:\temp\realbw2025-04-03" --uri="mongodb://localhost:27017"