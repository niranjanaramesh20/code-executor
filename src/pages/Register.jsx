import { useState } from "react"
import { API_URL } from "../config/api"
import { useNavigate, Link as RouterLink } from "react-router-dom"
import { Box, Stack, TextField, Button, Typography, Link, Alert } from "@mui/material"

export default function Register() {
    const navigate = useNavigate()

    const [username, setusername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const register = async () => {
        try {
        const res = await fetch(
            `${API_URL}/auth/register`,
            {
                method: "POST",
                headers: {
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    username,
                    email,
                    password
                })
            }
        )
        const data = await res.json()

        if (!res.ok) {
            setSuccess("")
            setError(data.error)
            return
        }

        setError("")
        setSuccess("Registration successful! Redirecting to login...")
        setTimeout(() => navigate("/login"), 1500)
    } catch (err) {
        console.error(err)
        setError("Failed to connect to server")
    }
    }
    return (
        <Box sx={{ maxWidth: 400, mx: "auto", mt: 6, px: 2 }}>
            <Typography variant="h4" align="center" gutterBottom>
                Register
            </Typography>
            <Stack spacing={2}>
                <TextField
                    label="Username"
                    fullWidth
                    onChange={(e) => setusername(e.target.value)}
                />
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
                <Button variant="contained" onClick={register}>
                    Register
                </Button>
                {success && <Alert severity="success">{success}</Alert>}
                {error && <Alert severity="error">{error}</Alert>}
                <Typography variant="body2" align="center">
                    Already have an account?{" "}
                    <Link component={RouterLink} to="/">
                        Login
                    </Link>
                </Typography>
            </Stack>
        </Box>
    )
}
