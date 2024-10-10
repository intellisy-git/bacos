const MainBank = require("../../model/offen/index-mongo"); // Mongoose model

class Bank {

   async ChangeMoney(money, add, sub) {
       // Use await to handle asynchronous operations
       if (add) {
           await this.add(money);
       } else if (sub) {
           await this.sub(money);
       }
   }

   async add(money) {
       try {
           // Use Mongoose's `findOne` method to retrieve the document
           let bankData = await MainBank.findOne({ main: "001" });
           let action = bankData.action;

           // Wait until action is false before proceeding
           while (action) {
               bankData = await MainBank.findOne({ main: "001" });
               action = bankData.action;
           }

           // Set action to true to indicate a process is ongoing
           bankData.action = true;
           await bankData.save();

           // Add the money to the account
           let newAccountBalance = (Number(bankData.account) + Number(money)).toFixed(2);
           bankData.account = newAccountBalance;
           bankData.action = false; // Reset action after operation
           await bankData.save();
           return 1;
       } catch (e) {
           console.log("Error while adding money to bank", e);
           return 1;
       }
   }

   async sub(money) {
       try {
           // Use Mongoose's `findOne` method to retrieve the document
           let bankData = await MainBank.findOne({ main: "001" });
           let action = bankData.action;

           // Wait until action is false before proceeding
           while (action) {
               bankData = await MainBank.findOne({ main: "001" });
               action = bankData.action;
           }

           // Set action to true to indicate a process is ongoing
           bankData.action = true;
           await bankData.save();

           // Subtract the money from the account
           let newAccountBalance = (Number(bankData.account) - Number(money)).toFixed(2);
           bankData.account = newAccountBalance;
           bankData.action = false; // Reset action after operation
           await bankData.save();
           return 1;
       } catch (e) {
           console.log("Error while removing money from bank", e);
           return 1;
       }
   }
}

module.exports = Bank;
