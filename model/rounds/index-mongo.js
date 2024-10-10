const mongoose = require('mongoose');
// Define the RoundsModel schema
const RoundsSchema = new mongoose.Schema({
    roundId: {
        type: String
    },
    multplier: {
        type: String,  // Assuming this is stored as a string; use Number if it's numeric
        required: true,
        unique: false
    },
    seeds: {
        type: String,  // TEXT in SQL is treated as String in MongoDB
        required: true,
        unique: false
    }
}, {
    timestamps: true  // Adds createdAt and updatedAt fields
});

// // Optional: Auto-increment logic using a Counter collection for `id` field
// RoundsSchema.pre('save', async function (next) {
//     if (!this.id) {
//         const Counter = mongoose.model('Counter');
//         const counter = await Counter.findOneAndUpdate(
//             { _id: 'roundId' },
//             { $inc: { seq: 1 } },
//             { new: true, upsert: true }
//         );
//         this.id = counter.seq;
//     }
//     next();
// });

// // Define the Counter schema for auto-increment functionality (Optional)
// const CounterSchema = new mongoose.Schema({
//     _id: {
//         type: String
//     },
//     seq: {
//         type: Number
//     }
// });

// // Create models for Rounds and Counter (optional for auto-increment)
// const Counter = mongoose.model('Counter', CounterSchema);
const RoundsModel = mongoose.model('RoundsModel', RoundsSchema);

module.exports = RoundsModel;
