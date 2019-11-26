const cheerio = require('cheerio');
const axios = require('axios');
const mongoose = require('mongoose');
const RankingTableSchema = require('./schema/RankingSchema');
const TableSchema = require('./schema/TableSchema');
const iconv = require('iconv-lite');
require('dotenv/config');


//Converts an year object to a collection and documents to be stored in MongoDB
const convertYearObjToCollection = async (yearObj) => {
    const pageResponse = await axios.get(yearObj.url, {
        responseType: 'arraybuffer'
    });
    const collection = {
        name: yearObj.collectionName,
        documents: []
    }
    //We have to convert the encoding of the response from windows-1251 to UTF-8
    let data = iconv.decode(pageResponse.data, 'windows-1251');
    const $ = cheerio.load(data);
    const tables = Array.from($('table')).filter(table => $(table).find('tr').length > 2);

    for (let i = 1; i < tables.length - 1; i++) {
        let document = {};
        document.name = $(tables[i]).find('tr th').text();
        document.data = convertTableToDocument($, tables[i]);
        const isNextTableRanking = $(tables[i + 1]).find('tr th').attr('colspan') === "10";
        if (isNextTableRanking) {
            let rankings = scrapeRankings($, tables[i + 1]);
            document.rankings = rankings;
            //skipping the next table, because it should be a field in the current document
            i++; 
        }
        collection.documents.push(document);
    }
    debugger
    return collection;
}

//Scrapes an array of rankings from a ranking table and returns them
//so they could be added to the corresponding document
const scrapeRankings = ($, table) => {
    //Getting all but the first two rows (they are the title and header and we don't need them)
    const tableRows = Array.from($(table).find('tr')).slice(2);
    const rankings = [];
    for (row of tableRows) {
        const rowNode = $(row).find('td');
        const currentRow = {};
        currentRow.ranking = parseInt(rowNode.eq(0).text(), 10);
        currentRow.team = rowNode.eq(1).text();
        currentRow.matches = parseInt(rowNode.eq(2).text(), 10);
        currentRow.wins = parseInt(rowNode.eq(3).text(), 10);
        currentRow.losses = parseInt(rowNode.eq(4).text(), 10);
        currentRow.games = rowNode.eq(5).text();
        currentRow.gameRatio = rowNode.eq(6).text();
        currentRow.score = rowNode.eq(7).text();
        currentRow.scoreRatio = rowNode.eq(8).text();
        currentRow.points = parseInt(rowNode.eq(9).text(), 10);
        rankings.push(currentRow);
    }
    return rankings;
}

//Converts a non-ranking table to an array of rounds (objects) to be written in a document
const convertTableToDocument = ($, table) => {
    const tableRows = Array.from($(table).find('tr')).slice(1);
    const rounds = [];
    let currentRound = {
        name: '',
        data: []
    };
    let currentRow = {};
    for (let i = 0; i < tableRows.length; i++) {
        //Getting the row cells
        let cells = Array.from($(tableRows[i]).find('td'));
        if (cells.length === 1) {
            //There is only one cell and it is actually the "title" for the current document
            currentRound.name = $(cells).eq(0).text();
        } else {
            cells.pop();
            currentRow = {};
            currentRow.date = $(cells).eq(0).text();
            currentRow.time = $(cells).eq(1).text();
            currentRow.firstTeam = $(cells).eq(2).find('a').text();
            currentRow.secondTeam = $(cells).eq(3).find('a').text();
            currentRow.place = $(cells).eq(4).find('a').text();
            currentRow.games = $(cells).eq(5).text();
            //some rows have a varying number of games that have been played
            for (let i = 6; i < cells.length; i++) {
                if ($(cells).eq(i).text() !== '') {
                    currentRow[`game${i-5}`] = $(cells).eq(i).text();
                }
            };
            currentRound.data.push(currentRow);
        }
        //If the next row doesn't exist, or it is a Round name row: 
        // 1. push the current round to the rounds array
        // 2. clear the current round 
        if (i === tableRows.length - 1 || Array.from($(tableRows[i + 1]).find('td')).length === 1) {
            rounds.push({[currentRound.name]: currentRound.data});
            currentRound = {
                name: '',
                data: []
            };
        }
    }
    return rounds;
}

(async () => {
    // mongoose.connect(
    //     process.env.DB_CONNECTION,
    //     { useNewUrlParser: true, useUnifiedTopology: true },
    //     () => {
    //         console.log('connected to DB');
    // })
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
        //testing with the first year only
        const firstCollection = await convertYearObjToCollection(yearsCollectionObjects[0]);
    } catch (err) {
        console.log(err);
    }
})()