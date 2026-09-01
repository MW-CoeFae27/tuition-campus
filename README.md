# 🏫 Sunrise Tuition Centre — Class / Teacher / Student Manager

> **Vibe-coding exercise submission.** This README is the page GitHub shows by default and is the
> document used to **judge your outcome**. Fill in every section marked `<!-- TODO -->`. Keep the headings.
>
> ⚠️ Do **not** mention the names *companyName*, *XXX_Flex* or *YYY_Flex????* anywhere in this repo (trademarks — see `requirements.md`).
> 📅 Deadline: **28 August 2026** · Estimated effort: **2 days**

---

## 1. Team

| Name | Role | GitHub |
|---|---|---|
| <!-- TODO --> | e.g. Frontend / API / DB | @handle |
| <!-- TODO --> | | |

## 2. Live links (required)

| Component | Platform | URL | Status |
|---|---|---|---|
| Frontend | GitHub Pages | <!-- TODO https://<user>.github.io/<repo>/ --> | ⬜ |
| API | Render | <!-- TODO https://<service>.onrender.com/api/health --> | ⬜ |
| Database | Neon (PostgreSQL) | Project name: <!-- TODO --> (no connection string here!) | ⬜ |

> ℹ️ The Render free tier sleeps when idle — the first API call can take 30–60 s. The UI shows a loading state.

## 3. What this app does

A mobile-responsive web app for a tuition school to manage:

- **Classes** — e.g. `primary1`, `primary2`, `primary3` … (name, subjects, schedule, room, assigned teacher)
- **Teachers** — e.g. `teacher01`, `teacher02`, `teacher03` … (contact, specialty, assigned class)
- **Students** — e.g. `primary1-student01`, `primary2-student01` … (guardian info, enrolment, class)

Full **add / edit / delete** for all three entities, backed by a cloud REST API and a cloud PostgreSQL database. No local services.

## 4. Architecture

```
[Browser / Mobile] ──HTTPS──> [GitHub Pages: frontend]
                                     │  fetch (JSON)
                                     ▼
                              [Render: REST API]   <!-- TODO: framework, e.g. Node + Express -->
                                     │  SQL        <!-- TODO: driver/ORM, e.g. pg / Prisma -->
                                     ▼
                              [Neon: PostgreSQL]
```

**Tech stack**

| Layer | Choice | Why |
|---|---|---|
| Frontend | <!-- TODO e.g. React + Vite + Tailwind --> | |
| API | <!-- TODO e.g. Node 20 + Express --> | |
| DB / ORM | <!-- TODO e.g. Neon PostgreSQL + pg --> | |
| CI/CD | <!-- TODO e.g. GitHub Actions → gh-pages; Render auto-deploy from main --> | |

**Repository layout**

```
/frontend   # static site deployed to GitHub Pages
/api        # REST API deployed to Render
/db         # schema.sql, seed.sql / seed script
README.md
```
<!-- TODO: adjust to your actual layout -->

## 5. Features achieved

Tick what is **working on the live URLs** (not just locally).

### Core (required)
- [ ] Classes: list / create / update / delete
- [ ] Teachers: list / create / update / delete
- [ ] Students: list / create / update / delete
- [ ] Student code auto-suggested as `<class_code>-studentNN`
- [ ] Deleting a class that still has students is blocked with a message
- [ ] Deleting a teacher un-assigns them from their class
- [ ] Class detail view shows teacher + students
- [ ] Search / filter on each list (students filter by class)
- [ ] Dashboard counts (classes / teachers / students)
- [ ] Mobile responsive at 375 px (no horizontal page scroll)
- [ ] Loading & error states (incl. Render cold start)
- [ ] Seed data loaded into Neon from `tuition_school_dummy_data.xlsx`

### Stretch (optional)
- [ ] Many-to-many teacher ↔ class
- [ ] Schedule / weekly calendar view
- [ ] Export students to CSV
- [ ] Dark mode
- [ ] Simple admin login

## 6. API reference

Base URL: `<!-- TODO https://<service>.onrender.com -->`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | `{ "status": "ok" }` |
| GET / POST | `/api/classes` | list / create |
| GET / PUT / DELETE | `/api/classes/:id` | read / update / delete |
| GET / POST | `/api/teachers` | list / create |
| GET / PUT / DELETE | `/api/teachers/:id` | read / update / delete |
| GET / POST | `/api/students?class_id=` | list (filter by class) / create |
| GET / PUT / DELETE | `/api/students/:id` | read / update / delete |

Example:
```bash
curl https://<service>.onrender.com/api/classes
```

## 7. Database schema

<!-- TODO: paste or link your schema.sql; a short ERD is a bonus -->

```
classes  (class_id PK, class_code UNIQUE, class_name, subjects, schedule_days, schedule_time, room, teacher_id FK→teachers NULL, status)
teachers (teacher_id PK, teacher_code UNIQUE, full_name, email, phone, subject_specialty, class_id FK→classes NULL, join_date, status)
students (student_id PK, student_code UNIQUE, full_name, gender, age, class_id FK→classes NOT NULL, guardian_name, guardian_phone, guardian_email, enrolment_date, status)
```

## 8. Screenshots

| Mobile (375 px) | Desktop |
|---|---|
| <!-- TODO ![mobile](docs/mobile.png) --> | <!-- TODO ![desktop](docs/desktop.png) --> |

<!-- TODO: add at least: list view, create/edit form, delete confirmation, class detail -->

## 9. Demo

<!-- TODO: link to 3–5 min screen recording OR note "live demo on <date>" -->

## 10. Setup & deployment notes

### Environment variables (Render)
| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon connection string (never committed) |
| `CORS_ORIGIN` | GitHub Pages origin, e.g. `https://<user>.github.io` |
| <!-- TODO --> | |

### Steps we followed
1. <!-- TODO Neon: create project → run db/schema.sql → run seed -->
2. <!-- TODO Render: new Web Service from /api, set env vars, build/start commands -->
3. <!-- TODO GitHub Pages: build /frontend, deploy via Actions / gh-pages branch, set API base URL -->

### Local development (optional, for dev only)
```bash
# api
cd api && cp .env.example .env && npm install && npm run dev
# frontend
cd frontend && npm install && npm run dev
```
<!-- TODO: adjust to your stack -->

## 11. Preparation & collaboration (see requirements.md §10)

**Who helped / who we discussed with** (API hosting, env vars, DB design):
<!-- TODO: names + topics, e.g. "Discussed Neon schema & Render env vars with <name>" -->

**Offline HTML draft:** <!-- TODO: link to folder/commit, e.g. `/prep/draft-ui/` -->

**Environment readiness checks** (keep the small test code in `/prep`):

| # | Check | Evidence (file / URL) | Done |
|---|---|---|---|
| 1 | Neon table created + row inserted | | ⬜ |
| 2 | DB connection script (`SELECT NOW()`) | `prep/db-test.*` | ⬜ |
| 3 | Render hello-world `/api/health` | | ⬜ |
| 4 | API → DB `/api/db-check` | | ⬜ |
| 5 | GitHub Pages page fetching the API (no CORS error) | | ⬜ |
| 6 | Secrets only in Render env vars; `.env` git-ignored | | ⬜ |

## 12. Vibe-coding log (what we asked the AI, what worked, what didn't)

<!-- TODO: 5–10 bullets. Example:
- Prompted for schema.sql from requirements.md → worked first try
- CORS blocked Pages origin → fixed by adding CORS_ORIGIN env var
- Render cold start confused testers → added loading spinner
-->

## 13. Self-assessment against the acceptance checklist

| # | Criterion | Done |
|---|---|---|
| 1 | Frontend loads from `*.github.io` with no console errors | ⬜ |
| 2 | API reachable at `*.onrender.com`; CORS works from Pages | ⬜ |
| 3 | Data persists in Neon (refresh → still there) | ⬜ |
| 4 | Create/update/delete works for Classes, Teachers, Students | ⬜ |
| 5 | Deleting a class with students is blocked | ⬜ |
| 6 | Student code follows `<class_code>-studentNN` | ⬜ |
| 7 | Usable at 375 px width | ⬜ |
| 8 | No secrets committed | ⬜ |
| 9 | README follows this template with live URLs | ⬜ |
| 10 | No "COMPANY NAME" anywhere (`grep -ri companyName .` checked) | ⬜ |
| 11 | Preparation spikes in `/prep` and documented in §11 | ⬜ |
| 12 | Submitted by 28 Aug 2026 | ⬜ |

## 14. Known issues / next steps

<!-- TODO -->

---
*Reference docs: [`requirements.md`](requirements.md) · [`tuition_school_dummy_data.xlsx`](tuition_school_dummy_data.xlsx)*
