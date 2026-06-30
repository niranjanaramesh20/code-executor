import { useState } from "react"
import { useAuth } from "../context/useAuth"
import { useNavigate, Link as RouterLink } from "react-router-dom"
import { API_URL } from "../config/api"
import { Box, Stack, TextField, Button, Typography, Link, Alert } from "@mui/material"

export default function Login() {
    const { login } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const submit = async () => {
        const res = await fetch (
            `${API_URL}/auth/login`,
            {
                method:"POST",
                headers: {
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    email,
                    password
                })
            }
        )
        const data = await res.json()

        if (data.token) {
            login(data.token)
            localStorage.setItem("user",
                JSON.stringify(data.user)
            )
            setError("")
            setSuccess("Login successful! Redirecting...")
            setTimeout(() => navigate("/"), 1000)
        } else {
            setSuccess("")
            setError(data.error || "Login failed")
        }
    }
    return (
        <Box sx={{ maxWidth: 400, mx: "auto", mt: 6, px: 2 }}>
            <Typography variant="h4" align="center" gutterBottom>
                Login
            </Typography>
            <Stack spacing={2}>
                <TextField
                    label="Email"
                    fullWidth
                    onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                    label="Password"
                    type="password"
                    fullWidth
                    onChange={(e) => setPassword(e.target.value)}
                />
                <Button variant="contained" onClick={submit}>
                    Login
                </Button>
                {success && <Alert severity="success">{success}</Alert>}
                {error && <Alert severity="error">{error}</Alert>}
                <Typography variant="body2" align="center">
                    Don't have an account?{" "}
                    <Link component={RouterLink} to="/register">
                        Register
                    </Link>
                </Typography>
            </Stack>
        </Box>
    )
}
