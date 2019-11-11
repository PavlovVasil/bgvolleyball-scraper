const cheerio = require('cheerio');
const axios = require('axios');
const mongoose = require('mongoose');
const RankingSchema = require('./schema/RankingSchema');
require('dotenv/config');

(async () => {
    // mongoose.connect(
    //     process.env.DB_CONNECTION,
    //     { useNewUrlParser: true, useUnifiedTopology: true },
    //     () => {
    //         console.log('connected to DB');
    //     })
    try {
        const response = await axios.get('https://bgvolleyball.com/result.php?group_id=1&season=12&champ=%');
        //parsing the response with cheerio
        const $ = cheerio.load(response.data);
    } catch (err) {
        console.log(err);
    }
})()