const mongoose = require('mongoose');

const TournamentSchema = mongoose.Schema({
    name: String,
    rounds: Array({
        roundName: String,
        data: Array({
            date: String,
            time: String,
            firstTeam: String,
            secondTeam: String,
            place: String,
            gameScore: String,
            games: [String]
        })
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

module.exports = TournamentSchema;