const playersModel = require("../../model/players/index-mongo");
const roundsModel = require("../../model/rounds/index-mongo");
const AppendTime = require("./append-time-mongo");
const RoundMult = require("./round-mult-mongo");
const NeccessaryData = require("./neccessary-data-mongo");
const SortHuges = require("./sort-huges-mongo");

class Top {
  constructor(top, time, ispreviousHand) {
    if (ispreviousHand) return this.previousHand();
    this.top = top;
    this.time = time;
  }

  async previousHand() {
    let lastRound = await roundsModel.find({})
    lastRound = lastRound.slice(-1);
    let lastId = lastRound[0].roundId;
    let lastPlayers = await playersModel.find({
      roundId: lastId
    })
    .sort({ amount: -1 })
    .limit(100)
      .select("amount playername playerimage wonamount CashOutNumber won")
    return lastPlayers;
  }

  async BiggestWinns() {
    let loadWinners = await playersModel.find({ won: true })
      .sort({ wonamount: -1 })
      .limit(15);

    let sortTime = await this.sortPlayersTime(loadWinners);
    let appendTime = await AppendTime(sortTime);
    let roundMult = await RoundMult(appendTime);
    let neccessaryData = await NeccessaryData(roundMult);
    return neccessaryData;
  }

  async loadResponse() {
    if (this.top === 1) {
      return await this.HugeWinns();
    }
    if (this.top === 2) {
      return await this.BiggestWinns();
    }
    if (this.top === 3) {
      return await this.Multipliers();
    }
  }

  async HugeWinns() {
    let loadWinners = await playersModel.find({ won: true })
      .sort({ amount: 1 })
      .limit(207);

    let sortTime = await this.sortPlayersTime(loadWinners);
    let appendTime = await AppendTime(sortTime);
    let roundMult = await RoundMult(appendTime);
    let neccessaryData = await NeccessaryData(roundMult, false);
    let sortHuges = await SortHuges(neccessaryData);
    return sortHuges;
  }

  async Multipliers() {
    let rounds = await roundsModel.find({});
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
      return await this.MonthPlayers(players);
    }

    if (this.time === 3) {
      return await this.YearPlayers(players);
    }
  }

  async DayPlayers(players) {
    let dayPlayers = players.filter((bet) => {
      let betDate = new Date(bet.createdAt);
      let today = new Date();
      return betDate.getDate() === today.getDate() &&
             betDate.getFullYear() === today.getFullYear() &&
             betDate.getMonth() === today.getMonth();
    });

    return dayPlayers;
  }

  async MonthPlayers(players) {
    let monthPlayers = players.filter((bet) => {
      let betDate = new Date(bet.createdAt);
      let today = new Date();
      return betDate.getFullYear() === today.getFullYear() &&
             betDate.getMonth() === today.getMonth();
    });

    return monthPlayers;
  }

  async YearPlayers(players) {
    let yearPlayers = players.filter((bet) => {
      let betDate = new Date(bet.createdAt);
      let today = new Date();
      return betDate.getFullYear() === today.getFullYear();
    });

    return yearPlayers;
  }
}

module.exports = Top;
