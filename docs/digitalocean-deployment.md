# Deploying Codemorpher on DigitalOcean

This guide covers deploying the Codemorpher app (frontend + backend) to **DigitalOcean App Platform** using the existing Docker setup.

## Prerequisites

- A [DigitalOcean](https://www.digitalocean.com/) account
- This repo connected to GitHub/GitLab (or use DO Container Registry)
- Backend API keys (OpenRouter, Google AI, etc.) for translation services

## Architecture

- **Backend**: Node.js (Express) in Docker, port `8080`, SQLite DB, file uploads in `uploads/`
- **Frontend**: Static build served by Nginx in Docker, port `80`; Nginx proxies `/translate`, `/upload`, `/history`, `/ping` to the backend using `BACKEND_URL`

Both Dockerfiles are at repo root level: `backend/Dockerfile` and `frontend/Dockerfile`.

---

## Option 1: App Platform (recommended)

### 1. Create the app

1. In [DigitalOcean Control Panel](https://cloud.digitalocean.com/apps), click **Create App**.
2. Connect your repository and select this repo.
3. Choose **Branch** (e.g. `main`).

### 2. Add the backend service

1. Click **Add Resource** → **Service**.
2. Configure:
   - **Source**: Repository; **Dockerfile Path**: `backend/Dockerfile`
   - **Name**: e.g. `backend`
   - **HTTP Port**: `8080`
3. Under **Environment Variables**, add (replace with your values):
   - `NODE_ENV` = `production`
   - `PORT` = `8080`
   - Any keys your backend needs (e.g. OpenRouter, Google AI). Check `backend/server.js` and `.env` for names.
   - **Optional** (for persistent DB): `DB_PATH` = `/data/db/codemorpher.db` and add a **Volume** mounted at `/data`.
4. **Optional – persistent database**: Add a Volume to this service:
   - Mount path: `/data`
   - The app will create `db` under `/data` if you set `DB_PATH=/data/db/codemorpher.db`.
5. Save.

### 3. Add the frontend service

1. Click **Add Resource** → **Service** (or **Static Site** if you prefer; here we use the Docker frontend).
2. Configure:
   - **Source**: Repository; **Dockerfile Path**: `frontend/Dockerfile`
   - **Name**: e.g. `frontend`
   - **HTTP Port**: `80`
3. Under **Environment Variables**, add:
   - `BACKEND_URL` = your backend URL:
     - **Same app**: use the internal URL, e.g. `http://backend:8080` (replace `backend` with your backend service name if different).
     - **Public URL**: e.g. `https://your-backend-xxxx.ondigitalocean.app` (no trailing slash).
4. Save.

### 4. Routes (optional)

- To put the frontend behind a single public URL, add a **Router** or use the default route to the frontend service so users hit the Nginx app; Nginx will proxy API calls to `BACKEND_URL`.

### 5. Deploy

- Push to the connected branch or click **Deploy** in the App Platform UI. Builds use `backend/Dockerfile` and `frontend/Dockerfile`; no code changes required if the repo already has these.

---

## Option 2: Droplets (Docker Compose)

You can run the same images on one or two Droplets using Docker Compose.

1. **Backend**  
   - Build: `docker build -t codemorpher-backend ./backend`  
   - Run with `PORT=8080`, `DB_PATH`, and env vars for API keys; mount a volume for `/data` if using `DB_PATH=/data/db/codemorpher.db`.

2. **Frontend**  
   - Build: `docker build -t codemorpher-frontend ./frontend`  
   - Run with `BACKEND_URL=http://<backend-host>:8080` (or internal IP if on same network).

3. Put a load balancer or reverse proxy (e.g. Nginx or Caddy) in front of the frontend container and optionally the backend if you expose it.

---

## Dockerfiles summary

| Component | Dockerfile        | Port | Notes |
|----------|-------------------|------|--------|
| Backend  | `backend/Dockerfile`  | 8080 | `PORT=8080`, `node server.js`, non-root user, `uploads` dir created |
| Frontend | `frontend/Dockerfile` | 80   | Vite build → Nginx; `BACKEND_URL` substituted at runtime for proxy |

- **Backend**: Expects `PORT` (default in code is 5000; Dockerfile sets 8080). Uses SQLite; set `DB_PATH` and a volume for persistence.
- **Frontend**: Expects `BACKEND_URL` (e.g. `http://backend:8080` or public backend URL). No trailing slash.

---

## Troubleshooting

- **502 / connection errors from frontend**: Ensure `BACKEND_URL` is correct and reachable from the frontend container (same app internal hostname or public URL).
- **Backend build fails (e.g. better-sqlite3)**: Build runs on `node:22-alpine`; if you see native module errors, ensure the same Node version and base image in both build and run stages (current Dockerfile already does this).
- **Database not persisting**: Set `DB_PATH` to a path on a mounted volume (e.g. `/data/db/codemorpher.db`) and mount that volume in the backend service.
