const getMultplier = require("../../proccesor/proccessor");

const crypto = require("crypto");

class GetMultiply {
  async GetMultiplier(c1, c2, c3, roundId) {
    try {
      let mults = await getMultplier(c1, c2, c3);

      let { client1, client2, client3, server, combined, mult } = mults;

      mult = isNaN(mult) ? 1 : mult;

      return {
        status: true,
        ids: roundId,
        mult: mult,
        seeds: {
          client1: client1,
          client2: client2,
          client3: client3,
          server: server,
          combs: combined,
        },
      };
    } catch (e) {
      console.log(e);
      return {
        status: false,
        ids: crypto.randomBytes(20).toString("hex"),
        mult: 1,
        seeds: {
          client1: c1,
          client2: c2,
          client3: c3,
          server: crypto.randomBytes(20).toString("hex"),
          combs: crypto.randomBytes(80).toString("hex"),
        },
      };
    }
  }
}

module.exports = new GetMultiply().GetMultiplier;
