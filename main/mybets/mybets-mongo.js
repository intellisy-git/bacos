const playerModel = require("../../model/players/index-mongo"); // Mongoose model for players
const roundModel = require("../../model/rounds/index-mongo"); // Mongoose model for rounds

async function myBets(id, callback) {
    let discoveredBets = [];
    try {
        // Fetch bets for the given player ID
        let bets = await playerModel.find({ playerId: id }); // Using Mongoose's find method
        
        // If no bets found, return early
        if (bets.length === 0) {
            return callback({
                status: true,
                games: []
            });
        }
        
        // Filter bets to only include those from the current day
        bets = bets.filter((bet) => {
            const betDate = new Date(bet.createdAt);
            const today = new Date();

            const isSameDay = betDate.getDate() === today.getDate() &&
                              betDate.getMonth() === today.getMonth() &&
                              betDate.getFullYear() === today.getFullYear();
            bet.time = `${betDate.getHours()}:${betDate.getMinutes()}`; // Set time property
            return isSameDay; // Only return bets from today
        });

        for (const bet of bets) {
            // Fetch the corresponding round based on roundId
            const round = await roundModel.findOne({ roundId: bet.roundId });
            if (!round) continue; // If no round found, skip

            if (!bet.won) {
                bet.roundId = round.roundId;
                bet.multplier = round.multplier;
            } else {
                bet.multplier = bet.CashOutNumber;
            }
            
            // Prepare the discovered bets for response
            discoveredBets.push({
                time: bet.time,
                amount: bet.amount,
                wonamount: bet.wonamount,
                won: bet.won,
                multplier: bet.multplier,
                round: bet.roundId
            });
        }

        // Reverse the order of discovered bets
        discoveredBets.reverse();

        // Return the results
        callback({
            status: true,
            games: discoveredBets
        });

    } catch (error) {
        console.log(error);
        callback({
            status: false,
            games: []
        });
    }
}

module.exports = myBets;
