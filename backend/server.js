const http = require("http")
const express = require('express')
const cors = require('cors')
require("dotenv").config()

const runRoutes = require("./routes/run")
const projectRoutes = require("./routes/projects")
const initWebsocket = require("./services/websocket")

const PORT = process.env.PORT || 5000

const app = express()
const server = http.createServer(app)

const authRoutes = require("./routes/auth")

app.use(cors())
app.use(express.json({ limit: "200kb" })) //converts JSON into js objects; limit must exceed MAX_CODE_SIZE + MAX_INPUT_SIZE
app.use(runRoutes)
app.use(projectRoutes)
app.use("/auth", authRoutes)

// Error handler: return consistent JSON for body-parser failures
app.use((err, req, res, next) => {
    if (err.type === "entity.too.large") {
        return res.status(413).json({ error: "Request body too large" })
    }
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({ error: "Invalid JSON body" })
    }
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
})

initWebsocket(server)

server.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
})
