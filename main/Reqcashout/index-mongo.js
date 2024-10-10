const onlineplayers = require("../../model/onlinePlayer/index-mongo");
const clientModel = require("../../model/clients/index-mongo");
const MainPilot = require("../../model/main.js/main-mongo");
const Bank = require("../bank/index-mongo");

async function Reqcashout(
  userid,
  userdata,
  btnid,
  currentOdd,
  public,
  roundid,
  callback
) {
  try {
    // Find player actions
    let isAnyPlayerActions = await clientModel.findOne({ ids: userid });

    if (!isAnyPlayerActions) {
      return callback({ status: false, id: btnid, message: "User not found" });
    }

    let action = isAnyPlayerActions.anyAction;

    // Check if the plane is running and action state
    while (action) {
      isAnyPlayerActions = await clientModel.findOne({ ids: userid });
      if (!isAnyPlayerActions) {
        return callback({ status: false, id: btnid, message: "User not found" });
      }

      action = isAnyPlayerActions.anyAction;

      let isPlaneRunning = await MainPilot.findOne({ code: "P001" });

      if (!isPlaneRunning || !isPlaneRunning.flying) {
        isAnyPlayerActions.anyAction = false;
        await isAnyPlayerActions.save();
        return callback({ status: false, id: btnid, message: "Stage timeout" });
      }
    }

    isAnyPlayerActions.anyAction = true;
    await isAnyPlayerActions.save();

    let isPlaneRunning = await MainPilot.findOne({ code: "P001" });

    if (!isPlaneRunning || !isPlaneRunning.flying) {
      isAnyPlayerActions.anyAction = false;
      await isAnyPlayerActions.save();
      return callback({ status: false, id: btnid, message: "Stage timeout" });
    }

    // Get player info
    userdata = await clientModel.findOne({ ids: userid });

    // Check for existing bets
    let singleuser = await onlineplayers.findOne({
      playerId: userid,
      btnid: btnid,
      won: false,
      roundId: roundid,
    });

    if (!singleuser) {
      isAnyPlayerActions.anyAction = false;
      await isAnyPlayerActions.save();
      return callback({ status: false, id: btnid, message: "No Bet Found" });
    }

    // Cashout logic
    let amount = Number(singleuser.amount);
    let wonm = (amount * Number(currentOdd)).toFixed(2);
    let totalMoney = (Number(userdata.balance) + Number(wonm)).toFixed(2);

    // Update online players
    await onlineplayers.updateOne(
      { betid: singleuser.betid },
      {
        wonamount: wonm,
        won: true,
        CashOutNumber: currentOdd,
      }
    );

    // Update user balance
    await clientModel.updateOne({ ids: userid }, { balance: totalMoney });
    
    // Bank transaction
    await new Bank().ChangeMoney(Number(wonm), false, true);

    // Emit updated online players list
    let findOnlines = await onlineplayers.find({
      sort: { amount: -1 }
    },{"_id": 0,"amount": 1, "playername": 1, "playerimage": 1, "wonamount": 1, "CashoutNumber": 1, "won": 1});
    public.to("pilotExiplicity").emit("linep", findOnlines);

    isAnyPlayerActions.anyAction = false;
    await isAnyPlayerActions.save();
    return callback({ status: true, id: btnid, amount: wonm, m: currentOdd });

  } catch (e) {
    console.error("Error in cashout function: ", e);
    if (isAnyPlayerActions) {
      isAnyPlayerActions.anyAction = false;
      await isAnyPlayerActions.save();
    }
    return callback({ status: false, id: btnid, message: "Stage timeout" });
  }
}

module.exports = Reqcashout;
