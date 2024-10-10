const express = require("express")
const socket = require("socket.io")
const http = require("http")
const Louch = require("./main/pilot")
const app = express()
const helmet = require("helmet")
const cors = require("cors")
const { configDb } = require("./dbconnection/index")
const cookies = require("express-cookie")
const sessions = require("express-session")
const routes = require("./routes/auth")
const jwt = require("jsonwebtoken")
const moduledata = require("./webdata/info.json")
let uTb = require("./model/clients/index")
let rTb = require("./model/rounds/index")
let pTb = require("./model/players/index")
let dTb = require("./model/main.js/main")
let oTb = require("./model/onlinePlayer/index")

async function configureDb() {
  let a, b, c, d, e
  try {
    a = await uTb.findAll({})
    b = await rTb.findAll({})
    c = await pTb.findAll({})
    d = await dTb.findAll({})
    e = await oTb.findAll({})
    return { a: a, b: b, c: c, d: d, e: e }
  } catch (e) {
    return { a: a, b: b, c: c, d: d, e: e }
  }
}

app.use(helmet({ contentSecurityPolicy: false }))
app.use(
  cors({
    origin: "*",
    methods: ["POST", "GET"],
    credentials: true,
  })
)

const server = http.createServer(app)
app.use(express.json())
app.use(
  sessions({
    secret: "anon-clones-demos",
    resave: false,
    saveUninitialized: true,
  })
)
app.use(cookies())

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
app.use((req, res) => res.status(404).json({ status: 404 }))

configDb()
  .then(async (success) => {
    await configureDb()
    Louch(io)
    server.listen(2024, async () => {
      console.log("programmes activated...")
    })
  })
  .catch((error) => {
    throw error
  })
