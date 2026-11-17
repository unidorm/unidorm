# UniDorm

University dormitory roommate matching web application (KBTU, Jastar City), based on the Figma prototype *Roommate Matching – Sprint 2 Prototype*.

Students answer a 15-question habits survey. A rule-based score compares them with possible roommates in five areas (Sleep 25%, Noise 20%, Cleanliness 20%, Visitors 20%, Study 15%). The housing manager reviews the results and makes the final decision. The system only recommends.

> **Status: Phase 2 – Student Portal.** Students register and sign in, see their dashboard, choose a room type and fill in the 15-question habits questionnaire, which is saved and submitted through the API. The Housing manager portal still shows sample data (Phase 3). Scoring and room assignment are later stages.

## Technology stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS v4, React Router; fonts Unbounded + Nunito (bundled via @fontsource) |
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

Create or update the tables and load the questionnaire (safe to run again; it also upgrades a Stage 1 database):

```bash
python -m app.db.init_db
# prints: Tables in the database: auth_sessions, survey_answer_options, survey_answers,
#         survey_categories, survey_options, survey_questions, survey_responses, users
```

The 15 questions come from the Week 3 F1 deliverable and live in `backend/app/db/survey_seed.py`.
To change a question or add a category, edit that file and run `init_db` again; the frontend reads the structure from the API.

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
- Portal info: <http://localhost:8000/api/portal/announcements?audience=student> and <http://localhost:8000/api/portal/key-dates>
- Interactive docs: <http://localhost:8000/docs>

Frontend (from `frontend/`):

```bash
npm run dev
```

Open <http://localhost:5173>. You are sent to `/login`; use **Create an account** to register a student.
The sidebar footer shows whether the API is online. In development Vite proxies `/api` to port 8000.

Student flow: register → dashboard → room type (`/student/accommodation`) → questionnaire
(`/student/roommate-matching/survey`, one section at a time) → review and submit
(`/student/roommate-matching/review`) → dashboard shows "Submitted".

| Student portal | Housing manager portal |
|---|---|
| `/student/home` | `/manager/rooms` |
| `/student/accommodation` | `/manager/dashboard` (LATER) |
| `/student/roommate-matching` (+ `/survey`, `/review`) | `/manager/feedback` (LATER) |
| `/student/documents` | `/manager/relocations` (LATER) |
| `/student/payments` (LATER) | |
| `/student/help` | |

Student pages need a signed-in student and load their data from the API. The Student / Housing manager switch in the header is a demo device from the prototype; the manager pages still use sample data from `frontend/src/data/` until Phase 3.

### API (Phase 2)

| Method | Path | What it does |
|---|---|---|
| POST | `/api/auth/register` | Create a student account, returns a token (201) |
| POST | `/api/auth/login` | Sign in, returns a token |
| POST | `/api/auth/logout` | End the current session (204) |
| GET | `/api/auth/me` | The signed-in user |
| GET | `/api/student/dashboard` | User, room preference, questionnaire status |
| GET / PUT | `/api/student/room-preference` | Read / save the room type (`single`, `double`, `triple`, `quad`) |
| GET | `/api/survey` | Categories, questions and options |
| GET | `/api/survey/response` | The student's saved answers |
| PUT | `/api/survey/response/answers` | Save some answers (autosave) |
| POST | `/api/survey/response/submit` | Check all required answers and lock the questionnaire |

All but register and login need `Authorization: Bearer <token>`. Passwords are hashed with scrypt; only a SHA-256 of each session token is stored, and sessions expire after `SESSION_DAYS` (default 7).

Production build check: `npm run build` (from `frontend/`). Type check only: `npm run typecheck`.

Backend tests (from `backend/`):

```bash
pip install -r requirements-dev.txt
pytest          # API tests without a database; the Phase 2 tests are skipped
```

The Phase 2 tests (auth, room type, questionnaire, isolation between students) need an empty PostgreSQL
database of their own; they create and drop all tables in it:

```sql
CREATE DATABASE unidorm_test OWNER unidorm_user;
```

```bash
# macOS / Linux
TEST_DATABASE_URL=postgresql+psycopg://unidorm_user:PASSWORD@localhost:5432/unidorm_test pytest
# Windows (PowerShell)
$env:TEST_DATABASE_URL="postgresql+psycopg://unidorm_user:PASSWORD@localhost:5432/unidorm_test"; pytest
```

## Documentation

- [docs/PROJECT_ARCHITECTURE.md](docs/PROJECT_ARCHITECTURE.md)
- [docs/DEVELOPMENT_ROADMAP.md](docs/DEVELOPMENT_ROADMAP.md)

## Security

Never commit `.env` files. Only `.env.example` templates are tracked.
