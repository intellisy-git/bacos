let playersModel = require("../../model/onlinePlayer/index");

async function isBetGreater3() {
    let players = await playersModel.findAll({});
    
    if(players.length >= 3) {

        return {
            c1: players[0],
            c2: players[1],
            c3: players[2]
        }

    }else{
        return false;
    }
}

module.exports = isBetGreater3;