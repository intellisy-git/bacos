const onlinePlayers = require("../../model/onlinePlayer/index");
let clientModel = require("../../model/clients/index");
let mainPlayers = "pilotExiplicity";
let MainPilot = require("../../model/main.js/main");
let crypto = require("crypto");
const Bank = require("../bank");
class savePlayers {
  constructor(...datas) {
    this.playerId =datas[0];
    this.roundId = datas[1];
    this.autcshout = datas[2];
    this.cashOutNumber = datas[3];
    this.amount = datas[4];
    this.btnid = datas[5];
    this.seed = datas[6],
    this.player = datas[7];
    this.btid = datas[8];
    this.balances = this.player.balance;
    this.callback = datas[9];
    this.io = datas[10];
    return this.saveSync();
   
  }
  

  async saveSync() {

    let isAnyPlayerActions = await clientModel.findOne({
      where: {
          ids: this.player.ids
                  }
          });

    try {

      let action = isAnyPlayerActions.anyAction;
      let isplaneStarted = false;

      let planeState = await MainPilot.findOne({
        where: {code: "P001"}
       });
  
      isplaneStarted = planeState.flying;

      while(action && !isplaneStarted) {
      
        isAnyPlayerActions = await clientModel.findOne({
          where: {
              ids: this.player.ids
                      }
              });
  
        action = isAnyPlayerActions.anyAction;
  
        let isPlaneRunning = await MainPilot.findOne({
          where: {code: "P001"}
         });
    
        isplaneStarted = isPlaneRunning.flying;
  
        if(isPlaneRunning.flying){
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
        where: {code: "P001"}
       });
  
    isPlaneRunning = isPlaneRunning.flying;
  
    let getPlayerInfo = await clientModel.findOne({
          where: {
             ids: this.player.ids
                  }
               });
     
        this.player = getPlayerInfo;
        this.balances = this.player.balance;
    
  
    if(isPlaneRunning){
      isAnyPlayerActions.anyAction = false;
      await isAnyPlayerActions.save();
      return this.callback({
        status: false,
        id: this.btnid,
        message: "Stage timeout",
      });
  
    }

    }catch(e) {
      isAnyPlayerActions.anyAction = false;
      await isAnyPlayerActions.save();
      console.log("Error while checking user actions in save player: %s",e);
      return this.callback({
        status: false,
        id: this.btnid,
        message: "Stage timeout",
      });
    }
    
   
    try {

      
      let isplayed = await onlinePlayers.findOne({
        where: {
            playerId: this.playerId,
            btnid: this.btnid
        }
    });

    if(isplayed) {
      return 1;
    }


      if(parseFloat(this.player.balance) < parseFloat(this.amount) || 
      parseFloat(this.amount) < 1 || parseFloat(this.amount) > 100000) {
        isAnyPlayerActions.anyAction = false;
        await isAnyPlayerActions.save();
        return this.callback({
          status: false,
          id: this.btnid,
          message: "Invalid money",
        });
      }
      let saveonline = await onlinePlayers.create({
        playerId: this.playerId,
        roundId: this.roundId,
        isAutocashout: this.autcshout,
        CashOutNumber: this.cashOutNumber,
        amount: this.amount,
        btnid: this.btnid,
        seed: this.seed || crypto.randomBytes(20).toString("hex"),
        socketId: this.playerId,
        playername: this.player.username,
        playerimage: this.player.image,
        betid: this.btid,
        isdemo: false
      });
      
     
      let updatebalance = await clientModel.findOne({
        where: {
            ids: this.player.ids
                    }
            });

            updatebalance.balance = (Number(this.player.balance) - Number(this.amount)).toFixed(2);
            await updatebalance.save();

            let saveToBank = new Bank().ChangeMoney(Number(this.amount),true,false);

         return await this.sendplayers(saveonline,isAnyPlayerActions);

    } catch (error) {
      console.log("Error while saving player %s",error);
      isAnyPlayerActions.anyAction = false;
      await isAnyPlayerActions.save();
      return this.callback({
        status: false,
        id: this.btnid,
        message: "Stage timeout",
      });
    }
  }

  async sendplayers(savedPlayer,playerAction) {
    try {
      
      let findOnlines = await onlinePlayers.findAll({
        attributes: ["amount","playername","playerimage","wonamount","CashoutNumber","won"],
        order: [["amount","DESC"]]
        });
        this.io.to(mainPlayers).emit("linep",findOnlines);

      this.callback({
        status: true,
        id: this.btnid
      });
    } catch (error) {

      console.log("Error while sending players: %s",error);
      await savedPlayer.destroy();
      
      let updateUser= await clientModel.findOne({
        where: {
            ids: this.player.ids
                    }
                });
      let saveToBank = new Bank().ChangeMoney(Number(this.amount),false,true);
      updateUser.balance = this.balances;
      await updateUser.save();;

     return this.callback({
        status: false,
        message: "Stage timeout",
        id: this.btnid,
      });
    }
    finally {
      playerAction.anyAction = false;
      await playerAction.save();
    }
  }
}

module.exports = savePlayers;

