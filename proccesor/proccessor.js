const crypto = require("node:crypto");
const { Buffer } = require("node:buffer");
const ClientSeed = require("../GetSeeds/clientSeed");
const GetMult = async (clientSeed1, clientSeed2, clientSeed3) => {
  const ServerSeed = new String(crypto.randomBytes(20).toString("base64url"));
  const combinedSeeds = clientSeed1 + clientSeed2 + clientSeed3 + ServerSeed;

  function StableOdd(min, max) {
    const range = max - min + 1;
    const randomBytes = crypto.randomBytes(40);
    const randomNumber = randomBytes.readUInt32LE(10) % range;
    return randomNumber;
  }

  function LuckyPrise() {
    let prises = [
      1, 1.01, 1, 1.02, 1.03, 1.04, 1.05, 1.06, 1.07, 1.08, 1.09, 1, 1, 1.01, 1,
      1.02, 1.03, 1.04, 1.05, 1.06, 1.07, 1.08, 1.09, 1, 1, 1.01, 1, 1.02, 1, 1,
      1.03, 1.04, 1.05, 1.06, 1.07, 1.08, 1.09, 1, 1, 1.01, 1, 1, 1.02, 1, 1.03,
      1.04, 1, 1.05, 1, 1.06, 1.07, 1.08, 1.09, 1, 1, 1.01, 1.02, 1, 1, 1.03, 1,
      1, 1.04, 1, 1, 1.05, 1.06, 1.07, 1.08, 1.09, 1, 1.01, 1.02, 1, 1, 1.03,
      1.04, 1, 1.05, 1.06, 1.07, 1.08, 1.09, 1, 1, 1.01, 1.02, 1, 1, 1.03, 1,
      1.04, 1, 1.05, 1.06, 1.07, 1.08, 1.09, 1, 1, 1.01, 1.02, 1, 1, 1.03, 1,
      1.04, 1.05, 1.06, 1.07, 1.08, 1.09, 1, 1, 1.01, 1.02, 1, 1.03, 1.04, 1.05,
      1.06, 1.07, 1.08, 1.09, 1,
    ];
    return Number(prises[Math.floor(Math.random() * prises.length)]);
  }
  let hexString = await crypto
    .createHash("sha256")
    .update(combinedSeeds)
    .digest("hex");
  let serverHex = await crypto
    .createHash("sha256")
    .update(ServerSeed.toString("utf-8"))
    .digest("hex");
  const StableOddNumberMax = StableOdd(15000, 20000);
  const StableOddNumberMin = 1;
  const GetFirst10Seeds = combinedSeeds.slice(0, 6);

  const ConvertSeedsToBuffer = Buffer.alloc(5, GetFirst10Seeds, "utf-8");
  const PrepareNextOdd =
    ConvertSeedsToBuffer.readUInt32LE(1) %
    (StableOdd(11300, 20000) /
      StableOdd(StableOddNumberMin, StableOddNumberMax));
  let Versioned = await Number(PrepareNextOdd.toFixed(2));

  let maximumMultplier = 500000;
  let minmumMultplier = 1;
  /* if current multplier is greater than maxmum multplier */

  if (Versioned > maximumMultplier) {
    return await {
      client1: clientSeed1,
      client2: clientSeed2,
      client3: clientSeed3,
      server: serverHex,
      combined: hexString,
      mult: (Math.random() * 500000).toFixed(2),
    };
  }
  if (Versioned < minmumMultplier) {
    return await {
      client1: clientSeed1,
      client2: clientSeed2,
      client3: clientSeed3,
      server: serverHex,
      combined: hexString,
      mult: LuckyPrise(),
    };
  }
  return await {
    client1: clientSeed1,
    client2: clientSeed2,
    client3: clientSeed3,
    server: serverHex,
    combined: hexString,
    mult: Number(Versioned.toFixed(2)),
  };
};

module.exports = GetMult;
