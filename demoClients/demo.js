const GetSeeds = require("../GetSeeds/clientSeed");

let Getname = () => {
  return `n****${Math.floor(Math.random() * 10) + 1}`.toString();
};

let Getimage = () => {
  return `${Math.floor(Math.random() * 20) + 1}.png`.toString();
};

let Getprice = (min) => {
  return `${
    Math.floor(Math.random() * 100000) +
    Math.floor(Math.random() * 9900) +
    (min || 100)
  }`.toString();
};

let GenPlayers = async () => {
  let players = [];
  let len = Math.floor(Math.random() * 10000) + 123;

  for (var i = 0; i < len; i++) {
    players.push({
      playername: Getname(),
      playerimage: Getimage(),
      playeramount: Getprice(),
      choice: Math.floor(Math.random() * 2),
    });
  }

  return await players;
};

module.exports = demoPlayes = async () => await GenPlayers();
