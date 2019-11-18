const mongoose = require('mongoose');

const RankingTableSchema = mongoose.Schema({
    ranking: Number,
    team: String,
    matches: Number,
    wins: Number,
    losses: Number,
    games: String,
    gameRatio: String,
    score: String,
    scoreRatio: String,
    points: Number
})

const TableSchema = mongoose.Schema({
})

//module.exports = mongoose.model('Rankings', RankingSchema)
module.exports = RankingSchema;