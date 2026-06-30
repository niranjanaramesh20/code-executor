const Redis = require("ioredis")

const publisher = new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT) || 6379
})

const subscriber = new Redis ({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT) || 6379
})

module.exports = {
    publisher,
    subscriber
}
