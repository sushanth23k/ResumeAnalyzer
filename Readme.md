# Resume Analyzer

Full-stack web application for tracking job applications, managing your professional profile, and generating AI-powered resume content.

## Architecture

```
ResumeAnalyzer/
├── Backend/          # Django REST API + Gunicorn + PostgreSQL
│   ├── docker-compose.yml    ← backend-only deployment
│   └── ...
├── Frontend/         # React TypeScript SPA + Nginx
│   ├── docker-compose.yml    ← frontend-only deployment
│   └── ...
└── .env.example      # environment variable template
```

The frontend and backend are **independently deployable** services.

| Service | Stack | Port |
|---|---|---|
| Backend API | Django + Gunicorn | `8000` |
| Database | PostgreSQL — `general` db / `resumeanalyzer` schema | `5432` |
| Frontend | React (Vite) served by Nginx | `80` |

---

## Quick Start

### 1. Clone the repository

```bash
git clone <repo-url>
cd ResumeAnalyzer
```

### 2. Configure environment

```bash
cp .env.example Backend/.env
# Edit Backend/.env — set SECRET_KEY, DB_PASSWORD, GROQ_API_KEY, email settings
```

### 3. Start the backend

```bash
cd Backend
docker compose up --build
# API at http://localhost:8000
```

### 4. Start the frontend

```bash
cd Frontend
VITE_API_BASE_URL=http://localhost:8000 docker compose up --build
# App at http://localhost
```

---

## Local Development (without Docker)

### Backend

```bash
cd Backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# Configure .env (see .env.example)
# Ensure PostgreSQL is running with the resumeanalyzer schema created

python manage.py migrate
python manage.py runserver   # http://127.0.0.1:8000
```

### Frontend

```bash
cd Frontend
npm install

# Create .env.local
echo "VITE_API_BASE_URL=http://localhost:8000" > .env.local

npm run dev   # http://localhost:5173
```

---

## Database

All application data lives in the `resumeanalyzer` schema inside a PostgreSQL database named `general`.

### Docker (automatic)

The `Backend/docker-compose.yml` spins up a Postgres container and runs `Backend/init-db.sql` on first start, which creates the schema before Django runs migrations.

### Remote / Supabase (manual bootstrap)

```sql
CREATE SCHEMA IF NOT EXISTS resumeanalyzer;
GRANT ALL ON SCHEMA resumeanalyzer TO <your-db-user>;
```

Then set `DB_SSL_REQUIRE=True` in `Backend/.env` and run `python manage.py migrate`.

### Reverting from old public-schema tables

```sql
-- Drop old application tables from public schema
DROP TABLE IF EXISTS public.project_skills    CASCADE;
DROP TABLE IF EXISTS public.user_skills       CASCADE;
DROP TABLE IF EXISTS public.applications      CASCADE;
DROP TABLE IF EXISTS public.experiences       CASCADE;
DROP TABLE IF EXISTS public.projects          CASCADE;
DROP TABLE IF EXISTS public.achievements      CASCADE;
DROP TABLE IF EXISTS public.academics         CASCADE;
DROP TABLE IF EXISTS public.skills            CASCADE;
DROP TABLE IF EXISTS public.applicant_basic_info CASCADE;

-- Reset Django migration history for BackendApp
DELETE FROM django_migrations WHERE app = 'BackendApp';
```

Then run `python manage.py migrate` to recreate everything in `resumeanalyzer`.

See `Backend/Database.sql` for the full schema reference.

---

## Features

- **Authentication** — Email registration, verification, JWT login/logout, token refresh
- **Profile** — Basic info, academics, achievements, skills, projects, experiences
- **Application Tracking** — CRUD job applications with status workflow and resume uploads
- **AI Generation** — Groq-powered experience, project, and skills content tailoring
- **Resume Export** — Download as DOCX or PDF

---

## Documentation

| File | Contents |
|---|---|
| `Backend/README.md` | Backend setup, API reference, Docker deployment |
| `Frontend/Readme.md` | Frontend setup, Nginx config, Docker deployment |
| `Backend/Database.sql` | Full SQL schema, revert script, useful queries |
| `.env.example` | All configurable environment variables |

---

**Version**: 3.0 — separate deployments, `resumeanalyzer` schema  
**Last Updated**: February 2026
