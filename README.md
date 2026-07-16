# Code Executor Frontend

A React frontend for writing, running, and saving code projects. It provides a Monaco-powered editor, supports JavaScript, Python, C, C++, and Java, and receives execution results from a companion backend in real time.

## Features

- Run code with optional standard input.
- Receive completed job output through Socket.IO, with polling as a fallback.
- Register and log in with token-based authentication.
- Save, reopen, update, and delete personal code projects.
- Dark Material UI interface with responsive layouts.

## Tech stack

- React 19 and Vite
- React Router
- Material UI
- Monaco Editor
- Socket.IO client

## Prerequisites

- Node.js 20 or later
- A compatible Code Executor backend running locally or at a reachable URL

## Getting started

Install the dependencies:

```bash
npm install
```

Create a `.env` file in the project root and point it at the backend:

```env
VITE_API_URL=http://localhost:5000
```

`VITE_API_URL` is optional; if it is not set, the application uses `http://localhost:5000`.

Start the development server:

```bash
npm run dev
```

Vite will print the local URL to open in a browser.

## Available commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server. |
| `npm run build` | Create a production build in `dist/`. |
| `npm run preview` | Serve the production build locally. |
| `npm run lint` | Run ESLint across the project. |

## Backend integration

The frontend expects the backend base URL configured by `VITE_API_URL` to expose these endpoints:

| Endpoint | Purpose |
| --- | --- |
| `POST /auth/register` | Create an account. |
| `POST /auth/login` | Authenticate and return a token plus user data. |
| `POST /run` | Submit `{ language, code, stdin }` and return a `jobId`. |
| `GET /jobs/:jobId` | Get an execution job's status and output. |
| `GET /projects` | List the authenticated user's projects. |
| `POST /projects` | Save a new project. |
| `GET /projects/:id` | Load a project. |
| `PUT /projects/:id` | Update a project. |
| `DELETE /projects/:id` | Delete a project. |

Protected project requests use `Authorization: Bearer <token>`. The backend should also support Socket.IO and emit `job-completed` events after the client joins a job room with `join-job` and the returned job ID.

## Project structure

```text
src/
├── components/    # Shared UI, including the navigation bar
├── config/        # API base URL configuration
├── context/       # Authentication provider and hook
├── pages/         # Editor, auth, profile, and projects screens
├── theme/         # Material UI theme
├── App.jsx        # Application routes and protected-route wrapper
└── main.jsx       # Application entry point
```

## Authentication and projects

Logging in stores the access token and user profile in browser local storage. The editor is publicly available, but saving projects and accessing the profile or project list requires a logged-in user.
