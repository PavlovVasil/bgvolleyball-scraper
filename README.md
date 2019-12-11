# bgvolleyball-scraper

Gets all the data from [this](https://bgvolleyball.com/result.php?group_id=1&season=12) vollayball ranking website and stores all the scraped data in MongoDB. Each year contains two types of tables - tournament and ranking. The ranking tables are optional and are being stored as a field in the corresponding tournament collection in MongoDB.
## How to run the scraper
In the root directory: 
1. Add a .env file containing ```DB_CONNECTION=your-MongoDB-connection-string```
2. Open the terminal in the root directory, then use this:  
  ```npm run scraper```