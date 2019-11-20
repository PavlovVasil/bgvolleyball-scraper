const mongoose = require('mongoose');

const TableSchema = mongoose.Schema({
    name: String,
    data: Array({
        date: String,
        time: String,
        firstTeam: String,
        secondTeam: String,
        place: String,
        gameScore: String,
        games: [String]
    })
})

module.exports = TableSchema;