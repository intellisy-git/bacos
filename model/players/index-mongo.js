const mongoose = require('mongoose');

// Define the Players schema
const PlayersSchema = new mongoose.Schema({
    playerId: {
        type: String,
        required: true
    },
    socketId: {
        type: String,
        required: true
    },
    roundId: {
        type: String,
        required: true
    },
    CashOutNumber: {
        type: Number,  // FLOAT(10,2) in SQL becomes Number in MongoDB
        required: true
    },
    btnid: {
        type: Number,  // INTEGER in SQL becomes Number in MongoDB
        required: true
    },
    amount: {
        type: String,
        required: true
    },
    wonamount: {
        type: Number,  // FLOAT(17,2) becomes Number in MongoDB
        default: 0.00
    },
    isAutocashout: {
        type: Boolean,
        required: true
    },
    won: {
        type: Boolean,
        default: false
    },
    seed: {
        type: String,
        required: true
    },
    playername: {
        type: String,
        required: true
    },
    playerimage: {
        type: String,
        required: true
    },
    betid: {
        type: String,
        required: true
    }
}, {
    timestamps: true  // Automatically adds createdAt and updatedAt fields
});

// Create and export the model
const Players = mongoose.model('Players', PlayersSchema);
module.exports = Players;
