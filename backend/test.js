const pool = require('./db')

async function test() {
    const result =
        await pool.query(
            "SELECT NOW()"
        )
    console.log(result.rows)    
}

test()