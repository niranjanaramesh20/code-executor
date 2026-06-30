# Code Executor

A full-stack code execution app with a React frontend, Express backend, PostgreSQL for saved projects, Redis/BullMQ for job handling, and a worker that runs submitted code in Docker containers.

## Requirements

- Node.js
- PostgreSQL
- Redis
- Docker

Docker is still required at runtime for executing submitted code. This repo does not include Docker Compose or Dockerfiles, so set up the services manually.

## Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npm start
```

Create the PostgreSQL database, then run `backend/db/init.sql`.

Start the worker in another terminal:

```bash
cd backend
node workers/worker.js
```

Pull the runtime images used by the worker:

```bash
docker pull node:22-alpine
docker pull python:3.12-slim
docker pull gcc:14
docker pull eclipse-temurin:21
```

## Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Checks

```bash
cd frontend
npm run lint
npm run build
```
