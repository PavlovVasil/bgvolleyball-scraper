const cheerio = require('cheerio');
const axios = require('axios');
const mongoose = require('mongoose');
const RankingSchema = require('./schema/RankingSchema');
require('dotenv/config');

//convert a url for a given year to a set of Collections to be stored in MongoDB
const convertPageToTables = async (url) => {
    const pageResponse = await axios.get(url)
    const $ = cheerio.load(pageResponse.data);
    let tables = Array.from($('table'));
    tables = tables.filter(table => {
        let rows = $(table).find('tr');
        return rows.length > 2;
    });
}

(async () => {
    // mongoose.connect(
    //     process.env.DB_CONNECTION,
    //     { useNewUrlParser: true, useUnifiedTopology: true },
    //     () => {
    //         console.log('connected to DB');
    //     })
    try {
        const baseUrl = 'https://bgvolleyball.com';
        const response = await axios.get('https://bgvolleyball.com/result.php?group_id=1&season=1');
        //parsing the response with cheerio
        const $ = cheerio.load(response.data);
        //Getting years urls from the dropdown
        const yearsUrls = Array.from($('#season option')).map(option => {
            return `${baseUrl}/result.php?group_id=1&season=${$(option).attr('value')}`
        });

        convertPageToCollections('https://bgvolleyball.com/result.php?group_id=1&season=1');
        //const yearsUrls = 
    } catch (err) {
        console.log(err);
    }
})()