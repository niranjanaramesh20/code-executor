const {Server} = require("socket.io")
const {subscriber} = require("../config/pubsub")

function initWebsocket(server) {
    const io = new Server(server, {
        cors: {
            origin: "*"
        }
    })

    io.on("connection", socket => {
        console.log("Socket connected:", socket.id) 

        socket.on("join-job", jobId => {
            socket.join(jobId)
        })
    }) 

    subscriber.subscribe("job-completed")
        .then(() => console.log("Subscribed to job completed"))

    subscriber.on("message", (channel, message) => {
        const job = JSON.parse(message)
        io.to(job.jobId).emit(
            "job-completed",
            job
        )
    })

    return io
}

module.exports = initWebsocket
