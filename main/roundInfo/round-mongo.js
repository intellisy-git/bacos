const { Buffer } = require("buffer");
const RoundsModel = require("../../model/rounds/index-mongo");
const mainPlayers = "pilotExiplicity";

async function DefineRoundData(roundId, public, callback) {
    try {
        // Fetch the round data using Mongoose
        let roadRoundData = await RoundsModel.findOne({ roundId: roundId });
        if (!roadRoundData) return 1;

        // Destructure and parse seeds
        let { c1: client1, c2: client2, c3: client3, server, combs: combined } = JSON.parse(roadRoundData.seeds);
        let multplier = roadRoundData.multplier;
        let hex = combined.slice(0, 12);
        const ConvertSeedsToBuffer = Buffer.alloc(5, hex, 'utf-8');
        const decimal = ConvertSeedsToBuffer.readUInt32LE(1);

        // Prepare round information
        let roundInfo = {
            client1: client1,
            client2: client2,
            client3: client3,
            serverSeed: server,
            combined: combined,
            hexa: hex,
            decimal: decimal,
            result: multplier
        };

        // Callback or emit the round info
        if (callback) {
            return callback({
                status: true,
                data: roundInfo
            });
        } else {
            public.to(mainPlayers).emit("ri", roundInfo);
        }
    } catch (e) {
        console.log("Error while loading round data: ", e);
        return 1;
    }
}

module.exports = DefineRoundData;
