# bgvolleyball-scraper

Gets all the data from [this](https://bgvolleyball.com/result.php?group_id=1&season=12) vollayball ranking website and stores all the scraped data in MongoDB. Each year's rankings are stored as a collection in MongoDB, and the tables on the corresponding page are stored as subcollections.

## How to run the scraper
In the root directory: 
1. Add a .env file containing ```DB_CONNECTION=your-MongoDB-connection-string```
2. Open the terminal in the root directory, then use this:  
  ```npm run scraper```