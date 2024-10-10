const MainBank = require("../../model/offen/index");


class Bank {



   ChangeMoney(money,add,sub) {

    (async (money,add,sub) =>{

        if(add) {
          await  this.add(money);
        }
        else if(sub) {
             await   this.sub(money);
            
        }

    })(money,add,sub)

   }

   async add(money) {

    try{
        let bankData = await MainBank.findOne({where: {
            main: "001"
        }});

        let action = bankData.action;
    
        while(action) {
            bankData = await MainBank.findOne({where: {
                main: "001"
            }});
        
             action = bankData.action;
        }
        bankData.action = true;
        await bankData.save();
    
        bankData = await MainBank.findOne({where: {
            main: "001"
        }});
    
        let Money = (Number(bankData.account) + Number(money)).toFixed(2);
    
        bankData.account = Money;
        bankData.action = false;
        await bankData.save();
        return 1;
    } catch(e) {
        console.log("Error while adding money to bank ",e);
        return 1;
    }
   }



   async sub(money) {

    try{
        let bankData = await MainBank.findOne({where: {
            main: "001"
        }});
    
        let action = bankData.action;
    
        while(action) {
            bankData = await MainBank.findOne({where: {
                main: "001"
            }});
        
             action = bankData.action;
        }
        bankData.action = true;
        await bankData.save();
    
        bankData = await MainBank.findOne({where: {
            main: "001"
        }});
    
        let Money = (Number(bankData.account) - Number(money)).toFixed(2);
    
        bankData.account = Money;
        bankData.action = false;
        await bankData.save();
        return 1;
    } catch(e) {
        console.log("Error while removing money to bank ",e);
        return 1;
    }
   }

}

module.exports = Bank;