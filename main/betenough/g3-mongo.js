const playersModel = require("../../model/onlinePlayer/index-mongo"); // Mongoose model

async function isBetGreater3() {
    try {
        // Fetch all players using Mongoose's `find` method
        let players = await playersModel.find({});

        // Check if there are at least 3 players
        if (players.length >= 3) {
            return {
                c1: players[0],
                c2: players[1],
                c3: players[2]
            };
        } else {
            return false;
        }
    } catch (error) {
        console.error("Error fetching players:", error);
        return false; // Return false or handle error as needed
    }
}

module.exports = isBetGreater3;
