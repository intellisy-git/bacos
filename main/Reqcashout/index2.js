let onlineplayers = require("../../model/onlinePlayer");
let mainPlayers = "pilotExiplicity";
let clientModel = require("../../model/clients/index");
let MainPilot = require("../../model/main.js/main");
const Bank = require("../bank");

class Cancel {
  constructor(btnid, isclientAvailable, callback, roundid, io) {
    (this.btnid = btnid), (this.client = isclientAvailable);
    this.callback = callback;
    this.roundid = roundid;

    return this.cancel(io);
  }

  async cancel(io) {
    let isAnyPlayerActions = await clientModel.findOne({
      where: {
        ids: this.client.ids,
      },
    });

    try {
      let action = isAnyPlayerActions.anyAction;
      let isplaneStarted = false;

      while (action && !isplaneStarted) {
        isAnyPlayerActions = await clientModel.findOne({
          where: {
            ids: this.client.ids,
          },
        });

        action = isAnyPlayerActions.anyAction;

        let isPlaneRunning = await MainPilot.findOne({
          where: { code: "P001" },
        });

        isplaneStarted = isPlaneRunning.flying;

        if (isPlaneRunning.flying) {
          isAnyPlayerActions.anyAction = false;
          await isAnyPlayerActions.save();
          return this.callback({
            status: false,
            id: this.btnid,
            message: "Stage timeout",
          });
        }
      }

      isAnyPlayerActions.anyAction = true;
      await isAnyPlayerActions.save();

      let isPlaneRunning = await MainPilot.findOne({
        where: { code: "P001" },
      });

      isPlaneRunning = isPlaneRunning.flying;

      let getPlayerInfo = await clientModel.findOne({
        where: {
          ids: this.client.ids,
        },
      });

      this.client = getPlayerInfo;

      if (isPlaneRunning) {
        isAnyPlayerActions.anyAction = false;
        await isAnyPlayerActions.save();
        return this.callback({
          status: false,
          id: this.btnid,
          message: "Stage timeout",
        });
      }
    } catch (e) {
      isAnyPlayerActions.anyAction = false;
      await isAnyPlayerActions.save();
      console.log("Error while checking user actions in cancel bet: %s", e);
      return this.callback({
        status: false,
        id: this.btnid,
        message: "Stage timeout",
      });
    }

    try {
      let clientbet = await onlineplayers.findOne({
        where: {
          roundId: this.roundid,
          btnid: this.btnid,
          playerId: this.client.ids,
        },
      });

      if (clientbet) {
        let balance = this.client.balance;
        let amount = clientbet.amount;
        let blnc = (Number(balance) + Number(amount)).toFixed(2);
        let reduce = await clientbet.destroy();
        let updateuser =
          reduce &&
          (await clientModel.update(
            {
              balance: blnc,
            },
            {
              where: {
                ids: this.client.ids,
              },
            }
          ));
        let saveToBank = new Bank().ChangeMoney(
          Number(clientbet.amount),
          false,
          true
        );

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
        io.to(mainPlayers).emit("linep", findOnlines);
        isAnyPlayerActions.anyAction = false;
        await isAnyPlayerActions.save();
        return this.callback({
          status: updateuser && reduce ? true : false,
          id: this.btnid,
        });
      } else {
        isAnyPlayerActions.anyAction = false;
        await isAnyPlayerActions.save();
        return this.callback({
          status: false,
          message: "Stage timeout",
          id: this.btnid,
        });
      }
    } catch (e) {
      isAnyPlayerActions.anyAction = false;
      await isAnyPlayerActions.save();
      console.log("Error in cancel furnction: ", e);
      return this.callback({
        status: false,
        message: "Stage timeout",
        id: this.btnid,
      });
    }
  }
}

module.exports = Cancel;
