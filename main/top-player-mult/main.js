const Incredibles = require("./top");

async function Incredible(data, callback, previousHand) {
  if (previousHand) {
    let waitLastPlayers = await new Incredibles(null, null, true);
    return callback(waitLastPlayers);
  } else if (data.top && data.time) {
    if (data.top <= 3 && data.top >= 1 && data.time <= 3 && data.time >= 1) {
      let loadResponse = new Incredibles(data.top, data.time);
      loadResponse = await loadResponse.loadResponse();
      return callback(loadResponse);
    }
  }
}

module.exports = Incredible;
