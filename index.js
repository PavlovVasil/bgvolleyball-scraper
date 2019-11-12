const cheerio = require('cheerio');
const axios = require('axios');
const mongoose = require('mongoose');
const RankingSchema = require('./schema/RankingSchema');
const Iconv = require('iconv').Iconv;
const Buffer = require('buffer').Buffer;
require('dotenv/config');


//convert a url for a given year to a set of Collections to be stored in MongoDB
const convertPageToTables = async (url) => {
    // axios.interceptors.response.use(response => {
    //     let ctype = response.headers["content-type"];
    //     if (ctype.includes("charset=windows-1251")) {
    //         response.data = iconv.decode(response.data, 'windows-1251');
    //     }
    //     return response;
    // })


    const pageResponse = await axios.get(url)
    const $ = cheerio.load(pageResponse.data);
    let tables = Array.from($('table'));
    tables = tables.filter(table => {
        let rows = $(table).find('tr');
        return rows.length > 2;
    });
    convertTableToCollectionObj($, tables[1]);
}

//convert a table to a collection object, containing the collection name and documents to be written in MongoDB
const convertTableToCollectionObj = ($, table) => {
    let iconv = new Iconv('windows-1251', 'UTF-8');
    const isRankingTable = $(table).find('tr th').attr('colspan') === "10";
    const temp = new Buffer($(table).find('tr th').text(), 'binary');
    const conv = new iconv.Iconv('windows-1251', 'UTF-8');
    const result = conv.convert(temp).toString();
    s
    //const collectionName = iconv.convert($(table).find('tr th').text()).toString();
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
        //parsing the response with cheerio
        const $ = cheerio.load(response.data);
        //Getting years urls from the dropdown
        const yearsUrls = Array.from($('#season option')).map(option => {
            return `${baseUrl}/result.php?group_id=1&season=${$(option).attr('value')}`
        });

        convertPageToTables('https://bgvolleyball.com/result.php?group_id=1&season=1');
        //const yearsUrls = 
    } catch (err) {
        console.log(err);
    }
})()