const mongoose = require('mongoose');

const DocumentSchema = mongoose.Schema({
    name: String,
    rounds: Array({
        date: String,
        time: String,
        firstTeam: String,
        secondTeam: String,
        place: String,
        gameScore: String,
        games: [String]
    }),
    rankings: Array({
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
})

module.exports = DocumentSchema;