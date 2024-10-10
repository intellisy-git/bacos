const {Buffer} = require("buffer");
let RoundsModel = require("../../model/rounds/index");
let mainPlayers = "pilotExiplicity";


async function DefineRoundData(roundId,public,callback){
    try{
        let roadRoundData = await RoundsModel.findOne({where: {
            roundId: roundId,
        }});
      if(!roadRoundData) return 1;
        let {
            c1: client1,
            c2: client2,
            c3: client3,
            server,
            combs: combined
        } = JSON.parse(roadRoundData.seeds);
        let multplier = roadRoundData.multplier;
        let hex = combined.slice(0,12);
        const ConvertSeedsToBuffer = Buffer.alloc(5,hex, 'utf-8');
        const  decimal = ConvertSeedsToBuffer.readUInt32LE(1);
    
        let roundInfo = {
            client1: client1,
            client2: client2,
            client3: client3,
            serverSeed: server,
            combined: combined,
            hexa: hex,
            decimal: decimal,
            result: multplier
        }
    
        if(callback){
           return callback({
                status: true,
                data: roundInfo
            });
        }else{
            public.to(mainPlayers).emit("ri",roundInfo);
        }
    } catch(e){
        console.log("error while loading round data: ",e);
        return 1;
    }

}

module.exports = DefineRoundData;