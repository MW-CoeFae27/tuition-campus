# 🏫 Sunrise Tuition Centre — Class / Teacher / Student Manager

> **Vibe-coding exercise submission.** This README is the page GitHub shows by default and is the
> document used to **judge your outcome**. Fill in every section marked `<!-- TODO -->`. Keep the headings.
>
> ⚠️ Do **not** mention the names *companyName*, *XXX_Flex* or *YYY_Flex????* anywhere in this repo (trademarks — see `requirements.md`).
> 📅 Deadline: **03 Sep 2026** · Estimated effort: **2 days**

---

## 1. Team

| Name | Role | GitHub |
|---|---|---|
| <!-- TODO --> | e.g. Frontend / API / DB | @handle |
| <!-- TODO --> | | |

## 2. Live links (required)

| Component | Platform | URL | Status |
|---|---|---|---|
| Frontend | GitHub Pages | Pending GitHub Pages publication | ⬜ |
| API | Render | Pending Render service publication (`/api/health`) | ⬜ |
| Database | Neon (PostgreSQL) | Provision a Neon project; do not publish its connection string | ⬜ |

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
                              [Render: REST API]   Node.js + Express
                                     │  SQL        pg
                                     ▼
                              [Neon: PostgreSQL]
```

**Tech stack**

| Layer | Choice | Why |
|---|---|---|
| Frontend | Vanilla HTML, CSS, JavaScript | No build step; static and responsive by design |
| API | Node 20 + Express | Small REST service suited to Render |
| DB / ORM | Neon PostgreSQL + `pg` | SQL schema and explicit transactions |
| CI/CD | GitHub Actions Pages workflow; Render Blueprint | Push `main` to publish frontend and redeploy API |

**Repository layout**

```
/            # static site (index.html, app.js, config.js, styles.css) deployed to GitHub Pages
/api        # Express REST API deployed to Render
/db         # schema.sql and Excel seed script
/prep       # connection readiness probes
README.md
```

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

Base URL: configured after Render deployment in `config.js`.

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

Schema: [db/schema.sql](db/schema.sql). `classes.teacher_id` is the assignment source of truth. It allows one teacher to teach more than one class, as required by the supplied workbook.

```
classes  (class_id PK, class_code UNIQUE, class_name, subjects, schedule_days, schedule_time, room, teacher_id FK→teachers NULL, status)
teachers (teacher_id PK, teacher_code UNIQUE, full_name, email, phone, subject_specialty, join_date, status)
students (student_id PK, student_code UNIQUE, full_name, gender, age, class_id FK→classes NOT NULL, guardian_name, guardian_phone, guardian_email, enrolment_date, status)
```

## 8. Screenshots

| Mobile (375 px) | Desktop |
|---|---|
| <!-- TODO ![mobile](docs/mobile.png) --> | <!-- TODO ![desktop](docs/desktop.png) --> |

Capture after cloud deployment: list view, form, deletion confirmation, and class detail at desktop and 375 px.

## 9. Demo

Record after cloud deployment: add, edit, and delete on all entities at mobile width.

## 10. Setup & deployment notes

### Environment variables (Render)
| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon connection string (never committed) |
| `CORS_ORIGIN` | GitHub Pages origin, e.g. `https://<user>.github.io` |
| `NODE_VERSION` | `20` |

### Steps we followed
1. Create a Neon PostgreSQL project. Run [db/schema.sql](db/schema.sql), set `DATABASE_URL` locally, then run `cd api && npm run seed`.
2. In Render, create a Blueprint from `render.yaml`. Set `DATABASE_URL` and `CORS_ORIGIN` in the Render dashboard. Confirm `/api/health` and `/api/db-check`.
3. Set the deployed Render URL in [config.js](config.js), commit, and push `main`.
4. In the repository **Settings → Pages**, set **Source** to **GitHub Actions** (not "Deploy from a branch"). The
   [deploy-pages workflow](.github/workflows/deploy-pages.yml) publishes only `index.html`, `app.js`, `config.js`,
   `styles.css`, and `.nojekyll` — this ensures `index.html` is served as the site, not `README.md` or a Jekyll-built
   page. `README.md` is only ever shown when browsing the repository on github.com; it has no effect on the Pages site.

### Local development (optional, for dev only)
```bash
# api
cd api && copy .env.example .env && npm install && npm run dev
# frontend (from the repository root)
npx serve .
```
Open `index.html` with a static server, with `API_BASE_URL` set to the locally running API only during development.

## 11. Preparation & collaboration (see requirements.md §10)

**Who helped / who we discussed with** (API hosting, env vars, DB design):
Record actual collaborators and topics before submission.

**Offline HTML draft:** [index.html](index.html)

**Environment readiness checks** (keep the small test code in `/prep`):

| # | Check | Evidence (file / URL) | Done |
|---|---|---|---|
| 1 | Neon table created + row inserted | Run [db/schema.sql](db/schema.sql) in Neon | ⬜ |
| 2 | DB connection script (`SELECT NOW()`) | [prep/db-test.js](prep/db-test.js) | ⬜ |
| 3 | Render hello-world `/api/health` | Implemented in [api/src/server.js](api/src/server.js) | ⬜ |
| 4 | API → DB `/api/db-check` | Implemented in [api/src/server.js](api/src/server.js) | ⬜ |
| 5 | GitHub Pages page fetching the API (no CORS error) | [prep/health-check.html](prep/health-check.html) | ⬜ |
| 6 | Secrets only in Render env vars; `.env` git-ignored | [.gitignore](.gitignore) | ⬜ |

## 12. Vibe-coding log (what we asked the AI, what worked, what didn't)

- Modelled classes as the teacher-assignment source because the supplied workbook assigns one teacher to two classes.
- Added an idempotent Excel seed script that preserves the supplied entity relationships.
- Added explicit Render wake-up/loading feedback in the frontend.
- Kept database credentials outside committed configuration.
- Added a class filter dropdown to the Students list and a per-class breakdown on the dashboard to mirror the Excel Summary sheet.
- Added CSV export of a class's students (stretch goal) from the class detail view.

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
| 10 | No "COMPANY NAME" anywhere (`grep -ri companyName .` checked) | ✅ (`git grep` scan of all generated code found no matches) |
| 11 | Preparation spikes in `/prep` and documented in §11 | ⬜ |
| 12 | Submitted by 28 Aug 2026 | ⬜ |

## 14. Known issues / next steps

Cloud deployment, screenshots, and recording remain pending account access. Before publishing, configure `config.js`, set Render environment variables, and complete the unchecked live verification items.

---
*Reference docs: [`requirements.md`](requirements.md) · [`tuition_school_dummy_data.xlsx`](tuition_school_dummy_data.xlsx)*
