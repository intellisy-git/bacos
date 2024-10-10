const onlineplayers = require("../../model/onlinePlayer/index-mongo");
const clientModel = require("../../model/clients/index-mongo");
const MainPilot = require("../../model/main.js/main-mongo");
const Bank = require("../bank/index-mongo");

async function ReqcashoutAwayPlayer(
  bet,
  usersd,
  currentOdd,
  public,
  isRoundOpen
) {
  let client = await clientModel.findOne({ ids: usersd.ids });

  let isPlaneRunning = await MainPilot.findOne({ code: "P001" });

  if (!isPlaneRunning.flying) {
    if (isRoundOpen) {
      try {
        while (client.anyAction) {
          client = await clientModel.findOne({ ids: usersd.ids });

          if (!client.anyAction) {
            client.anyAction = true;
            await client.save();
          }
        }
      } catch (e) {
        client.anyAction = false;
        await client.save();
        console.error("Error in user req away func: ", e);
        return { status: false };
      }

      // Handle cash out for away player
      try {
        let singleuser = bet;

        if (singleuser) {
          let totalMoney = (Number(client.balance) + Number(bet.amount)).toFixed(2);

          // Update online players
          let updateonlineplayers = await onlineplayers.findOneAndDelete({
            betid: singleuser.betid,
          });

          // Update client's balance
          client.balance = totalMoney;
          client.anyAction = false;
          await client.save();
          let saveToBank = new Bank().ChangeMoney(Number(bet.amount), false, true);

          // Fetch updated online players list
          let findOnlines = await onlineplayers.find({
            sort: { amount: -1 }
          },{"amount": 1, "playername": 1, "playerimage": 1, "wonamount": 1, "CashoutNumber": 1, "won": 1});

          // Emit updated online players to mainPlayers
          public.to("pilotExiplicity").emit("linep", findOnlines);

          return { status: true };
        } else {
          return { status: false };
        }
      } catch (error) {
        client.anyAction = false;
        await client.save();
        console.error("Error in ReqcashoutAwayPlayer:", error);
        return { status: false };
      }
    } else {
      return { status: false };
    }
  }

  try {
    let singleuser = bet;

    if (singleuser) {
      let amount = Number(singleuser.amount);
      let wonm = (amount * Number(currentOdd)).toFixed(2);
      let totalMoney = (Number(client.balance) + Number(wonm)).toFixed(2);

      // Update online players
      await onlineplayers.updateOne(
        { betid: singleuser.betid },
        {
          wonamount: wonm,
          won: true,
          CashOutNumber: currentOdd,
        }
      );

      // Update client's balance
      client.balance = totalMoney;
      client.anyAction = false;
      await client.save();
      let saveToBank = new Bank().ChangeMoney(Number(wonm), false, true);

      // Fetch updated online players list
      let findOnlines = await onlineplayers.find({
        sort: { amount: -1 }
      },{"_id": 0,"amount": 1, "playername": 1, "playerimage": 1, "wonamount": 1, "CashoutNumber": 1, "won": 1});

      // Emit updated online players to mainPlayers
      public.to("pilotExiplicity").emit("linep", findOnlines);

      return { status: true };
    } else {
      return { status: false };
    }
  } catch (error) {
    client.anyAction = false;
    await client.save();
    console.error("Error in ReqcashoutAwayPlayer:", error);
    return { status: false };
  }
}

module.exports = ReqcashoutAwayPlayer;
