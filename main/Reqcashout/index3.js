const onlineplayers = require("../../model/onlinePlayer");
const clientModel = require("../../model/clients/index");
const MainPilot = require("../../model/main.js/main");
const Bank = require("../bank");

async function ReqcashoutAwayPlayer(
  bet,
  usersd,
  currentOdd,
  public,
  isRoundOpen
) {
  let client = await clientModel.findOne({
    where: {
      ids: usersd.ids,
    },
  });

  let isPlaneRunning = await MainPilot.findOne({
    where: { code: "P001" },
  });

  if (!isPlaneRunning.flying) {
    if (isRoundOpen) {
      try {
        while (client.anyAction) {
          client = await clientModel.findOne({
            where: {
              ids: usersd.ids,
            },
          });

          if (!client.anyAction) {
            client.anyAction = true;
            await client.save();
          }
        }
      } catch (e) {
        client.anyAction = false;
        await client.save();
        console.log("Error in user req away func: ", e);
        return { status: false };
      }

      //

      try {
        let singleuser = bet;

        if (singleuser) {
          let totalMoney = Number(
            Number(client.balance) + Number(bet.amount)
          ).toFixed(2);

          // Update online players
          let updateonlineplayers = await onlineplayers.findOne({
            where: {
              betid: singleuser.betid,
            },
          });

          await updateonlineplayers.destroy();

          // Update client's balance
          client.balance = totalMoney;
          client.anyAction = false;
          await client.save();
          let saveToBank = new Bank().ChangeMoney(
            Number(bet.amount),
            false,
            true
          );

          // Fetch updated online players list
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

      //
    } else {
      return { status: false };
    }
  }

  try {
    let singleuser = bet;

    if (singleuser) {
      let amount = Number(singleuser.amount);
      let wonm = Number(amount * Number(currentOdd)).toFixed(2);
      let totalMoney = Number(Number(client.balance) + Number(wonm)).toFixed(2);

      // Update online players
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

      // Update client's balance
      client.balance = totalMoney;
      client.anyAction = false;
      await client.save();
      let saveToBank = new Bank().ChangeMoney(Number(wonm), false, true);
      // Fetch updated online players list
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
