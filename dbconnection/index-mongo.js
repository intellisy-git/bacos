require('../util/global-print')()
const mongoose = require('mongoose')
const webdata = require('../webdata/info.json')

module.exports = async function DatabaseConnection() {
    mongoose.Promise = global.Promise
    return await new Promise((next, stops) => {

        mongoose.connection.on('connected', status => print('database connection successfully'))
        mongoose.connection.on('error', error => print('database error:: %s', error))
        mongoose.connection.on('disconnected', data => print('unexepected desconnection occured! %s', data))
        mongoose.connection.on('disconnect', data => print('unexepected desconnection occured! %s', data))

        mongoose.connect(`${webdata['mongodb-url']}`, { useNewUrlParser: true, useUnifiedTopology: true, serverSelectionTimeoutMS: 50000})
            .then(callback => next({ status: 1, error: null }))
            .catch(error => next({ status: 0, error: error }))
    })
}