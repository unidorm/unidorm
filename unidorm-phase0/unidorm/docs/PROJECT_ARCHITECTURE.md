# Project Architecture

## Folder structure

```
unidorm/
├── README.md
├── .gitignore
├── docs/
├── frontend/
│   └── src/
│       ├── main.tsx, App.tsx, index.css
│       ├── routes/        Router configuration, role guards (later)
│       ├── layouts/       StudentLayout, ManagerLayout (top bar, sidebar)
│       ├── pages/         shared/, student/, manager/
│       ├── components/    ui/ (Button, Pill, Card, Stepper...) and feature components
│       ├── services/      API client and per-feature API functions
│       ├── hooks/         Reusable React hooks
│       ├── types/         Shared TypeScript types
│       └── assets/
└── backend/
    └── app/
        ├── main.py        Application entry point
        ├── core/          config.py (settings from env), errors.py (error handlers)
        ├── db/            base.py (ORM base), session.py (engine, get_db)
        ├── api/routers/   HTTP endpoints only
        ├── models/        SQLAlchemy models
        ├── schemas/       Pydantic request/response schemas
        └── services/      Business logic (scoring, matching, agreements)
```

Differences from the suggested structure: `routes/` on the frontend keeps routing out of `App.tsx`; `core/` on the backend holds configuration and error handling so `main.py` stays small.

## Frontend architecture

- Pages compose layouts and components. Components do not call `fetch` directly.
- All HTTP calls go through `services/`. Business rules (for example, score calculation) are never computed in the UI; the backend is the single source of truth.
- The two portals (Student and Housing manager) have separate layouts, route groups and page folders. The role toggle in the prototype is a demo device; the real role will come from the authenticated user.
- Styling uses Tailwind v4 with design tokens defined in `index.css` (`@theme`): page, surface, border, accent, text, muted, success, warning, danger. The token values are approximated from the prototype and should be refined from Figma.
- Shared components identified in the prototype: top bar, sidebar with MODULE / LATER badges, stepper (4 stages and 5 survey categories), language switch (KK / RU / EN), button variants, pills in five colors, stat cards, score ring, progress bars, question card, data table, agreement section card.

## Backend architecture

Request flow: **router → service → database session**.

- Routers validate input with Pydantic schemas and call services. They contain no business logic.
- Services hold business logic and receive a SQLAlchemy `Session`.
- `get_db` provides one session per request.
- `create_engine` is lazy, so the API starts even if PostgreSQL is down. `GET /api/health` is liveness only; `GET /api/health/db` checks the database and returns 503 when it is unavailable.
- Errors are returned as `{"detail": "..."}`. Database errors map to 503, unhandled errors to 500.
- Configuration comes from environment variables via `pydantic-settings`. No secrets in code.

## Database overview (preliminary)

Tables are **not** created in Phase 0. Expected entities:

| Entity | Purpose |
|---|---|
| `users` | Account, email, role (student / housing_manager) |
| `student_profiles` | One per student user: name, requested room type |
| `rooms` | Room number, building, capacity (1–4) |
| `surveys` | One per student: language, submitted status, timestamps |
| `survey_questions` | The 15 questions: category, order, text per language |
| `survey_answers` | Selected option per question per survey |
| `room_assignments` | Links students to rooms with status (proposed / approved) |
| `roommate_agreements` | Agreement for a room: section content, status |
| `agreement_signatures` | Per-student signature on an agreement (likely, to track "waiting for signature") |

Relationships:

```
users 1──1 student_profiles 1──1 surveys 1──* survey_answers *──1 survey_questions
rooms 1──* room_assignments *──1 student_profiles
rooms 1──1 roommate_agreements 1──* agreement_signatures *──1 student_profiles
```

Compatibility scores are computed by service code from survey answers. Whether to store them is decided in the scoring phase. Answer options and the 5 categories with weights should live in data or constants, not scattered through code.

## API communication

- REST over JSON, all routes under `/api`.
- Development: Vite proxies `/api` to `http://localhost:8000`.
- Production: set `VITE_API_URL` and `CORS_ORIGINS` accordingly.
