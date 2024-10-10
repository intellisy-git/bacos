const crypto = require("crypto");
let stock = [];
let actions = false;
let mainPlayers = "pilotExiplicity";

class Messages {

   constructor(message,client,ismessage,publics,callback) {
    if(callback) return callback(stock);
    this.public = publics;
    this.client = client;
    this.ismessage = ismessage;
    this.message = message?.m;
    if(ismessage) return this.newMessage();
    if(!ismessage) return this.newLike();
   }

   async newMessage() {

    try {
        if(this.message.length > 160) return;
        
        while(actions) { let Egnore = "Egnore!"; }
        actions = true;

        let message_id = crypto.randomBytes(10).toString("hex");

        stock.push({
            sender_name: this.client.username,
            sender_image: this.client.image,
            message_id: message_id,
            message: this.message,
            likes: 0,
            samples: []
        });
    
          if(stock.length >= 100) {
            stock.slice(0,-1);
          }
          actions = false;
          this.public.to(mainPlayers).emit("nm",stock);
    } 
    catch(e) {

        console.log("error while saving new message: ",e);
        actions = false;
    }


   }

   async newLike() {
    
    while(actions) { let Egnore = "Egnore!"; }
    actions = true;

    try {
        let messageIndex = null;

        let messageToLike = stock.filter((message,index)=> {
            
            if(message.message_id == this.message) messageIndex = index;
            return message.message_id == this.message;

        });
       
        if(messageToLike.length) {

            let isLikedByMe = messageToLike[0].samples.filter((id,i)=>{
                return id == this.client.ids;
            });
            
            if(isLikedByMe.length) {
                isLikedByMe = messageToLike[0].samples.filter((id,i)=>{
                    return id != this.client.ids;
                });
                messageToLike[0].samples = isLikedByMe;
            }else {
                
                messageToLike[0].samples.push(this.client.ids);
                
            }
            messageToLike[0].likes = messageToLike[0].samples.length;
            stock[messageIndex] = messageToLike[0];
        
        }

        actions = false;
        this.public.to(mainPlayers).emit("nm",stock);

    } catch(e) {

        console.log("Error while setting like: ",e);
        actions = false;
    }


   }
}

module.exports = Messages;

let stockSchema = {
    sender_name: "",
    message_id: "",
    sender_image: "",
    likes: Number(0),
    message: "",
    samples: ["peoples_id"]
}