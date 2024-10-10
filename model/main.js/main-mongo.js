const mongoose = require('mongoose')
const crypto = require("crypto")

const MainPilotSchema = mongoose.Schema({
    id: {
        type: String,
        required: false,
        default: crypto.randomBytes(50).toString("hex")
    },
    code: {
        type: String,
        required: false,
        default: "P001",
    },
    flying: {
        type: Boolean,
        require: false,
        default: false
    }
})

const MainPilotModel = mongoose.model('MainPilot', MainPilotSchema)
module.exports = MainPilotModel