const playersModel = require("../../model/players/index");
const roundsModel = require("../../model/rounds/index");
const AppendTime = require("./append-time");
const RoundMult = require("./round-mult");
const NeccessaryData = require("./neccessary-data");
const SortHuges = require("./solt-huges");

class Top {
  constructor(top, time,ispreviousHand) {
    if(ispreviousHand) return this.previousHand();
    this.top = top;
    this.time = time;
  }
  async previousHand(){
    let lastRoundId = await roundsModel.findAll({
      order: [["id", "DESC"]],
      limit: 2,
    });

    let lastId = lastRoundId[0].roundId;
    let lastPlayers = await playersModel.findAll({
      attributes: [
        "amount",
        "playername",
        "playerimage",
        "wonamount",
        "CashoutNumber",
        "won",
      ],
      where: {roundId: lastId},
      order: [["amount", "DESC"]],
      limit: 100
    });
    return lastPlayers;

  }
  async BiggestWinns() {
    let loadWinners = await playersModel.findAll({
      where: { won: true },
      order: [["wonamount", "DESC"]],
      limit: 15,
    });
    let sortTime = await this.sortPlayersTime(loadWinners);
    let appendTime = await AppendTime(sortTime);
    let roundMult = await RoundMult(appendTime);
    let neccessaryData = await NeccessaryData(roundMult);
    return neccessaryData;
  }

  async loadResponse() {
    if(this.top == 1) {
      return await this.HugeWinns();
    }
    if(this.top == 2) {
      return await this.BiggestWinns();
    }
    if(this.top == 3) {
      return await this.Multipliers();
    }
  }

  async HugeWinns() {

    let loadWinners = await playersModel.findAll({
      where: { won: true },
      order: [
        ["amount", "ASC"],
      ],
      limit: 207
    });

    let sortTime = await this.sortPlayersTime(loadWinners);
    let appendTime = await AppendTime(sortTime);
    let roundMult = await RoundMult(appendTime);
    let neccessaryData = await NeccessaryData(roundMult,false);
    let sortHuges = await SortHuges(neccessaryData);
    return sortHuges;
  }

  async Multipliers() {

    let rounds = await roundsModel.findAll({});
    let soltTime = await this.sortPlayersTime(rounds);
    let appendTime = await AppendTime(soltTime);
    appendTime.sort(function(a, b){return Number(b.multplier) - Number(a.multplier)});
    appendTime = appendTime.slice(0,15);
    let mults = await NeccessaryData(appendTime,true);
    return mults;

  }


  async sortPlayersTime(players) {
    if (this.time === 1) {
      return await this.DayPlayers(players);
    }

    if (this.time === 2) {
      return await this.MounthPlayers(players);
    }

    if (this.time === 3) {
      return await this.YearPlayers(players);
    }
  }

  async DayPlayers(players) {
    let dayPlayers = players.filter((bet, id) => {
      let pday = new Date(bet.createdAt).getDay();
      let pyear = new Date(bet.createdAt).getFullYear();
      let pmouth = new Date(bet.createdAt).getMonth();

      let day = new Date().getDay();
      let year = new Date().getFullYear();
      let mouth = new Date().getMonth();
      let isThisDay = day === pday && year === pyear && mouth === pmouth;
      return isThisDay;
    });

    return dayPlayers;
  }

  async MounthPlayers(players) {
    let mounthPlayers = players.filter((bet, id) => {
      let pyear = new Date(bet.createdAt).getFullYear();
      let pmouth = new Date(bet.createdAt).getMonth();

      let year = new Date().getFullYear();
      let mouth = new Date().getMonth();
      let isMounth = year === pyear && mouth === pmouth;
      return isMounth;
    });

    return mounthPlayers;
  }

  async YearPlayers(players) {
    let yearPlayers = players.filter((bet, id) => {
      let pyear = new Date(bet.createdAt).getFullYear();
      let year = new Date().getFullYear();

      let isThisYear = year === pyear;
      return isThisYear;
    });

    return yearPlayers;
  }
}

module.exports = Top;
