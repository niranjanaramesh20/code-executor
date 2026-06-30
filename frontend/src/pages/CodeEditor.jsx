import Editor from "@monaco-editor/react";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/useAuth";
import { API_URL } from "../config/api";
import {
    Box,
    Stack,
    Button,
    Select,
    MenuItem,
    Paper,
    Typography,
    TextField
} from "@mui/material";

const socket = io(API_URL);

function CodeEditor({ projectId }) {
    const [code, setCode] = useState("");
    const [language, setLanguage] = useState("javascript");
    const [output, setOutput] = useState("");
    const [stdin, setStdin] = useState("");
    const [projectName, setProjectName] = useState("");

    const { token } = useAuth();

    useEffect(() => {
        socket.on("job-completed", (job) => {
            setOutput(job.output);
        });

        return () => {
            socket.off("job-completed");
        };
    }, []);

    useEffect(() => {
        if (!projectId || !token) return;

        async function loadProject() {
            try {
                const res = await fetch(
                    `${API_URL}/projects/${projectId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const project = await res.json();

                if (!res.ok) {
                    setOutput(project.error);
                    return;
                }

                setProjectName(project.name);
                setCode(project.source_code);
                setLanguage(project.language);

            } catch (err) {
                console.error(err);
                setOutput("Failed to load project.");
            }
        }

        loadProject();

    }, [projectId, token]);

    const handleRun = async () => {
        try {
            const res = await fetch(`${API_URL}/run`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    language,
                    code,
                    stdin
                })
            });

            const data = await res.json();

            if (!res.ok) {
                setOutput(data.error || "Failed to run code");
                return;
            }

            setOutput("Running...");

            socket.emit("join-job", data.jobId);

            const startedAt = Date.now();

            const poll = async () => {
                const statusRes = await fetch(
                    `${API_URL}/jobs/${data.jobId}`
                );

                const status = await statusRes.json();

                if (!statusRes.ok) {
                    return;
                }

                if (status.status !== "running") {
                    setOutput(status.output);
                } else if (Date.now() - startedAt < 15000) {
                    setTimeout(poll, 1000);
                }
            };

            poll();

        } catch (err) {
            console.error(err);
            setOutput("Failed to connect to server.");
        }
    };

    const saveProject = async () => {
        if (!token) {
            setOutput("Please login to save projects.");
            return;
        }

        let name = projectName;

        if (!projectId) {
            name = prompt("Project Name");

            if (!name) return;

            setProjectName(name);
        }

        const url = projectId
            ? `${API_URL}/projects/${projectId}`
            : `${API_URL}/projects`;

        try {

            const res = await fetch(url, {
                method: projectId ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name,
                    language,
                    code
                })
            });

            const data = await res.json();

            if (!res.ok) {
                setOutput(data.error);
                return;
            }

            setOutput(
                projectId
                    ? "Project updated successfully."
                    : "Project saved successfully."
            );

        } catch (err) {
            console.error(err);
            setOutput("Failed to save project.");
        }
    };

    return (
        <Box sx={{ maxWidth: 1100, mx: "auto", px: { xs: 2, md: 4 }, py: 2 }}>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }} alignItems="center">
                <Select
                    size="small"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                >
                    <MenuItem value="javascript">JavaScript</MenuItem>
                    <MenuItem value="python">Python</MenuItem>
                    <MenuItem value="c">C</MenuItem>
                    <MenuItem value="cpp">C++</MenuItem>
                    <MenuItem value="java">Java</MenuItem>
                </Select>

                <Button variant="contained" onClick={handleRun}>
                    Run
                </Button>

                <Button variant="outlined" onClick={saveProject}>
                    Save
                </Button>
            </Stack>

            <Editor
                height="60vh"
                theme="vs-dark"
                language={language}
                value={code}
                onChange={(value) => setCode(value || "")}
            />

            <Paper variant="outlined" sx={{ mt: 2, p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Output
                </Typography>
                <Box
                    component="pre"
                    sx={{ m: 0, whiteSpace: "pre-wrap", fontFamily: "monospace" }}
                >
                    {output}
                </Box>
            </Paper>

            <TextField
                label="Input"
                placeholder="Enter input"
                multiline
                minRows={3}
                fullWidth
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                sx={{ mt: 2 }}
            />
        </Box>
    );
}

export default CodeEditor;
