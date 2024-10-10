const onlinePlayers = require("../../model/onlinePlayer/index-mongo");
const clientModel = require("../../model/clients/index-mongo");
const mainPlayers = "pilotExiplicity";
const MainPilot = require("../../model/main.js/main-mongo");
const crypto = require("crypto");
const Bank = require("../bank/index-mongo");

class SavePlayers {
    constructor(...datas) {
        this.playerId = datas[0];
        this.roundId = datas[1];
        this.autcshout = datas[2];
        this.cashOutNumber = datas[3];
        this.amount = datas[4];
        this.btnid = datas[5];
        this.seed = datas[6];
        this.player = datas[7];
        this.btid = datas[8];
        this.balances = this.player.balance;
        this.callback = datas[9];
        this.io = datas[10];
        return this.saveSync();
    }

    async saveSync() {
        let isAnyPlayerActions = await clientModel.findOne({
            ids: this.player.ids
        });

        try {
            let action = isAnyPlayerActions.anyAction;
            let isPlaneStarted = false;

            let planeState = await MainPilot.findOne({
                code: "P001"
            });

            isPlaneStarted = planeState.flying;

            while (action && !isPlaneStarted) {
                isAnyPlayerActions = await clientModel.findOne({
                    ids: this.player.ids
                });

                action = isAnyPlayerActions.anyAction;

                let isPlaneRunning = await MainPilot.findOne({
                    code: "P001"
                });

                isPlaneStarted = isPlaneRunning.flying;

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
                code: "P001"
            });

            isPlaneRunning = isPlaneRunning.flying;

            let getPlayerInfo = await clientModel.findOne({
                ids: this.player.ids
            });

            this.player = getPlayerInfo;
            this.balances = this.player.balance;

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
            console.log("Error while checking user actions in save player: %s", e);
            return this.callback({
                status: false,
                id: this.btnid,
                message: "Stage timeout",
            });
        }

        try {
            let isPlayed = await onlinePlayers.findOne({
                playerId: this.playerId,
                btnid: this.btnid
            });

            if (isPlayed) {
                return 1;
            }

            if (parseFloat(this.player.balance) < parseFloat(this.amount) ||
                parseFloat(this.amount) < 1 || parseFloat(this.amount) > 100000) {
                isAnyPlayerActions.anyAction = false;
                await isAnyPlayerActions.save();
                return this.callback({
                    status: false,
                    id: this.btnid,
                    message: "Invalid money",
                });
            }

             await new onlinePlayers({
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
            }).save()

            const newBalance = (Number(this.player.balance) - Number(this.amount)).toFixed(2);
            await clientModel.findOneAndUpdate({ ids: this.player.ids }, { balance: newBalance })

            let saveToBank = new Bank().ChangeMoney(Number(this.amount), true, false);

            return await this.sendPlayers();

        } catch (error) {
            console.log("Error while saving player %s", error);
            await clientModel.findOneAndUpdate({ ids: this.player.ids }, { anyAction: false })
            return this.callback({
                status: false,
                id: this.btnid,
                message: "Stage timeout",
            });
        }
    }

    async sendPlayers() {
        try {
            let findOnlines = await onlinePlayers.find({
                sort: { amount: -1 }
              },{"amount": 1, "playername": 1, "playerimage": 1, "wonamount": 1, "CashoutNumber": 1, "won": 1});
            this.io.to(mainPlayers).emit("linep", findOnlines);

            this.callback({
                status: true,
                id: this.btnid
            });
        } catch (error) {
            console.log("Error while sending players: %s", error);
            await onlinePlayers.deleteOne({
                playerId: this.playerId,
                roundId: this.roundId,
                isAutocashout: this.autcshout,
                CashOutNumber: this.cashOutNumber,
                amount: this.amount,
                btnid: this.btnid,
                socketId: this.playerId,
                betid: this.btid
            })

            let saveToBank = new Bank().ChangeMoney(Number(this.amount), false, true);
            await clientModel.findOneAndUpdate({ ids: this.player.ids }, { balance: this.balances, anyAction: false })
            return this.callback({
                status: false,
                message: "Stage timeout",
                id: this.btnid,
            });
        } finally {
            await clientModel.findOneAndUpdate({ ids: this.player.ids }, { anyAction: false })
        }
    }
}

module.exports = SavePlayers;
