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

//module.exports = mongoose.model('Rankings', RankingSchema)
module.exports = RankingSchema;