const cheerio = require('cheerio');
const axios = require('axios');
const mongoose = require('mongoose');
const RankingSchema = require('./schema/RankingSchema');
const iconv = require('iconv-lite');
require('dotenv/config');


//Convert a url for a given year to a set of Collections to be stored in MongoDB
const convertPageToTables = async (url) => {
    const pageResponse = await axios.get(url, {
        responseType: 'arraybuffer'
    });
    //We have to convert the encoding of the response from windows-1251 to UTF-8
    let data = iconv.decode(pageResponse.data, 'windows-1251');
    const $ = cheerio.load(data);
    const tables = Array.from($('table')).filter(table => $(table).find('tr').length > 2);
    convertTableToSubcollectionObj($, tables[20]);
}

//Converts a ranking table to an array of documents (objects) to be written in MongoDB
const convertRankingTableToDocs = ($, table) => {
    //Get all but the first two rows, as they are the title and header
    const tableRows = Array.from($(table).find('tr')).slice(2);
    const documents = [];
    for (row of tableRows) {
        const rowNode = $(row).find('td');
        const rowObj = {};
        rowObj.ranking = parseInt(rowNode.eq(0).text(), 10);
        rowObj.team = rowNode.eq(1).text();
        rowObj.matches = parseInt(rowNode.eq(2).text(), 10);
        rowObj.wins = parseInt(rowNode.eq(3).text(), 10);
        rowObj.losses = parseInt(rowNode.eq(4).text(), 10);
        rowObj.games = rowNode.eq(5).text();
        rowObj.gameRatio = rowNode.eq(6).text();
        rowObj.score = rowNode.eq(7).text();
        rowObj.scoreRatio = rowNode.eq(8).text();
        rowObj.points = parseInt(rowNode.eq(9).text(), 10);
        documents.push(rowObj);
    }
    return documents;
}

//Converts a non-ranking table to an array of documents (objects) to be written in MongoDB
const convertTableToDocs = ($, table) => {
    const tableRows = Array.from($(table).find('tr')).slice(1);
    const documents = [];
    let currentChunk = {
        name: '',
        data: []
    };
    for (let i = 0; i < tableRows.length; i++) {
        //Getting the row cells
        let cells = Array.from($(tableRows[i]).find('td'))
        if (cells.length === 1) {
            //There is only one cell and it is actually the "title" for the current chunk
            currentChunk.documentName = $(cells).eq(0).text();
            debugger
        } else {
            cells.pop();
            let rowObj = {};
            rowObj.date = cells.eq(0).text();
            rowObj.time = cells.eq(1).text();
            rowObj.firstTeam = cells.eq(2).find('a').text();
            rowObj.secondTeam = cells.eq(3).find('a').text();
            rowObj.place = cells.eq(4).find('a').text();
            debugger
        }
        
    }
}

//Convert a table to a subcollection object, containing the subcollection name and documents to be written in MongoDB
const convertTableToSubcollectionObj = ($, table) => {
    //Checking if this is a ranking table
    const isRankingTable = $(table).find('tr th').attr('colspan') === "10";
    //Adding a conditional postfix to the Subcollection name, denoting if this is a ranking Subcollection
    const subcollectionName = `${$(table).find('tr th').text()}${isRankingTable ? ' - Класиране' : ''}`;
    return {
        subcollectionName: subcollectionName,
        documents: isRankingTable ? convertRankingTableToDocs($, table) : convertTableToDocs($, table)
    }
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
        const yearsCollectionObjects = Array.from($('#season option')).map(option => ({
            url: `${baseUrl}/result.php?group_id=1&season=${$(option).attr('value')}`,
            collectionName: $(option).text()
        }));
        convertPageToTables('https://bgvolleyball.com/result.php?group_id=1&season=1');
    } catch (err) {
        console.log(err);
    }
})()