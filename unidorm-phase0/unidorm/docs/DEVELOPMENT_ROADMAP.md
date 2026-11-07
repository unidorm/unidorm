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
