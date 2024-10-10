const playersModel = require("../../model/onlinePlayer/index");
const clientModel = require("../../model/clients/index");;
const MainBank = require("../../model/offen/index");
const Bank = require("../bank");
let mainPlayers = "pilotExiplicity";

async function Strategie0(mult, io) {

    let players;
    let db;
    let maxmoney;
    try {
         players = await playersModel.findAll({});
         db = await MainBank.findOne({
            where:{
                main: "001"
            }
        });

            maxmoney = parseFloat(db.account).toFixed(2);
        let minmoney = 0;

        if (players.length > 0) {
            for (let player of players) {
                if (!player.isdemo) {
                    minmoney += Number(player.amount) * Number(mult);
                }
            }

            if (minmoney >= maxmoney) {
                return true;
            } else {
                let autocashouts = players.filter(player => player.isAutocashout && parseFloat(player.CashOutNumber) <= mult && !player.won);
                if (autocashouts.length > 0) {
                    let isFinished = await cashoutToAll(autocashouts, io, mult);
                    return isFinished.status;
                } else {
                    return false;
                }
            }
        } else {
            return false;
        }
    } catch (error) {
        console.error("Error in Strategie0:", error);
        return true;
    }
}

async function cashoutToAll(users, io, mult) {
    try {
        let data = {
            status: null,
            updatebalance: null,
            updateonlineplayers: null,
            saved: null
        };

        for (let user of users) {
            let wonMoney = (Number(user.amount) * Number(user.CashOutNumber)).toFixed(2);
            let fetchuser, lastbalance, recent;

            if (!user.isdemo) {
                fetchuser = await clientModel.findOne({ where: { ids: user.playerId } });
                lastbalance;
                while(fetchuser.anyAction) {
                    fetchuser = await clientModel.findOne({ where: { ids: user.playerId } });
                    if(!fetchuser.anyAction) {
                        fetchuser.anyAction = true;
                        await fetchuser.save();
                    }
                }lastbalance = fetchuser.balance;
                recent = Number(lastbalance) + Number(wonMoney);
            }

            let updateonlineplayers = await playersModel.update({
                wonamount: wonMoney,
                won: true
            }, {
                where: {
                    betid: user.betid
                }
            });

            let updatebalance;
            if (!user.isdemo) {
                updatebalance = await clientModel.update({ balance: recent.toFixed(2),anyAction: false }, {
                    where: {
                        ids: user.playerId
                    }
                });

                let saveToBank = new Bank().ChangeMoney(Number(wonMoney),false,true);

            }

            data.updatebalance = updatebalance;
            data.updateonlineplayers = updateonlineplayers;

            try {
                if (!user.isdemo) {
                    io.to(user.socketId).emit("acshed", { id: user.btnid, amount: wonMoney, m: user.CashOutNumber });
                    user.won = true;
                    let save = await user.save();
                    data.saved = save;
                }

                let findOnlines = await playersModel.findAll({
                    attributes: ["amount", "playername", "playerimage", "wonamount", "CashoutNumber", "won"],
                    order: [["amount", "DESC"]]
                });
                io.to(mainPlayers).emit("linep", findOnlines);
                data.status = false;
            } catch (error) {
                console.error("Error in cashoutToAll inner try block:", error);
                data.status = true;
                return data;
            }
        }

        return data;
    } catch (error) {
        console.error("Error in cashoutToAll:", error);
        return { status: true };
    }
}

module.exports = Strategie0;
