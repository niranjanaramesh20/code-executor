import { Link, useNavigate } from 'react-router-dom'
import { AppBar, Toolbar, Button, Box } from '@mui/material'
import { useAuth } from "../context/useAuth"

function Navbar() {
    const { token, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()                      
        localStorage.removeItem("user")
        navigate("/login")
    }

    return (
        <AppBar position="static">
            <Toolbar sx={{ gap: 1 }}>
                <Button color="inherit" component={Link} to="/">Editor</Button>
                <Button color="inherit" component={Link} to="/projects">Projects</Button>
                <Button color="inherit" component={Link} to="/profile">Profile</Button>

                <Box sx={{ flexGrow: 1 }} />

                {token ? (
                    <Button color="inherit" onClick={handleLogout}>Logout</Button>
                ) : (
                    <Button color="inherit" component={Link} to="/login">Login</Button>
                )}
            </Toolbar>
        </AppBar>
    )
}

export default Navbar
