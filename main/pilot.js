const ClientSeed = require("../GetSeeds/clientSeed");
const getMultiplier = require("./getMultiplier/index");
const Increment = require("../increment/increment");
const isClientAvailable = require("./clientAvailable/isclientavailable");
const Strategie0 = require("./strg0/strg0");
const Reqcashout = require("./Reqcashout/index");
const ReqcashoutAwayPlayer = require("./Reqcashout/index3");
const Cancel = require("./Reqcashout/index2");
const savePlayers = require("./savePlayers/index");
const MainPilot = require("../model/main.js/main");
const OnlinePlayers = require("../model/onlinePlayer/index");
const crypto = require("crypto");
const mysql2 = require("mysql2");
const moduledata = require("../webdata/info.json");
const RoundsModel = require("../model/rounds/index");
const Players = require("../model/players/index");
const DemoPlayers = require("../demo/players");
const DemoMult = require("../demo/mult");
const userbetsInHour = require("./mybets/mybets");
const userBetHistories = require("./mybets/mybetHistory");
const Incredible = require("./top-player-mult/main");
const ClientsModel = require("../model/clients");
let mainPlayers = "pilotExiplicity";
let enoughBet = require("./betenough/g3");
let DefineRoundData = require("./roundInfo/round");
const Messages = require("./chatting");
let nextRoundid = crypto.randomBytes(40).toString("hex");
let currentOdd = 1;
let liveUsers = [];
let incrementOdd = 1;
let lastOdds = [];
let isRoundOpen = false;
let allowCancel = false;
let roundInfo = {};
let public;

function sendServerSeed() {
  if (roundInfo?.data?.server) {
    public.to(mainPlayers).emit("x_", roundInfo.data.server);
  }
}

const Louch = async (io) => {
  try {
    await ClientsModel.update({ online: false }, { where: { online: true } });
    public = io;
    public.on("connection", async (client) => {
      try {
        if (client.user) {
          let isavailable = await isClientAvailable(client.user);
          if (!isavailable) {
            client.isavailable = false;
          }
        }

        client.on("g", async (d, callback) => {
          console.log('g on')
          try {
            if (!callback) return 1;
            if (client.user) {
              let isavailable = await isClientAvailable(client.user);

              if (isavailable) {
                if (isavailable.online) {
                  isavailable.online = false;
                  client.isavailable = false;
                  public.to(client.user).emit("q", "403");
                  await isavailable.save();
                  callback({
                    messag: Math.floor(Math.random() * 100000) + 2024,
                  });

                  isavailable.online = false;
                  await isavailable.save();

                  try {
                    let isplacedBet = await OnlinePlayers.findAll({
                      where: {
                        playerId: client.user,
                        won: false,
                        roundId: nextRoundid,
                      },
                    });

                    if (isplacedBet) {
                      let odd = incrementOdd;
                      for (let i = 0; i < isplacedBet.length; i++) {
                        let wait = await ReqcashoutAwayPlayer(
                          isplacedBet[i],
                          isavailable,
                          odd,
                          public
                        );
                        if (wait.status === false) break;
                      }
                    }
                  } catch (e) {
                    console.log("error while cashingout to away user %s", e);
                  }

                  client.leave(client.user);
                  client.user = "0000-0000-0000-404";
                  client.leave(mainPlayers);
                } else {
                  isavailable.online = true;
                  await isavailable.save();
                  client.isavailable = true;
                  client.join(mainPlayers);
                  client.join(client.user);
                  callback({
                    message: Math.floor(Math.random() * 100000) + 2024,
                  });
                }
              }
            }
          } catch (error) {
            console.error("Error in user access event:", error);
          }
        });

        client.on("lm", async (data) => {
          try {
            let isavailable = await isClientAvailable(client.user);
            if (isavailable && isavailable.online) {
              client.emit("lm", lastOdds);
            }
          } catch (error) {
            console.error("Error in lm event:", error);
          }
        });

        client.on("_nm", async (d, callback) => {
          let isavailable = await isClientAvailable(client.user);
          if (isavailable && isavailable.online && callback) {
            let sendMessage = new Messages(null, null, null, null, callback);
          }
        });

        client.on("nm", async (data) => {
          try {
            let isavailable = await isClientAvailable(client.user);
            if (isavailable && isavailable.online) {
              let message = data;
              if (message?.m) {
                if (
                  message.m.trim().length < 1 ||
                  message.m.trim().length > 160
                )
                  return;
                if (message.a) {
                  message.m = await filterMessage(message.m);
                }
                if (data?.a === true || data?.a === false) {
                  let sendMessage = new Messages(
                    data,
                    isavailable,
                    data.a,
                    public
                  );
                }
              }
            }
          } catch (e) {
            console.log("error in nm event: ", e);
          }
        });

        client.on("ri", async (data, callback) => {
          try {
            let isavailable = await isClientAvailable(client.user);
            if (isavailable && callback && data?.i) {
              await DefineRoundData(data.i, false, callback);
            }
          } catch (e) {
            console.log("error on ri: ", e);
          }
        });

        client.on("cl", async (d) => {
          try {
            let isavailable = await isClientAvailable(client.user);
            if (isavailable && isavailable.online) {
              liveUsers.push(client.user);
              public.to(mainPlayers).emit("cl", liveUsers.length);
            }
          } catch (e) {
            console.log("error in cl event:", e);
          }
        });

        client.on("cr", async (d) => {
          try {
            let isavailable = await isClientAvailable(client.user);
            if (isavailable && isavailable.online) {
              liveUsers = liveUsers.filter((u, i) => u !== client.user);
              public.to(mainPlayers).emit("cl", liveUsers.length);
            }
          } catch (e) {
            console.log("Error in cr event", e);
          }
        });

        client.on("p", async (data, callback) => {
          try {
            if (
              !callback ||
              !data ||
              !data.amount ||
              !data.seed ||
              !data.cashoutMultiplier
            )
              return 1;

            let btnid = await data?.btnid;
            if (btnid > 2 || btnid < 1) return 1;

            if (client.user && isRoundOpen) {
              let isavailable = await isClientAvailable(client.user);
              let pid = client.user;
              let isAutocashout = await data.isAutoCashout;
              let amount = parseFloat(data.amount).toFixed(2);
              let cashoutMultiplier = data.cashoutMultiplier;
              if (
                Number(cashoutMultiplier) > 100 ||
                Number(cashoutMultiplier) < 1.1
              ) {
                return callback({
                  status: false,
                  id: data.btnid,
                  message: "Invalid cashout number",
                });
              }
              let seed = data.seed;
              let betid = new ClientSeed(100).seedSync();
              await new savePlayers(
                pid,
                nextRoundid,
                isAutocashout,
                cashoutMultiplier,
                amount,
                btnid,
                seed,
                isavailable,
                betid,
                callback,
                public
              );
            } else {
              callback({
                status: false,
                id: data.btnid,
                message: "Stage timeout",
              });
            }
          } catch (error) {
            console.error("Error in p event:", error);
          }
        });

        client.on("cs", async (data, callback) => {
          try {
            if (!callback) return client.emit("404", "");

            let btnid = data.id;
            if (btnid > 2 || btnid < 1) {
              return callback({
                status: false,
                message: 401,
              });
            }

            if (client.user) {
              let isavailable = await isClientAvailable(client.user);
              if (isavailable && isavailable.online) {
                return Reqcashout(
                  client.user,
                  isavailable,
                  btnid,
                  incrementOdd,
                  public,
                  nextRoundid,
                  callback
                );
              }
            }
          } catch (error) {
            console.error("Error in cs event:", error);
          }
        });

        client.on("cns", async (data, callback) => {
          try {
            if (!callback) return client.emit("404", "");

            let btnid = data.id;
            if (btnid > 2 || btnid < 1) {
              return callback({
                status: false,
                message: 401,
              });
            }

            if (allowCancel) {
              let isavailable = await isClientAvailable(client.user);
              if (isavailable && isavailable.online) {
                await new Cancel(
                  btnid,
                  isavailable,
                  callback,
                  nextRoundid,
                  public
                );
              }
            }
          } catch (error) {
            console.error("Error in cns event:", error);
          }
        });
        client.on("bs", async (data, callback) => {
          try {
            let isavailable = await isClientAvailable(client.user);
            if (!callback || data < 10) return 1;
            if (isavailable && isavailable.online) {
              userBetHistories(client.user, data, callback);
            }
          } catch (err) {
            console.log("error loading user history: ", err);
            callback({
              s: false,
            });
          }
        });
        client.on("av", async (image, callback) => {
          try {
            let isavailable = await isClientAvailable(client.user);
            if (image > 72 || image < 1 || !callback) return 1;
            if (isavailable && image && isavailable.online) {
              isavailable.image = image;
              await isavailable.save();
              callback({
                s: true,
                i: image,
              });
            }
          } catch (err) {
            console.log("error in setting user image", err);
            callback({
              s: false,
            });
          }
        });

        client.on("blc", async (d, c) => {
          try {
            let isavailable = await isClientAvailable(client.user);
            if (isavailable && isavailable.online) {
              c({ balance: Number(isavailable.balance).toFixed(2) });
            }
          } catch (error) {
            console.error("Error in blc event:", error);
          }
        });

        client.on("myg", async (d, callback) => {
          try {
            if (!callback) return;

            let isavailable = await isClientAvailable(client.user);
            if (isavailable && isavailable.online) {
              userbetsInHour(client.user, callback);
            }
          } catch (error) {
            console.error("Error in myg event:", error);
          }
        });

        client.on("_p_", async (data, callback) => {
          try {
            let isavailable = await isClientAvailable(client.user);
            if (isavailable && callback && isavailable.online) {
              let findOnlines = await OnlinePlayers.findAll({
                attributes: [
                  "amount",
                  "playername",
                  "playerimage",
                  "wonamount",
                  "CashoutNumber",
                  "won",
                ],
              });
              callback({
                status: true,
                p: findOnlines,
              });
            }
          } catch (error) {
            console.error("Error in _p_ event:", error);
          }
        });

        client.on("mbl", async (d) => {
          try {
            let isavailable = await isClientAvailable(client.user);
            if (isavailable && isavailable.online) {
              client.emit("mbl", {
                b: isavailable.balance,
                u: isavailable.username,
                i: isavailable.image,
                s: isavailable.seed,
                d: isavailable.ids,
              });
            }
          } catch (error) {
            console.error("Error in mbl event:", error);
          }
        });

        client.on("inc", async (data, callback) => {
          try {
            let isavailable = await isClientAvailable(client.user);
            if (isavailable && callback && isavailable.online) {
              await Incredible(data, callback, false);
            }
          } catch (error) {
            console.error("Error in inc event:", error);
          }
        });

        client.on("inc1", async (data, callback) => {
          try {
            let isavailable = await isClientAvailable(client.user);
            if (isavailable && callback && isavailable.online) {
              await Incredible(data, callback, true);
            }
          } catch (error) {
            console.error("Error in inc event:", error);
          }
        });

        client.on("sd", async (data, callback) => {
          try {
            let isavailable = await isClientAvailable(client.user);
            if (!callback || !isavailable) return;

            if (!data || !/[a-zA-Z0-9]{20,20}/.test(data.seed) || !data?.type) {
              return callback({
                status: false,
                message: "Seed length must be 20 length include numbers!",
              });
            }

            isavailable.useState = "user";
            isavailable.seed = data.seed;
            await isavailable.save();

            return callback({
              status: true,
              message: "Seed saved!",
              activeState: "user",
              seed: data.seed,
            });
          } catch (e) {
            console.log("error while setting client seed", e);
            return callback({
              status: false,
              message: "Failed try again later!",
            });
          }
        });

        client.on("disconnect", async (away) => {
          liveUsers = liveUsers.filter((u, i) => u !== client.user);
          public.to(mainPlayers).emit("cl", liveUsers.length);
          try {
            let isavailable = await isClientAvailable(client.user);
            if (isavailable && isavailable.online) {
              isavailable.online = false;
              await isavailable.save();
              public.to(client.user).emit("q", "403");

              let isplacedBet = await OnlinePlayers.findAll({
                where: {
                  playerId: client.user,
                  won: false,
                  roundId: nextRoundid,
                },
              });

              if (isplacedBet) {
                let odd = incrementOdd;
                for (let i = 0; i < isplacedBet.length; i++) {
                  let wait = await ReqcashoutAwayPlayer(
                    isplacedBet[i],
                    isavailable,
                    odd,
                    public,
                    isRoundOpen
                  );
                  if (wait.status === false) break;
                }
              }
            }
          } catch (error) {
            console.error("Error in disconnect event:", error);
          }
        });
      } catch (error) {
        console.error("Error in client connection:", error);
      }
    });

    function loadingToNextRound() {
      allowCancel = false;
      isRoundOpen = false;
      setTimeout(startNextRound, 2000);
    }

    setTimeout(() => {
      FlewAway(); // start immediately
    }, 1000);

    async function startNextRound() {
      try {
        let availableClients = await enoughBet();
        let c1 = availableClients
          ? availableClients.c1.seed
          : new ClientSeed(20).seedSync();
        let c2 = availableClients
          ? availableClients.c2.seed
          : new ClientSeed(20).seedSync();
        let c3 = availableClients
          ? availableClients.c3.seed
          : new ClientSeed(20).seedSync();

        let Fixing = await getMultiplier(c1, c2, c3, nextRoundid);

        roundInfo = {
          "round-id": `${nextRoundid}`,
          "round-mult": `${Fixing.mult}`,
          data: {
            c1: {
              name: `${
                availableClients
                  ? availableClients.c1.playername
                  : "n***" + Math.floor(Math.random() * 9) + 1
              }`,
              image: `${
                availableClients
                  ? availableClients.c1.playerimage
                  : Math.floor(Math.random() * 60) + 1
              }`,
              seed: `${Fixing.seeds.client1}`,
            },
            c2: {
              name: `${
                availableClients
                  ? availableClients.c2.playername
                  : "n***" + Math.floor(Math.random() * 9) + 1
              }`,
              image: `${
                availableClients
                  ? availableClients.c2.playerimage
                  : Math.floor(Math.random() * 60) + 1
              }`,
              seed: `${Fixing.seeds.client2}`,
            },
            c3: {
              name: `${
                availableClients
                  ? availableClients.c3.playername
                  : "n***" + Math.floor(Math.random() * 9) + 1
              }`,
              image: `${
                availableClients
                  ? availableClients.c3.playerimage
                  : Math.floor(Math.random() * 60) + 1
              }`,
              seed: `${Fixing.seeds.client3}`,
            },
            server: `${Fixing.seeds.server}`,
            combs: `${Fixing.seeds.combs}`,
          },
        };

        currentOdd = Fixing.mult;

        await MainPilot.update({ flying: true }, { where: { code: "P001" } });
        return Init(50);
      } catch (error) {
        console.error("Error in startNextRound:", error);
      }
    }

    async function Init(rate = 50) {
      sendServerSeed();
      try {
        interval = setInterval(async () => {
          try {
            if (
              Number(currentOdd) == Number(incrementOdd) ||
              Number(currentOdd) <= Number(incrementOdd)
            ) {
              clearInterval(interval);
              lastOdds.unshift({
                add: Number(currentOdd).toFixed(2),
                round: roundInfo["round-id"],
              });

              if (lastOdds.length > 40) {
                lastOdds = lastOdds.slice(0, -1);
              }

              await MainPilot.update(
                { flying: false },
                { where: { code: "P001" } }
              );
              isRoundOpen = true;
              roundInfo["round-mult"] = Number(currentOdd).toFixed(2);

              return await clearBets().then(async (z) => {
                await handleOddSaving();
                nextRoundid = crypto.randomBytes(40).toString("hex");

                public.to(mainPlayers).emit("e", {
                  odd: Number(currentOdd).toFixed(2),
                  lastOdds: lastOdds,
                });

                DefineRoundData(roundInfo["round-id"], public, false);

                return FlewAway();
              });
            } else {
              let checkStarategie0 = await Strategie0(incrementOdd, public);
              if (checkStarategie0) {
                clearInterval(interval);
                lastOdds.unshift({
                  add: Number(incrementOdd).toFixed(2),
                  round: roundInfo["round-id"],
                });

                if (lastOdds.length > 40) {
                  lastOdds = lastOdds.slice(0, -1);
                }

                await MainPilot.update(
                  { flying: false },
                  { where: { code: "P001" } }
                );
                isRoundOpen = true;
                roundInfo["round-mult"] = Number(incrementOdd).toFixed(2);

                return await clearBets().then(async (z) => {
                  nextRoundid = crypto.randomBytes(40).toString("hex");
                  await handleOddSaving();

                  public.to(mainPlayers).emit("e", {
                    odd: Number(incrementOdd).toFixed(2),
                    lastOdds: lastOdds,
                  });

                  DefineRoundData(roundInfo["round-id"], public, false);
                  return FlewAway();
                });
              } else {
                isRoundOpen = false;
                public.to(mainPlayers).emit("m", {
                  odd: Number(incrementOdd).toFixed(2),
                });

                incrementOdd = (incrementOdd + Increment(incrementOdd)).toFixed(
                  2
                );
                incrementOdd = Number(incrementOdd);
              }
            }
          } catch (error) {
            console.error("Error in Init interval:", error);
          }
        }, rate);
      } catch (error) {
        console.error("Error in Init:", error);
      }
    }

    async function handleOddSaving() {
      try {
        if (!roundInfo["round-id"]) return;

        let info = {
          roundId: roundInfo["round-id"],
          multplier: roundInfo["round-mult"],
          seeds: JSON.stringify(roundInfo["data"]),
        };

        await RoundsModel.create(info);
      } catch (error) {
        console.error("Error in handleOddSaving:", error);
      }
    }

    async function clearBets() {
      try {
        let p = await OnlinePlayers.findAll({});
        for (let i = 0; i < p.length; i++) {
          let v = {
            playerId: p[i].playerId,
            socketId: p[i].socketId,
            roundId: p[i].roundId,
            CashOutNumber: p[i].CashOutNumber,
            btnid: p[i].btnid,
            amount: p[i].amount,
            wonamount: p[i].wonamount,
            isAutocashout: p[i].isAutocashout,
            won: p[i].won,
            seed: p[i].seed,
            playername: p[i].playername,
            playerimage: p[i].playerimage,
            betid: p[i].betid,
          };

          let saveAllPlayers = await Players.create(v);
          let s = {
            d: saveAllPlayers,
          };
        }

        var con = mysql2.createConnection({
          host: moduledata.host,
          user: moduledata.dbuser,
          password: moduledata.dbpass,
          database: moduledata.dbname,
        });

        con.connect(async function (err) {
          if (err) throw err;
          var sql = "truncate onlineplayers";
          con.query(sql, async function (err, result) {
            if (err) throw err;
            con.close();
            return 1;
          });
        });
        return 1;
      } catch (error) {
        console.error("Error in clearBets:", error);
      }
    }

    async function FlewAway() {
      sendServerSeed();
      try {
        let createdemos = await saveDemo();
        isRoundOpen = true;
        allowCancel = true;
        incrementOdd = 1;
        currentOdd = 1;
        setTimeout(loadingToNextRound, 7876);
      } catch (error) {
        console.error("Error in FlewAway:", error);
      }
    }

    async function saveDemo() {
      try {
        let players = await DemoPlayers(10, 30);
        for (let i = 0; i < players; i++) {
          if (isRoundOpen) {
            let prepare = {
              playerId: crypto.randomBytes(100).toString("hex"),
              roundId: nextRoundid,
              isAutocashout: true,
              CashOutNumber: Number(await DemoMult()).toFixed(2),
              amount: Number(await DemoPlayers(1, 100000)).toFixed(2),
              btnid: 1,
              seed: crypto.randomBytes(20).toString("hex"),
              socketId: crypto.randomBytes(90).toString("hex"),
              playername: `n***${Math.floor(Math.random() * 9) + 1}`,
              playerimage: Math.floor(Math.random() * 70) + 1,
              betid: crypto.randomBytes(90).toString("hex"),
              isdemo: true,
            };

            let saveOnline = await OnlinePlayers.create(prepare);
            let findOnlines = await OnlinePlayers.findAll({
              attributes: [
                "amount",
                "playername",
                "playerimage",
                "wonamount",
                "CashoutNumber",
                "won",
              ],
              order: [["amount", "DESC"]],
            });

            public.to(mainPlayers).emit("linep", findOnlines);
          } else {
            break;
          }
        }
      } catch (error) {
        console.error("Error in saveDemo:", error);
      }
    }
  } catch (error) {
    console.error("Error in Louch:", error);
  }
};

async function filterMessage(message) {
  return message;
  let text = message;
  let t = "";
  for (let i = 0; i < text.length; i++) {
    if (text[i] === " " || isNaN(text[i])) {
      if (text[i] === " " || /[a-zA-Z]/.test(text[i])) {
        t += text[i];
      }
    }
  }
  return t;
}
module.exports = Louch;
