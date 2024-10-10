const playerModel = require("../../model/players/index-mongo"); // Mongoose model for players
const roundModel = require("../../model/rounds/index-mongo"); // Mongoose model for rounds

async function myBets(id, currentState, callback) {
    let discoveredBets = [];
    let isFinished = null;

    try {
        // Fetch bets for the given player ID
        let bets = await playerModel.find({ playerId: id }); // Using Mongoose's find method

        // Check if the number of bets is less than or equal to the current state
        isFinished = bets.length <= currentState;

        // If no bets found, return empty data
        if (bets.length === 0) {
            return callback({
                f: true,
                data: []
            });
        }

        // Process each bet to add time and date information
        bets.forEach((bet) => {
            const betDate = new Date(bet.createdAt);
            bet.time = `${betDate.getHours()}:${betDate.getMinutes()}`; // Format time
            bet.dur = `${betDate.getDate()}-${betDate.getMonth() + 1}-${betDate.getFullYear()}`; // Format date
        });

        // Iterate over bets to find associated round information
        for (const bet of bets) {
            const round = await roundModel.findOne({ roundId: bet.roundId || "00000" }); // Find round by roundId
            if (!round) continue;

            // Update multiplier based on win status
            if (!bet.won) {
                bet.roundId = round.roundId;
                bet.multplier = round.multplier;
            } else {
                bet.multplier = bet.CashOutNumber;
            }

            // Prepare discovered bets for response
            discoveredBets.push({
                time: bet.time,
                amount: bet.amount,
                wonamount: bet.wonamount,
                won: bet.won,
                multplier: bet.multplier,
                dur: bet.dur,
                round: bet.roundId
            });
        }

        // Reverse the order and slice based on currentState
        discoveredBets = discoveredBets.reverse().slice(0, Number(currentState) - 1);

        // Return results
        callback({
            f: isFinished,
            data: discoveredBets
        });

    } catch (error) {
        console.log("Error while sending user history function: ", error);
        callback({
            f: true,
            data: []
        });
    }
}

module.exports = myBets;
