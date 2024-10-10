let RoundsModel = require("../../model/rounds/index");

async function RoundMult(users) {
  
    let players = users;
    let allplayers = [];
    for(let i = 0; i < players.length; i++) {

        let round = await RoundsModel.findOne({
            where: {
                roundId: players[i].roundId
            },
            
        });

        if(round) {
            players[i].roundMultplier = round.multplier;
            allplayers.push(players[i]);
        }


    }

    return allplayers;

}


module.exports =  RoundMult;