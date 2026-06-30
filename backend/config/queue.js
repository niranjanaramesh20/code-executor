const { Queue } = require("bullmq")

const codeQueue = new Queue("code-execution", {
    connection: {
	host: process.env.REDIS_HOST || "127.0.0.1",
	port: Number(process.env.REDIS_PORT) || 6379
    }
})

module.exports = codeQueue
