const cheerio = require('cheerio');
const axios = require('axios');
const mongoose = require('mongoose');
const RankingSchema = require('./schema/RankingSchema');
const iconv = require('iconv-lite');
require('dotenv/config');


//Convert a url for a given year to a set of Collections to be stored in MongoDB
const convertPageToTables = async (url) => {
    const pageResponse = await axios.get(url, { responseType: 'arraybuffer' });
    //We have to convert the encoding of the response from windows-1251 to UTF-8
    let data = iconv.decode(pageResponse.data, 'windows-1251');
    const $ = cheerio.load(data);
    let tables = Array.from($('table'));
    tables = tables.filter(table => {
        let rows = $(table).find('tr');
        return rows.length > 2;
    });
    convertTableToCollectionObj($, tables[19]);
}

//Convert a table to a subcollection object, containing the subcollection name and documents to be written in MongoDB
const convertTableToCollectionObj = ($, table) => {
    //Checking if this is a ranking table
    const isRankingTable = $(table).find('tr th').attr('colspan') === "10";
    //Adding a conditional postfix to the Subcollection name, denoting if this is a ranking Subcollection
    const collectionName = `${$(table).find('tr th').text()}${isRankingTable ? ' - Класиране' : ''}`;
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
        //Parsing the response with cheerio
        const $ = cheerio.load(response.data);
        //Getting the year urls and the Collection names from the HTML <option> elements
        const yearsUrls = Array.from($('#season option')).map(option => (
            {
                url: `${baseUrl}/result.php?group_id=1&season=${$(option).attr('value')}`,
                collectionName: $(option).text()
            }
        ));

        debugger
        convertPageToTables('https://bgvolleyball.com/result.php?group_id=1&season=1');
    } catch (err) {
        console.log(err);
    }
})()