const mongoose = require('mongoose');
const crypto = require("crypto");

const MainBankSchema = new mongoose.Schema({
    id: {
        type: String, 
        unique: true,
        default: crypto.randomBytes(20).toString("hex")
    },
    main: {
        type: String,
        required: true
    },
    account: {
        type: Number, 
        required: true
    },
    action: {
        type: Boolean,
        default: false  
    }
}, {
    timestamps: true 
});

const MainBank = mongoose.model('MainBank', MainBankSchema);

module.exports = MainBank;
