const RoundsModel = require("../../model/rounds/index-mongo");

async function RoundMult(users) {
    let players = users;
    let allPlayers = [];

    for (let i = 0; i < players.length; i++) {
        let round = await RoundsModel.findOne({ roundId: players[i].roundId });

        if (round) {
            players[i].roundMultplier = round.multplier;
            allPlayers.push(players[i]);
        }
    }

    return allPlayers;
}

module.exports = RoundMult;
