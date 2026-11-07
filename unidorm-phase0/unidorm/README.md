# UniDorm

University dormitory roommate matching web application (KBTU, Jastar City), based on the Figma prototype *Roommate Matching – Sprint 2 Prototype*.

Students answer a 15-question habits survey. A rule-based score compares them with possible roommates in five areas (Sleep 25%, Noise 20%, Cleanliness 20%, Visitors 20%, Study 15%). The housing manager reviews the results and makes the final decision. The system only recommends.

> **Status: Phase 0.** Project foundation only. No business features are implemented yet.

## Technology stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS v4, React Router |
| Backend | Python, FastAPI, SQLAlchemy 2.x |
| Database | PostgreSQL (driver: psycopg 3) |
| Tools | Git, GitHub, REST API, `.env` files |

## Requirements

- Node.js 20.19+ (or 22+) and npm
- Python 3.11+
- PostgreSQL (running locally)

## Installation

### 1. Database

Create a database and a user (run in `psql` as a superuser):

```sql
CREATE USER unidorm_user WITH PASSWORD 'choose-a-password';
CREATE DATABASE unidorm OWNER unidorm_user;
```

### 2. Backend

```bash
cd backend
python -m venv .venv
# Windows (PowerShell): .venv\Scripts\Activate.ps1
# macOS / Linux:        source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env      # Windows: copy .env.example .env
# edit .env and put your real password into DATABASE_URL
```

### 3. Frontend

```bash
cd frontend
npm install
```

## Running

Backend (from `backend/`, with the virtual environment active):

```bash
uvicorn app.main:app --reload --port 8000
```

- Liveness: <http://localhost:8000/api/health> → `{"status":"ok"}`
- Database check: <http://localhost:8000/api/health/db> → `{"status":"ok","database":"connected"}`
- Interactive docs: <http://localhost:8000/docs>

Frontend (from `frontend/`):

```bash
npm run dev
```

Open <http://localhost:5173>. The placeholder page shows whether the API is online. In development Vite proxies `/api` to port 8000.

Production build check: `npm run build` (from `frontend/`).

## Documentation

- [docs/PROJECT_ARCHITECTURE.md](docs/PROJECT_ARCHITECTURE.md)
- [docs/DEVELOPMENT_ROADMAP.md](docs/DEVELOPMENT_ROADMAP.md)

## Security

Never commit `.env` files. Only `.env.example` templates are tracked.
