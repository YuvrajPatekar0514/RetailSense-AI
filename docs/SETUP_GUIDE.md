# Setup Guide

## Requirements

- Python and Node.js/npm installed on Windows.
- Git checkout of this repository.
- SQLite for the default local run; SQLite is created as a local file by SQLAlchemy.

Dependencies are declared in `requirements.txt` and `frontend/package.json`. A virtual environment is recommended.

## Windows PowerShell

Run from the repository root. If PowerShell blocks activation, the process-scoped execution policy below applies only to the current shell.

```powershell
cd "D:\Project\RetailSense AI - Multi Agent Autonomous Retail Intelligence & Decision System"
py -m venv .venv
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

Open another integrated terminal in VS Code for the frontend:

```powershell
cd "D:\Project\RetailSense AI - Multi Agent Autonomous Retail Intelligence & Decision System\frontend"
npm install
```

## Initialize, Seed, and Run

Backend terminal from repository root:

```powershell
.\.venv\Scripts\Activate.ps1
python database\init_db.py
python database\seed_data.py
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

Frontend terminal from `frontend/`:

```powershell
npm run dev
```

Visit `http://127.0.0.1:5173/`, API docs `http://127.0.0.1:8000/docs`, and health `http://127.0.0.1:8000/health`. Vite is configured to proxy `/api` to the backend on 8000. If that port is taken, stop the existing server or update both the backend and `frontend/vite.config.js` proxy target to the same port.

## Environment

The default configuration uses development mode and local SQLite. `.env.example` has placeholder values; it contains no real key. Do not overwrite an existing `.env`. Demo users are added only in development, and seeding does not reset existing user hashes. Demo credentials are for local evaluation only; do not reuse in deployments.

`OPENAI_API_KEY` is optional for the standalone LLM wrapper. The LangGraph API path runs without it and does not call that wrapper. If testing the optional client, provide the key to the process environment securely rather than committing it.

## Tests and Build

From the repository root:

```powershell
python -m pytest -q
```

From `frontend/`:

```powershell
npm run build
```

No frontend lint script is currently configured.

## macOS/Linux

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
[ -f .env ] || cp .env.example .env
python database/init_db.py
python database/seed_data.py
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

In a second terminal: `cd frontend && npm install && npm run dev`.

## Troubleshooting

- **`password cannot be longer than 72 bytes` during Passlib startup:** install dependencies from requirements; bcrypt must remain below version 5 for Passlib 1.7's backend compatibility.
- **SQLite driver not found:** reinstall requirements; `aiosqlite` is required by the default URL.
- **EmailStr validator missing:** reinstall requirements; `email-validator` is a runtime dependency.
- **Port already in use:** use `Get-NetTCPConnection -LocalPort 8000` or `-LocalPort 5173` to identify an existing listener. Avoid starting duplicate servers.
- **No data shown:** run initialization and seeding from the repository root so relative data paths resolve correctly.
- **OpenAI unavailable:** the optional client returns a deterministic local fallback when no key is set or the provider call fails.
