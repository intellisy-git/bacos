let onlineplayers = require("../../model/onlinePlayer");
let mainPlayers = "pilotExiplicity";
let clientModel = require("../../model/clients/index");
let MainPilot = require("../../model/main.js/main");
const Bank = require("../bank");

async function Reqcashout(
  userid,
  userdata,
  btnid,
  currentOdd,
  public,
  roundid,
  callback
) {
  //

  let isAnyPlayerActions = await clientModel.findOne({
    where: {
      ids: `${userid}`,
    },
  });

  try {
    let action = isAnyPlayerActions.anyAction;
    let isplaneStarted = true;

    while (action && isplaneStarted) {
      isAnyPlayerActions = await clientModel.findOne({
        where: {
          ids: `${userid}`,
        },
      });

      action = isAnyPlayerActions.anyAction;

      let isPlaneRunning = await MainPilot.findOne({
        where: { code: "P001" },
      });

      isplaneStarted = isPlaneRunning.flying;
      if (!isPlaneRunning.flying) {
        isAnyPlayerActions.anyAction = false;
        await isAnyPlayerActions.save();
        return callback({
          status: false,
          id: btnid,
          message: "Stage timeout",
        });
      }
    }

    isAnyPlayerActions.anyAction = true;
    await isAnyPlayerActions.save();

    let isPlaneRunning = await MainPilot.findOne({
      where: { code: "P001" },
    });

    let getPlayerInfo = await clientModel.findOne({
      where: {
        ids: `${userid}`,
      },
    });

    userdata = getPlayerInfo;

    if (!isPlaneRunning.flying) {
      isAnyPlayerActions.anyAction = false;
      await isAnyPlayerActions.save();
      return callback({
        status: false,
        id: btnid,
        message: "Stage timeout",
      });
    }
  } catch (e) {
    isAnyPlayerActions.anyAction = false;
    await isAnyPlayerActions.save();
    console.log("Error while checking user actions in reqcashout: %s", e);
    return callback({
      status: false,
      id: btnid,
      message: "Stage timeout",
    });
  }

  //

  let isPlaneRunning = await MainPilot.findOne({
    where: { code: "P001" },
  });

  isPlaneRunning = isPlaneRunning.flying;

  try {
    if (isPlaneRunning) {
      let singleuser = await onlineplayers.findOne({
        where: {
          playerId: `${userid}`,
          btnid: btnid,
          won: false,
          roundId: roundid,
        },
      });

      if (singleuser) {
        let nul = {};

        if (true) {
          let amount = Number(singleuser.amount);
          let wonm = Number(amount * Number(currentOdd)).toFixed(2);
          let totalMoney = Number(
            Number(userdata.balance) + Number(wonm)
          ).toFixed(2);

          let updateonlineplayers = await onlineplayers.update(
            {
              wonamount: wonm,
              won: true,
              CashOutNumber: currentOdd,
            },
            {
              where: {
                betid: singleuser.betid,
              },
            }
          );

          nul.a = updateonlineplayers;

          let updatebalance = await clientModel.update(
            { balance: totalMoney },
            {
              where: {
                ids: userid,
              },
            }
          );
          nul.d = updatebalance;
          let saveToBank = new Bank().ChangeMoney(Number(wonm), false, true);
          callback({ status: true, id: btnid, amount: wonm, m: currentOdd });

          let findOnlines = await onlineplayers.findAll({
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
          isAnyPlayerActions.anyAction = false;
          await isAnyPlayerActions.save();
          return 1;
        }
      } else {
        isAnyPlayerActions.anyAction = false;
        await isAnyPlayerActions.save();

        return callback({ status: false, id: btnid, message: "No Bet Found" });
      }
    } else {
      isAnyPlayerActions.anyAction = false;
      await isAnyPlayerActions.save();
      return callback({ status: false, id: btnid });
    }
  } catch (e) {
    isAnyPlayerActions.anyAction = false;
    await isAnyPlayerActions.save();
    console.log("Error in cashout function: ", e);
    return callback({ status: false, id: btnid, message: "Stage timeout" });
  }
}

module.exports = Reqcashout;
