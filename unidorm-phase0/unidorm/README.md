# UniDorm

University dormitory roommate matching web application (KBTU, Jastar City), based on the Figma prototype *Roommate Matching – Sprint 2 Prototype*.

Students answer a 15-question habits survey. A rule-based score compares them with possible roommates in five areas (Sleep 25%, Noise 20%, Cleanliness 20%, Visitors 20%, Study 15%). The housing manager reviews the results and makes the final decision. The system only recommends.

> **Status: Stage 1 – basic interface.** Two portal layouts (Student and Housing manager), navigation, reusable UI components, all pages with sample data, and a minimal backend (health check, PostgreSQL connection, `User` model). Authentication, survey, scoring and room assignment are later stages.

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

Create the `users` table (Stage 1 has a single model):

```bash
python -m app.db.init_db      # prints: Tables in the database: users
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

Open <http://localhost:5173> (it redirects to `/student/home`). The sidebar footer shows whether the API is online. In development Vite proxies `/api` to port 8000.

| Student portal | Housing manager portal |
|---|---|
| `/student/home` | `/manager/rooms` |
| `/student/accommodation` | `/manager/dashboard` (LATER) |
| `/student/roommate-matching` (MODULE) | `/manager/feedback` (LATER) |
| `/student/documents` | `/manager/relocations` (LATER) |
| `/student/payments` (LATER) | |
| `/student/help` | |

The Student / Housing manager switch in the header is a demo device from the prototype. Pages show sample data from `frontend/src/data/`, kept separate from the UI so it can be replaced by API responses.

Production build check: `npm run build` (from `frontend/`).

## Documentation

- [docs/PROJECT_ARCHITECTURE.md](docs/PROJECT_ARCHITECTURE.md)
- [docs/DEVELOPMENT_ROADMAP.md](docs/DEVELOPMENT_ROADMAP.md)

## Security

Never commit `.env` files. Only `.env.example` templates are tracked.
