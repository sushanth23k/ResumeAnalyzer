# Resume Analyzer — Backend

Django REST API backend for managing job applications, user profiles, and AI-powered resume content generation with multi-user authentication.

## Overview

| Layer | Technology |
|---|---|
| Framework | Django 4.2.16+ / Django REST Framework 3.14 |
| WSGI server | Gunicorn |
| Database | PostgreSQL — `general` database, `resumeanalyzer` schema |
| Auth | django-allauth (email) + SimpleJWT |
| AI | Groq AI (LLaMA models) |
| Container | Docker / Docker Compose (backend-only) |

---

## Project Structure

```
Backend/
├── AnalyzerApp/          # Groq AI content generation
├── AuthApp/              # Registration, login, JWT, email verification
├── BackendApp/           # Core models, views, API endpoints
│   └── migrations/       # Django migrations (target: resumeanalyzer schema)
├── ResumeAnalyzer/       # Django project settings, URLs, WSGI
├── ResumeBlobs/          # Uploaded resume files
├── Database.sql          # Full SQL schema reference
├── init-db.sql           # Docker DB init (creates resumeanalyzer schema)
├── docker-compose.yml    # Backend-only Docker Compose
├── Dockerfile            # Docker image (Python / Gunicorn)
├── gunicorn.conf.py      # Gunicorn configuration
├── requirements.txt      # Python dependencies
└── .env                  # Local secrets (never commit)
```

---

## Database

### Structure

| Attribute | Value |
|---|---|
| Database | `general` |
| Schema | `resumeanalyzer` |
| Host (Docker) | `db:5432` |
| Host (Supabase) | `*.pooler.supabase.com:5432` |

All application tables live inside the `resumeanalyzer` schema.  Django system tables (`auth_user`, `django_migrations`, etc.) are also created in `resumeanalyzer` because the connection sets `search_path=resumeanalyzer,public`.

See `Database.sql` for the full schema with table definitions, indexes, and useful queries.

### Reverting old tables (public schema → resumeanalyzer schema)

If you previously ran migrations with the default `public` schema, drop the old tables first:

```sql
-- Connect to your database, then:
DROP TABLE IF EXISTS public.project_skills    CASCADE;
DROP TABLE IF EXISTS public.user_skills       CASCADE;
DROP TABLE IF EXISTS public.applications      CASCADE;
DROP TABLE IF EXISTS public.experiences       CASCADE;
DROP TABLE IF EXISTS public.projects          CASCADE;
DROP TABLE IF EXISTS public.achievements      CASCADE;
DROP TABLE IF EXISTS public.academics         CASCADE;
DROP TABLE IF EXISTS public.skills            CASCADE;
DROP TABLE IF EXISTS public.applicant_basic_info CASCADE;

-- Also clear the migration history so Django can re-apply from scratch:
DELETE FROM public.django_migrations WHERE app = 'BackendApp';
```

Then run `python manage.py migrate` (or `docker compose up`).  The first migration creates the `resumeanalyzer` schema automatically.

---

## Quick Start — Local Development

### 1. Create virtual environment

```bash
cd Backend
python -m venv venv
source venv/bin/activate        # macOS/Linux
# venv\Scripts\activate         # Windows
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment

```bash
cp ../.env.example .env
# Edit .env — set DB_URL, SECRET_KEY, GROQ_API_KEY
```

For local SQLite (zero-config development), remove or comment out `DB_URL` / `DB_POOL_URL` from `.env`.

### 4. Create the schema (PostgreSQL only)

```sql
CREATE SCHEMA IF NOT EXISTS resumeanalyzer;
```

Or spin up the Docker database (it runs `init-db.sql` automatically):

```bash
docker compose up db
```

### 5. Run migrations

```bash
python manage.py migrate
```

### 6. Start development server

```bash
python manage.py runserver
# API at http://127.0.0.1:8000
```

---

## Docker Deployment (Backend Only)

```bash
cd Backend

# Create .env from the template
cp ../.env.example .env

# Build and start PostgreSQL + Gunicorn
docker compose up --build
```

The backend API is available at `http://localhost:8000`.

### Environment variables (docker-compose.yml)

| Variable | Default | Notes |
|---|---|---|
| `SECRET_KEY` | (required) | Change for production |
| `DB_PASSWORD` | `changeme_in_production` | PostgreSQL password |
| `DB_SSL_REQUIRE` | `False` | Set `True` for remote DB |
| `DEBUG` | `False` | |
| `GROQ_API_KEY` | — | Required for AI features |
| `ALLOWED_HOSTS` | `localhost,127.0.0.1,backend` | |
| `FRONTEND_URL` | `http://localhost:5173` | Used in email links |
| `REQUIRE_EMAIL_VERIFICATION` | `False` | |

---

## Remote Database (Supabase)

1. Create the schema once:

```bash
psql "<DB_URL>" -c "CREATE SCHEMA IF NOT EXISTS resumeanalyzer; GRANT ALL ON SCHEMA resumeanalyzer TO postgres;"
```

2. Set environment variables:

```env
DB_URL=postgresql://postgres.xxxxx:password@aws-0-us-east-1.pooler.supabase.com:5432/postgres
DB_SSL_REQUIRE=True
```

3. Run migrations:

```bash
python manage.py migrate
```

---

## API Reference

### Base URL

```
http://localhost:8000/
```

### Authentication

| Endpoint | Method | Description |
|---|---|---|
| `/auth/register/` | POST | Register a new user |
| `/auth/login/` | POST | Login — returns JWT access + refresh |
| `/auth/logout/` | POST | Blacklist refresh token |
| `/auth/token/refresh/` | POST | Rotate access token |
| `/auth/verify-email/` | GET | Confirm email address |
| `/auth/resend-verification/` | POST | Re-send verification email |

Include the JWT in every authenticated request:

```
Authorization: Bearer <access-token>
```

### Profile

| Endpoint | Method | Description |
|---|---|---|
| `/api/basic-info/` | GET / POST | Basic contact info |
| `/api/academics/` | GET / POST | Academic history |
| `/api/achievements/` | GET / POST | Achievements |
| `/api/skills/` | GET / POST | Global skills catalogue |
| `/api/user-skills/` | GET / POST | Per-user skill selections |
| `/api/projects/` | GET / POST | Projects |
| `/api/experiences/` | GET / POST | Work experiences |
| `/api/complete-info/` | GET | Full profile snapshot |

### Applications

| Endpoint | Method | Description |
|---|---|---|
| `/api/applications/` | GET / POST / PATCH / DELETE | CRUD job applications |
| `/api/resume-file/` | GET / POST / DELETE | Resume file management |
| `/api/application-stats/` | GET | Status statistics |

### AI Generation

| Endpoint | Method | Description |
|---|---|---|
| `/api/generate-experience/` | POST | Tailor experience bullet points |
| `/api/generate-projects/` | POST | Optimise project descriptions |
| `/api/generate-skills/` | POST | Categorise and rank skills |

---

## Security Checklist (Production)

- [ ] Set a strong `SECRET_KEY`
- [ ] `DEBUG=False`
- [ ] Lock `ALLOWED_HOSTS` to your domain
- [ ] `DB_SSL_REQUIRE=True` for remote databases
- [ ] Use environment secrets (not `.env` committed to git)
- [ ] Enable email verification (`REQUIRE_EMAIL_VERIFICATION=True`)
- [ ] Configure SMTP for real email delivery
- [ ] Use HTTPS in front of Gunicorn

---

**Backend Version**: 3.0 — schema migrated to `resumeanalyzer` in `general` database  
**Last Updated**: February 2026  
**Django**: 4.2.16+ | **Python**: 3.11+
