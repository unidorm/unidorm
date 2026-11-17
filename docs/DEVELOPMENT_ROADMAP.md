# Development Roadmap

## Phases

| Phase | Goal | Depends on |
|---|---|---|
| 0 | Project setup, health check, docs (this phase) | – |
| 1 | Database models and migrations (Alembic), seed data: 15 questions, categories, sample rooms | 0 |
| 2 | Authentication and roles (student / housing manager), protected routes | 1 |
| 3 | App shell: layouts, top bar, sidebar, shared UI components, language switch | 0 |
| 4 | Student flow: Home, room type, survey (5 steps, validation, submit, edit) | 1, 2, 3 |
| 5 | Scoring engine (rule-based, five weighted areas, pair and room score, red flags) | 1, 4 |
| 6 | Housing manager portal: room list, room detail, approve, change group | 2, 3, 5 |
| 7 | Student results: score by area, habit comparison | 4, 5, 6 |
| 8 | Roommate agreement: generation from answers, edit, sign | 6, 7 |
| 9 | Testing, polish, deployment | all |

Phase 3 can run in parallel with Phases 1–2.

## Status

The team now delivers this plan in three course phases:

- **Phase 1 (done):** app shell, both portal layouts, shared UI, design (roadmap rows 0 and 3).
- **Phase 2 – Student Portal (done):** student registration and sign-in with server-side sessions, dashboard,
  room type selection, the 15-question survey loaded from the database with autosave, review and submit
  (rows 1, 2 and 4, student side). Tables are created by `python -m app.db.init_db`; Alembic is not used yet.
- **Phase 3 (next):** housing manager sign-in and portal, scoring engine (rows 5–6).

## Main modules

- **Auth** (users, roles)
- **Accommodation** (room type request, rooms, assignments)
- **Survey** (questions, answers, submission)
- **Matching** (scoring and red flags)
- **Manager review** (approval, group changes)
- **Agreement** (draft, signatures)

## Key dependencies

- Survey → Scoring → Manager review → Student result → Agreement.
- Single-room requests skip the survey.
- The final room decision always stays with the housing manager.

## Postponed (marked LATER in the prototype)

- Payments
- Manager dashboard (statistics)
- Feedback surveys (two weeks after move-in and end of semester)
- Relocation requests
- Help section
- Real KBTU / WSP sign-in integration (prototype is interface concept only)
- Notifications ("We will notify you in UniDorm")
- KK / RU translations of survey content (EN first, structure ready for all three)
