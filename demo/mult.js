const crypto = require("node:crypto");
const { Buffer } = require("node:buffer");
const ClientSeed = require("../GetSeeds/clientSeed");
const GetMult = async () => {
  const ServerSeed = new String(crypto.randomBytes(20).toString("base64url"));
  const combinedSeeds =
    "clientSeed1" + "clientSeed2" + "clientSeed3" + ServerSeed;

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
    return (
      Math.random() * 500000 + 0.01 || (LuckyPrise() + 0.01) * LuckyPrise()
    ).toFixed(2);
  }
  if (Versioned < minmumMultplier) {
    return (
      (LuckyPrise() + 0.01) *
      LuckyPrise() *
      LuckyPrise() *
      LuckyPrise() *
      LuckyPrise() *
      LuckyPrise() *
      LuckyPrise() *
      LuckyPrise() *
      LuckyPrise()
    ).toFixed(2);
  }
  return (
    (Number(Versioned) + 0.01 || LuckyPrise() + 0.01) *
    (LuckyPrise() *
      LuckyPrise() *
      LuckyPrise() *
      LuckyPrise() *
      LuckyPrise() *
      LuckyPrise() *
      LuckyPrise() *
      LuckyPrise() *
      LuckyPrise())
  ).toFixed(2);
};

module.exports = GetMult;
