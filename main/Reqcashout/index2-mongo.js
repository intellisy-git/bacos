const onlineplayers = require("../../model/onlinePlayer/index-mongo");
const clientModel = require("../../model/clients/index-mongo");
const MainPilot = require("../../model/main.js/main-mongo");
const Bank = require("../bank/index-mongo");

class Cancel {
  constructor(btnid, isclientAvailable, callback, roundid, io) {
    this.btnid = btnid;
    this.client = isclientAvailable;
    this.callback = callback;
    this.roundid = roundid;

    // Automatically call the cancel method
    this.cancel(io);
  }

  async cancel(io) {
    let isAnyPlayerActions = await clientModel.findOne({ ids: this.client.ids });

    try {
      let action = isAnyPlayerActions.anyAction;
      let isplaneStarted = false;

      // Check if any player actions are ongoing
      while (action && !isplaneStarted) {

        if (!isAnyPlayerActions) {
          
          return this.callback({
            status: false,
            id: this.btnid,
            message: "User not found",
          });
          
        }

        action = isAnyPlayerActions.anyAction;

        let isPlaneRunning = await MainPilot.findOne({ code: "P001" });

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

      let isPlaneRunning = await MainPilot.findOne({ code: "P001" });

      if (isPlaneRunning.flying) {
        isAnyPlayerActions.anyAction = false;
        await isAnyPlayerActions.save();
        return this.callback({
          status: false,
          id: this.btnid,
          message: "Stage timeout",
        });
      }

      // Get updated player info
      this.client = await clientModel.findOne({ ids: this.client.ids });

      if (!this.client) {
        isAnyPlayerActions.anyAction = false;
        await isAnyPlayerActions.save();
        return this.callback({
          status: false,
          id: this.btnid,
          message: "User not found",
        });
      }
    } catch (e) {
      isAnyPlayerActions.anyAction = false;
      await isAnyPlayerActions.save();
      console.error("Error while checking user actions in cancel bet: ", e);
      return this.callback({
        status: false,
        id: this.btnid,
        message: "Stage timeout",
      });
    }

    try {
      let clientbet = await onlineplayers.findOne({
        roundId: this.roundid,
        btnid: this.btnid,
        playerId: this.client.ids,
      });

      if (clientbet) {
        let balance = this.client.balance;
        let amount = clientbet.amount;
        let blnc = (Number(balance) + Number(amount)).toFixed(2);
        
        // Remove bet
        await onlineplayers.deleteOne({ _id: clientbet._id });
        
        // Update user balance
        let updateuser = await clientModel.updateOne(
          { ids: this.client.ids },
          { balance: blnc }
        );

        // Update bank
        await new Bank().ChangeMoney(Number(clientbet.amount), false, true);

        // Emit updated online players list
        let findOnlines = await onlineplayers.find({
          sort: { amount: -1 }
        },{"_id":0, "amount": 1, "playername": 1, "playerimage": 1, "wonamount": 1, "CashoutNumber": 1, "won": 1});

        io.to("pilotExiplicity").emit("linep", findOnlines);

        isAnyPlayerActions.anyAction = false;
        await isAnyPlayerActions.save();
        
        return this.callback({
          status: updateuser ? true : false,
          id: this.btnid,
        });
      } else {
        isAnyPlayerActions.anyAction = false;
        await isAnyPlayerActions.save();
        console.log('plane is running last')
        return this.callback({
          status: false,
          message: "Stage timeout",
          id: this.btnid,
        });
      }
    } catch (e) {
      isAnyPlayerActions.anyAction = false;
      await isAnyPlayerActions.save();
      console.error("Error in cancel function: ", e);
      return this.callback({
        status: false,
        message: "Stage timeout",
        id: this.btnid,
      });
    }
  }
}

module.exports = Cancel;
