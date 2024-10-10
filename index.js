require('./util/global-print')()
require('./blue-print.js')
const express = require("express")
const socket = require("socket.io")
const http = require("http")
const Louch = require("./main/pilot-mongo.js")
const app = express()
const helmet = require("helmet")
const cors = require("cors")
const cookies = require("express-cookie")
const sessions = require("express-session")
const routes = require("./routes/auth-mongo.js")
const jwt = require("jsonwebtoken")
const DATABASE_CONNECTION = require('./dbconnection/index-mongo')
const prepareDatabase = require('./util/mongo-db-pre-configure.js')
const MainBank = require('./model/offen/index-mongo.js')
app.use(helmet({ contentSecurityPolicy: false }))

app.use(
    cors()
)

const server = http.createServer(app)
app.use(express.json())
app.use(
    sessions({
        secret: "anon-clones-demos",
        resave: true,
        saveUninitialized: true,
    })
)
app.use(cookies())
app.post('/logout', (req, res) => {
    req.session.token = null
    return res.status(200).json({status: true})
})

app.use(express.static('./ims/'))
app.use(express.static('./build/'))
async function main() {
    try {

        await DATABASE_CONNECTION().then(data => {
            MainBank.deleteMany({}).then(d => {
                new MainBank({account: 90000000,main: "001",action: false}).save()
            }).catch(e => { throw e })
        })
        await prepareDatabase()

        const io = socket(server, {
            cors: {
              credentials: true,
            },
          })

        io.use((socket, next) => {
            try {
                const token = socket.handshake.query?.grant

                if (!token) {
                    return socket.emit("message", "you are not allowed to use this service!")
                }

                jwt.verify(token, "burden-oxen", (err, decoded) => {
                    if (err) {
                        socket.user = false
                        return next()
                    }
                    socket.user = decoded.id
                    return next()
                })
            } catch (e) {
                return socket.emit("message", "you are not allowed to use this service!")
            }
        })

        app.use("/", routes)
        app.use(express.static("./images"))

        server.listen(2024, async () => {
            Louch(io)
            print("programmes activated...")
        })


    } catch (error) {
        print('an error occured programme had stopped!')
        print(error)
        process.exit(1)
    }

}
main()
