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
    debugger
    const $ = cheerio.load(data);
    const tables = Array.from($('table')).filter(table => $(table).find('tr').length > 2);
    convertTableToSubcollectionObj($, tables[19]);
}

//Convert a table to a subcollection object, containing the subcollection name and documents to be written in MongoDB
const convertTableToSubcollectionObj = ($, table) => {
    //Checking if this is a ranking table
    const isRankingTable = $(table).find('tr th').attr('colspan') === "10";
    //Adding a conditional postfix to the Subcollection name, denoting if this is a ranking Subcollection
    const subcollectionName = `${$(table).find('tr th').text()}${isRankingTable ? ' - Класиране' : ''}`;
    //logic for ranking table: 
    const rows = $(table).find('tr');
    debugger

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
        const yearsCollectionObjects = Array.from($('#season option')).map(option => (
            {
                url: `${baseUrl}/result.php?group_id=1&season=${$(option).attr('value')}`,
                collectionName: $(option).text()
            }
        ));
        convertPageToTables('https://bgvolleyball.com/result.php?group_id=1&season=1');
    } catch (err) {
        console.log(err);
    }
})()