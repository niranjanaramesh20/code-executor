const {Pool} = require('pg')

const pool = new Pool({
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || "code_executor"
})

pool.connect()
    .then(client => {
        console.log("Connected to PostgreSQL")
        client.release()
    }) 
    .catch(err => {
        console.error("PostgreSQL connection failed", err.message)
    })

module.exports = pool
