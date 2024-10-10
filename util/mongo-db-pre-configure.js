const MainPilotModel = require('../model/main.js/main-mongo')
require('./global-print')()
module.exports = async function prepareDatabase() {
    try {
        await createAviator()
        async function createAviator() {

            const isAviatorAvailable = await MainPilotModel.find({ code: 'P001' })
            if (!isAviatorAvailable.length) await new MainPilotModel({ flying: true }).save()

        }
        return 'OK'
    } catch (e) {
        print(e)
        process.exit(1)
    }
}