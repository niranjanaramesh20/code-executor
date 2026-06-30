const express = require("express")
const rateLimit = require("express-rate-limit")
const codeQueue = require("../config/queue")
const languages = require("../config/languages")
const redis = require("../config/redis")
const {MAX_CODE_SIZE, MAX_INPUT_SIZE} = require("../config/limits")

const router = express.Router()

// Limit code submissions to curb abuse (the /run endpoint is public).
const runLimiter = rateLimit({
    windowMs: 60 * 1000,   // 1 minute
    max: 20,               // 20 runs per IP per minute
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many runs. Please wait a moment and try again." }
})

router.post('/run', runLimiter, async (req, res) => {

    const { language, code, stdin } = req.body

    if ( typeof language !== "string" || typeof code !== "string") {
        return res.status(400).json({
            error: "Invalid request body"
        })
    }
    
    if (!languages[language]) {
        return res.status(400).json({
            error: "Unsupported language"
        })
    }

    if (code.length > MAX_CODE_SIZE) {
        return res.status(413).json({
            error: "Code too large"
        })
    }

    if (stdin !== undefined && typeof stdin !== "string") {
        return res.status(400).json({
            error: "stdin must be a string"
        })
    }

    if (stdin && stdin.length > MAX_INPUT_SIZE) {
        return res.status(413).json({
            error: "Input too large"
        })
    }
    
    console.log(`language: ${language}`)
    console.log(`code size: ${code.length} characters`)
    console.log(`stdin size: ${stdin ? stdin.length : 0}`)

    //creates BullMQ job
    try{
        const job = await codeQueue.add(
            "execute", {
                language,
                code,
                stdin
            }       
        )
    
        res.status(202).json({
            jobId: job.id
        })

    } catch(err) {
        console.error(err)

        res.status(500).json({
            error: err.message
        })
    }

});

router.get("/jobs/:id", async(req, res) => {

    try {
        const result = await redis.get(
            `job:${req.params.id}`
        )

        if (result) {
            return res.status(200).json(JSON.parse(result))
        }

        // No cached result: distinguish a still-running job from an
        // unknown/expired one so the client doesn't poll "running" forever.
        const job = await codeQueue.getJob(req.params.id)

        if (!job) {
            return res.status(404).json({
                error: "Job not found"
            })
        }

        res.status(200).json({
            status: "running"
        })

    } catch(err) {
        console.error(err)

        res.status(500).json({
            error: err.message
        })
    } 

});

module.exports = router
