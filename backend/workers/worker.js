const { Worker } = require("bullmq");
const fs = require("fs");
const { spawn } = require("child_process");
const path = require("path")
require("dotenv").config();

const languages = require("../config/languages");
const {publisher} = require("../config/pubsub")
const redis = require("../config/redis");

const extensions = {
    python: "py",
    javascript: "js",
    cpp: "cpp",
    c: "c",
    java: "java"
}

new Worker(
    "code-execution",

    async (job) => {
        console.log("Job received:", job.id);
        console.log(job.data);

        const { language, code, stdin } = job.data;
        let finalStatus = "failed";
        let resultPublished = false;

        const publishResult = async (status, output) => {
            finalStatus = status;

            await redis.set(
                `job:${job.id}`,
                JSON.stringify({
                    status,
                    output
                }),
                "EX",
                300
            );

            await publisher.publish(
                "job-completed",
                JSON.stringify({
                    jobId: job.id,
                    status,
                    output
                })
            );

            resultPublished = true;
        };

        const config = languages[language];

        if (!config) {
            await publishResult("failed", `Unsupported language: ${language}`);
            throw new Error(`Unsupported language: ${language}`);
        }

        const jobsRoot = process.env.JOBS_DIR || path.join(__dirname, "..", "temp")
        const jobDir = path.join(jobsRoot, job.id.toString())

        fs.mkdirSync(jobDir, {recursive: true})

        const filename = `Main.${extensions[language]}`

        const filepath = path.join(jobDir, filename)

        fs.writeFileSync(filepath, code)

        const containerName = `job-${job.id}`

        const args = [
            "run",
            "--rm",
            "-i",
            "--name", containerName,
            "--network", "none",
            "--memory", "128m",
            "--cpus", "0.5",
            "-v", `${jobDir}:/app`,
            config.image,
            "sh",
            "-c",
            config.command
        ];

try {
    const child = spawn("docker", args);

    let output = "";
    let errorOutput = "";
    let timedOut = false;
    let spawnError = null;

    const timeout = setTimeout(() => {
        timedOut = true;
        errorOutput = "Execution timed out (5 seconds).";
        // SIGTERM to the docker CLI does not reliably stop the container
        // (a program can ignore it), so force-kill the container by name.
        const killer = spawn("docker", ["kill", containerName]);
        killer.on("error", () => {});
        child.kill();
    }, 5000);

    if (stdin) {
        child.stdin.write(stdin);
    }

    child.stdin.end();

    child.stdout.on("data", (data) => {
        output += data.toString();
    });

    child.stderr.on("data", (data) => {
        errorOutput += data.toString();
    });

    child.on("error", (err) => {
        spawnError = err;
        errorOutput = err.message;
    });

    const { exitCode, signal } = await new Promise((resolve) => {
        child.on("close", (exitCode, signal) => {
            clearTimeout(timeout);
            resolve({ exitCode, signal });
        });
    });

    output = output.trim();
    errorOutput = errorOutput.trim();

    const status =
        !spawnError && !timedOut && exitCode === 0 && !signal
            ? "completed"
            : "failed";

    if (status === "failed" && !errorOutput) {
        errorOutput = `Execution failed with exit code ${exitCode ?? "unknown"}${signal ? ` and signal ${signal}` : ""}.`;
    }

    await publishResult(status, errorOutput || output);

    if (status === "failed") {
        throw new Error(errorOutput || output || "Execution failed.");
    }

} catch (err) {
    console.error("Worker error:", err);

    if (!resultPublished) {
        await publishResult("failed", err.message);
    }

    throw err;

} finally {
    try {
        fs.rmSync(jobDir, {
            recursive: true,
            force: true
        });
    } catch (err) {
        console.error(
            "Failed to delete temp directory:",
            err.message
        );
    }

    console.log(`Job ${job.id} finished with status: ${finalStatus}.`);
}
    },

    {
        connection: {
            host: process.env.REDIS_HOST || "127.0.0.1",
            port: Number(process.env.REDIS_PORT) || 6379
        }
    }
);
