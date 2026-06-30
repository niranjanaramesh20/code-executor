const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const pool = require("../config/db");

const router = express.Router();

router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    if (
        typeof username !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string"
    ) {
        return res.status(400).json({
            error: "Invalid request body"
        });
    }

    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (
        !normalizedUsername ||
        !normalizedEmail ||
        !password.trim()
    ) {
        return res.status(400).json({
            error: "All fields are required"
        });
    }

    if (normalizedUsername.length < 3) {
        return res.status(400).json({
            error: "Username must be at least 3 characters long"
        });
    }

    if (normalizedUsername.length > 30) {
        return res.status(400).json({
            error: "Username cannot exceed 30 characters"
        });
    }

    if (!validator.isEmail(normalizedEmail)) {
        return res.status(400).json({
            error: "Invalid email address"
        });
    }

    if (password.length < 8) {
        return res.status(400).json({
            error: "Password must be at least 8 characters long"
        });
    }

    const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            error:
                "Password must contain uppercase, lowercase, number and special character"
        });
    }

    try {
        const existing = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [normalizedEmail]
        );

        if (existing.rowCount > 0) {
            return res.status(409).json({
                error: "Email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `
            INSERT INTO users
            (username, email, password_hash)
            VALUES ($1, $2, $3)
            RETURNING id, username, email
            `,
            [
                normalizedUsername,
                normalizedEmail,
                hashedPassword
            ]
        );

        res.status(201).json(result.rows[0]);

    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: err.message
        });
    }
});

router.post("/login", async (req, res) => {

    const { email, password } = req.body;

    if (
        typeof email !== "string" ||
        typeof password !== "string"
    ) {
        return res.status(400).json({
            error: "Invalid request body"
        });
    }

    const normalizedEmail = email.trim().toLowerCase();

    try {

        const result = await pool.query(
            `
            SELECT
                id,
                username,
                email,
                password_hash
            FROM users
            WHERE email = $1
            `,
            [normalizedEmail]
        );

        if (result.rowCount === 0) {
            return res.status(401).json({
                error: "Invalid email or password"
            });
        }

        const user = result.rows[0];

        const match = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!match) {
            return res.status(401).json({
                error: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: err.message
        });
    }
});

module.exports = router;