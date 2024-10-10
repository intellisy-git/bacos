const playersModel = require("../../model/onlinePlayer/index-mongo");
const clientModel = require("../../model/clients/index-mongo");
const MainBank = require("../../model/offen/index-mongo");
const Bank = require("../bank/index-mongo");
const mainPlayers = "pilotExiplicity";

async function Strategie0(mult, io) {

    let players;
    let db;
    let maxmoney;

    try {
        players = await playersModel.find({});
        db = await MainBank.findOne({
            main: "001"
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
                    const wait = await cashoutToAll(autocashouts, io, mult);
                    return wait;
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
    return await new Promise(async (res) => {

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
                    fetchuser = await clientModel.findOne({ ids: user.playerId });
                    lastbalance = fetchuser.balance;
    
                    // Wait until no actions are in progress for the user
                    while (fetchuser.anyAction) {
                        fetchuser = await clientModel.findOne({ ids: user.playerId });
                    }
    
                    fetchuser.anyAction = true;  // Set action to true
                    await fetchuser.save(); // Save to avoid multiple actions
                    recent = Number(lastbalance) + Number(wonMoney);
                }
    
                // Update online players
                let updateOnlinePlayers = await playersModel.updateMany(
                    { betid: user.betid },
                    { wonamount: wonMoney, won: true }
                );
    
                let updateBalance;
                if (!user.isdemo) {
                    // Update the balance for the user
                    updateBalance = await clientModel.updateOne(
                        { ids: user.playerId },
                        { balance: recent.toFixed(2), anyAction: false }
                    );
    
                    let saveToBank = new Bank().ChangeMoney(Number(wonMoney), false, true);
                }
    
                data.updatebalance = updateBalance;
                data.updateonlineplayers = updateOnlinePlayers;
    
                try {
                    if (!user.isdemo) {
                        io.to(user.socketId).emit("acshed", { id: user.btnid, amount: wonMoney, m: user.CashOutNumber });
                        user.won = true;
                        let save = await user.save();
                        data.saved = save;
                    }
    
                    let findOnlines = await playersModel.find({
                        sort: { amount: -1 }
                    }, {"_id": 0, "amount": 1, "playername": 1, "playerimage": 1, "wonamount": 1, "CashOutNumber": 1, "won": 1 });
                    io.to(mainPlayers).emit("linep", findOnlines);
                    res(false);
                } catch (error) {
                    console.error("Error in cashoutToAll inner try block:", error);
                    data.status = true;
                     res(true);
                }
            }
            
        } catch (error) {
            console.error("Error in cashoutToAll:", error);
            res(true);
        }
        
    })
}

module.exports = Strategie0;
