let playerModel = require("../../model/players/index");
let roundmodel = require("../../model/rounds/index");


async function mybets(id,currentState,callback){
    let discoverdBets = [];
    let isFinished = null;
    try{
        let bets = await playerModel.findAll({
            where: {
                playerId: id
            }
        });
        if(bets.length <= currentState){
            isFinished = true;
        }else{
            isFinished = false;
        }

        if(bets.length === 0){
            return callback({
                f: true,
                data: []
            })
        }

        bets = bets.filter((bet,id)=>{
            let pday  = new Date(bet.createdAt).getDate();
            let pyear = new Date(bet.createdAt).getFullYear();
            let phour = new Date(bet.createdAt).getHours();
            let pmouth = new Date(bet.createdAt).getMonth();
            let minutes = new Date(bet.createdAt).getMinutes();
            bets[id].time = `${phour}:${minutes}`;
            bets[id].dur = `${pday}-${pmouth}-${pyear}`
            return true;;
    
        });
    
        for(let id = 0; id < bets.length; id++) {

            let round = await roundmodel.findOne({
                where: {
                    roundId: bets[id]?.roundId || "00000"
                }
            });
            if(!round ) continue;
            if(!bets[id]?.won && round) {
                bets[id].roundId = round?.roundId;
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
                dur: bets[id].dur,
                round: bets[id].roundId
            };


    
        };
    discoverdBets = discoverdBets.reverse();
    discoverdBets = discoverdBets.slice(0,Number(parseInt(currentState) - 1));
        callback({
            f: isFinished,
            data: discoverdBets
        });


    } catch(e){
        console.log("error while send user history function: ",e);
        callback({
            f: true,
            data: []
        });
    }

}

module.exports = mybets;