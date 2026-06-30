import { useCallback, useEffect, useState } from "react"
import { useAuth } from "../context/useAuth"
import { API_URL } from "../config/api"
import { useNavigate } from "react-router-dom"
import {
    Box,
    Stack,
    Paper,
    Typography,
    Button
} from "@mui/material"

function MyProjects () {

    const { token } = useAuth()
    const [projects, setProject] = useState([])
    const navigate = useNavigate()
    const loadProjects = useCallback(async() => {
        if (!token) return []

        const res = await fetch(
            `${API_URL}/projects`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )
        const data = await res.json()

        if (!res.ok) {
            return []
        }

        return Array.isArray(data) ? data : []
    }, [token])

    useEffect(() => {
        let cancelled = false

        loadProjects().then((projectList) => {
            if (!cancelled) {
                setProject(projectList)
            }
        })

        return () => {
            cancelled = true
        }
    }, [loadProjects])

    const deleteProject = async(id) => {
        await fetch (
            `${API_URL}/projects/${id}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )

        setProject(
            projects.filter(
                project => project.id !== id
            )
        )

        setProject(await loadProjects())
    }

    return (
        <Box sx={{ maxWidth: 600, mx: "auto", mt: 4, px: 2 }}>
            <Typography variant="h4" gutterBottom>
                My Projects
            </Typography>

            {projects.length === 0 && (
                <Typography color="text.secondary">
                    No projects yet.
                </Typography>
            )}

            <Stack spacing={2}>
                {projects.map(project => (
                    <Paper
                        key={project.id}
                        variant="outlined"
                        sx={{
                            p: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between"
                        }}
                    >
                        <Typography>{project.name}</Typography>

                        <Stack direction="row" spacing={1}>
                            <Button
                                variant="contained"
                                size="small"
                                onClick={() => navigate("/", {
                                    state: { projectId: project.id }
                                })}
                            >
                                Open
                            </Button>
                            <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                onClick={() => deleteProject(project.id)}
                            >
                                Delete
                            </Button>
                        </Stack>
                    </Paper>
                ))}
            </Stack>
        </Box>
    )
}

export default MyProjects
