import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Divider, Button, Stack } from "@mui/material";
import { useAuth } from "../context/useAuth";

export default function Profile() {

    const [user] = useState(() => {
        const savedUser = localStorage.getItem("user");

        return savedUser ? JSON.parse(savedUser) : null;
    });
    const navigate = useNavigate();
    const { logout: authLogout } = useAuth();

    useEffect(() => {
        if (!user) {
            navigate("/login");
        }
    }, [navigate, user]);

    const logout = () => {
        authLogout();            
        localStorage.removeItem("user");

        navigate("/login");
    };

    if (!user) {
        return (
            <Typography variant="h5" sx={{ mt: 6, textAlign: "center" }}>
                Loading...
            </Typography>
        );
    }

    return (
        <Box sx={{ maxWidth: 500, mx: "auto", mt: 6, px: 2 }}>
            <Typography variant="h4" gutterBottom>
                Profile
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Stack spacing={1}>
                <Typography>
                    <strong>Username:</strong> {user.username}
                </Typography>
                <Typography>
                    <strong>Email:</strong> {user.email}
                </Typography>
            </Stack>

            <Button
                variant="outlined"
                color="error"
                onClick={logout}
                sx={{ mt: 3 }}
            >
                Logout
            </Button>
        </Box>
    );
}
