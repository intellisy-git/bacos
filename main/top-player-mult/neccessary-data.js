
async function NecessaryData(data,rounds) {

    if(rounds) {

        let rounds = data;
        let allrounds = [];
        for(let i = 0; i < rounds.length; i++) {
    
    
            allrounds[i] = {
                multplier: rounds[i].multplier,
                time: rounds[i].time,
                dur: rounds[i].dur,
                round: rounds[i].roundId
            }
    
        } return allrounds;

    }

    let players = data;
    let allplayers = [];
    for(let i = 0; i < players.length; i++) {


        allplayers[i] = {

            playerImage: players[i].playerimage,
            playerName: players[i].playername,
            amount: players[i].amount,
            wonamount: players[i].wonamount,
            cashedMult: players[i].CashOutNumber,
            roundMult: players[i].roundMultplier,
            time: players[i].time,
            round: players[i].roundId
        
        }

        

    }

    return allplayers;

}


module.exports =  NecessaryData;
