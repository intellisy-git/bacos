const mongoose = require('mongoose');
const crypto = require("crypto");

const ClientSchema = new mongoose.Schema({
    ids: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    currencType: {
        type: String,
        default: "RWF"
    },
    online: {
        type: Boolean,
        default: false
    },
    seed: {
        type: String,
        default: crypto.randomBytes(20).toString("hex")
    },
    anyAction: {
        type: Boolean,
        default: false
    },
    useState: {
        type: String,
        default: "random"
    }
}, {
    timestamps: true
});

const ClientModel = mongoose.model('Client', ClientSchema);
module.exports = ClientModel;
