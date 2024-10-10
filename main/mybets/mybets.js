let playerModel = require("../../model/players/index");
let roundmodel = require("../../model/rounds/index");


async function mybets(id,callback){
    let discoverdBets = [];
    try{
        let bets = await playerModel.findAll({
            where: {
                playerId: id
            }
        });
        if(bets.length === 0){
            return callback({
                status: true,
                games: []
            });
        }
        bets = bets.filter((bet,id)=>{
            let pday  = new Date(bet.createdAt).getDay();
            let pyear = new Date(bet.createdAt).getFullYear();
            let phour = new Date(bet.createdAt).getHours();
            let pmouth = new Date(bet.createdAt).getMonth();
            let minutes = new Date(bet.createdAt).getMinutes();
    
            let day  = new Date().getDay();
            let year = new Date().getFullYear();
            let mouth = new Date().getMonth();
            bets[id].time = `${phour}:${minutes}`;
            let thisHourBets = day === pday && year === pyear && mouth === pmouth;
            return thisHourBets;
    
        });
    
        for(let id = 0; id < bets.length; id++) {

            let round = await roundmodel.findOne({
                where: {
                    roundId: bets[id].roundId
                }
            });
            if(!round ) continue;
            
            if(!bets[id].won && round) {
                
                bets[id].roundId = round.roundId;
                bets[id].multplier = round.multplier;
            }
            
            else if(round){
                bets[id].multplier = bets[id].CashOutNumber;
            }
            discoverdBets[id] = {
                time: bets[id].time,
                amount: bets[id].amount,
                wonamount: bets[id].wonamount,
                won: bets[id].won,
                multplier: bets[id].multplier,
                round: bets[id].roundId
            };


    
        };
    discoverdBets = discoverdBets.reverse();
        callback({
            status: true,
            games: discoverdBets
        });


    } catch(e){
        console.log(e);
        callback({
            status: false,
            games: []
        });
    }

}

module.exports = mybets;