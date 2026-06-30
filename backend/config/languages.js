module.exports = {
    python: {
        image: "python:3.12-slim",
        command: "python3 /app/Main.py"
    },
    javascript: {
        image: "node:22-alpine",
        command: "node /app/Main.js"
    },
    cpp: {
        image: "gcc:14",
        command: 'g++ /app/Main.cpp -o /app/a.out && /app/a.out'
    },
    c: {
        image: "gcc:14",
        command: 'gcc /app/Main.c -o /app/a.out && /app/a.out'
    },
    java: {
        image: "eclipse-temurin:21",
        command: "javac /app/Main.java && java -cp /app Main"
    }
}
