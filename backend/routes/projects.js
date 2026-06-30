const express = require("express")
const pool = require("../config/db")
const {MAX_PROJECT_NAME} = require("../config/limits")
const auth = require("../middleware/auth")

const router = express.Router()

router.post("/projects", auth, async (req, res) => {

    const {
        name,
        language,
        code
        } = req.body;

    if (typeof name !== "string" || typeof language !== "string" || typeof code !== "string") {
        return res.status(400).json({
            error: "Name, language and code are required"
        })
    }    

    if (!name.trim()) {
        return res.status(400).json({
            error: "Project name is required"
        })
    }

    if (name.length > MAX_PROJECT_NAME) {
        return res.status(400).json({
            error: "Project name is too long"
        })
    }

    try{
        const result = await pool.query(
            `INSERT INTO projects
            (user_id, name, language, source_code)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            
            [req.user.id, name.trim(), language, code]
        )
        
        res.status(201).json(result.rows[0])

    } catch(err) {
        console.error(err)

        res.status(500).json({
        error: err.message
        })
    }

});

router.get("/projects", auth, async (req, res) => {

    try {
        const result = await pool.query(
            `SELECT * 
            FROM projects
            WHERE user_id = $1
            ORDER BY id DESC`,

            [req.user.id]
        )   

        res.status(200).json(
            result.rows
        )

    } catch(err) {
        console.error(err)

        res.status(500).json({
            error: err.message
        })
    }

});

router.get("/projects/:id", auth, async (req, res) => {

    try {
        const result = await pool.query(
            `SELECT *
            FROM projects
            WHERE id = $1
            AND user_id = $2`,

            [req.params.id, req.user.id]
        )

        if (result.rowCount === 0) {
            return res.status(404).json({
                error: "Project not found"
            })
        }

        res.status(200).json(result.rows[0])

    } catch(err) {
        console.error(err)

        res.status(500).json({
            error: err.message
        })
    }

});

router.put("/projects/:id", auth, async(req, res) => {
    const {name, language, code} = req.body

    if (!name || !language || !code) {
        return res.status(400).json({
            error: "Name, language and code are required"
        })
    }

    if (!name.trim()) {
        return res.status(400).json({
            error: "Project name is required"
        })
    }

    if (name.length > MAX_PROJECT_NAME) {
        return res.status(400).json({
            error: "Project name is too long"
        })
    }

    try {
        const result = await pool.query(
            `UPDATE projects
            SET
                name=$1,
                language=$2,
                source_code=$3
            WHERE id = $4 
            AND user_id = $5
            RETURNING *   
            `,
            [name.trim(), language, code, req.params.id, req.user.id]
        )

        if (result.rowCount === 0) {
            return res.status(404).json({
                error: "Project not found"
            })
        }

        res.status(200).json(result.rows[0])

    } catch (err) {
        console.error(err)

        res.status(500).json({
            error: err.message
        })
    }

}); 

router.delete( "/projects/:id", auth, async (req, res) => {

    try {
        const result = await pool.query(
            `DELETE FROM projects
            WHERE id = $1
            AND user_id = $2
            RETURNING *`,

            [req.params.id, req.user.id]
        )   

        if (result.rowCount === 0) {
            return res.status(404).json({
                error: "Project not found"
            })
        }

        res.sendStatus(204)

    } catch(err) {
        console.error(err)

        res.status(500).json({
            error: err.message
        })
    } 

});

module.exports = router
