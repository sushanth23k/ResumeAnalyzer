-- ============================================================
-- Resume Analyzer — Database Schema
-- Database : general  (Supabase: postgres)
-- Schema   : resumeanalyzer
-- ============================================================
-- ALL tables live exclusively in the `resumeanalyzer` schema:
--   • Django system tables  (django_migrations, django_content_type, …)
--   • Authentication tables (auth_user, auth_group, …)
--   • allauth tables        (account_emailaddress, …)
--   • SimpleJWT tables      (token_blacklist_*, …)
--   • Application tables    (applicant_basic_info, academics, …)
--
-- The connection sets search_path=resumeanalyzer (no public fallback),
-- so every CREATE TABLE issued by `python manage.py migrate` lands in
-- the resumeanalyzer schema automatically.
-- ============================================================

-- ============================================================
-- Docker PostgreSQL init script
-- Runs once when the container is first created.
-- Creates the resumeanalyzer schema and sets the default
-- search path so Django migrations land in the right place.
-- ============================================================

CREATE SCHEMA IF NOT EXISTS resumeanalyzer;

GRANT ALL ON SCHEMA resumeanalyzer TO resumeanalyzer;

ALTER DATABASE general SET search_path TO resumeanalyzer;


-- ============================================================
-- STEP 0 — One-time schema bootstrap
-- Run this manually on a fresh database before the first
-- `python manage.py migrate`.  The migration also issues
-- CREATE SCHEMA IF NOT EXISTS as a safety net.
-- ============================================================

-- For Docker  (role = resumeanalyzer, database = general):
CREATE SCHEMA IF NOT EXISTS resumeanalyzer;
GRANT ALL ON SCHEMA resumeanalyzer TO resumeanalyzer;
ALTER DATABASE general SET search_path TO resumeanalyzer;

-- For Supabase (role = postgres, database = postgres):
-- CREATE SCHEMA IF NOT EXISTS resumeanalyzer;
-- GRANT ALL ON SCHEMA resumeanalyzer TO postgres;
-- ALTER DATABASE postgres SET search_path TO resumeanalyzer;


-- ============================================================
-- Working schema
-- ============================================================

SET search_path TO resumeanalyzer;


-- ============================================================
-- REVERT — drop all application tables (run before re-migrating)
-- ============================================================
-- DROP TABLE IF EXISTS resumeanalyzer.project_skills    CASCADE;
-- DROP TABLE IF EXISTS resumeanalyzer.user_skills       CASCADE;
-- DROP TABLE IF EXISTS resumeanalyzer.project_skills    CASCADE;
-- DROP TABLE IF EXISTS resumeanalyzer.applications      CASCADE;
-- DROP TABLE IF EXISTS resumeanalyzer.experiences       CASCADE;
-- DROP TABLE IF EXISTS resumeanalyzer.projects          CASCADE;
-- DROP TABLE IF EXISTS resumeanalyzer.achievements      CASCADE;
-- DROP TABLE IF EXISTS resumeanalyzer.academics         CASCADE;
-- DROP TABLE IF EXISTS resumeanalyzer.skills            CASCADE;
-- DROP TABLE IF EXISTS resumeanalyzer.applicant_basic_info CASCADE;


-- ============================================================
-- 1. APPLICANT BASIC INFO
--    One row per registered user (OneToOne → auth_user).
-- ============================================================

CREATE TABLE resumeanalyzer.applicant_basic_info (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         INTEGER NOT NULL UNIQUE REFERENCES auth_user(id) ON DELETE CASCADE,
    full_name       VARCHAR(255)  NOT NULL,
    phone_number    VARCHAR(20)   NOT NULL,
    email           VARCHAR(254)  NOT NULL,
    linkedin_url    VARCHAR(500),
    github_url      VARCHAR(500),
    address         TEXT,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),

    CONSTRAINT email_format     CHECK (email        ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT linkedin_format  CHECK (linkedin_url IS NULL OR linkedin_url ~* '^https?://(www\.)?linkedin\.com/'),
    CONSTRAINT github_format    CHECK (github_url   IS NULL OR github_url   ~* '^https?://(www\.)?github\.com/')
);


-- ============================================================
-- 2. ACADEMICS
-- ============================================================

CREATE TABLE resumeanalyzer.academics (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         INTEGER NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
    college_name    VARCHAR(255) NOT NULL,
    graduation_date VARCHAR(50)  NOT NULL,
    course          VARCHAR(255) NOT NULL,
    display_order   INTEGER      NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_academics_user_order
    ON resumeanalyzer.academics (user_id, display_order);


-- ============================================================
-- 3. ACHIEVEMENTS
-- ============================================================

CREATE TABLE resumeanalyzer.achievements (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             INTEGER NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
    achievement_point   TEXT    NOT NULL,
    display_order       INTEGER NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_achievements_user_order
    ON resumeanalyzer.achievements (user_id, display_order);


-- ============================================================
-- 4. SKILLS  (global master catalogue — shared across users)
-- ============================================================

CREATE TABLE resumeanalyzer.skills (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_name  VARCHAR(100) NOT NULL UNIQUE,
    category    VARCHAR(50),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_skills_name     ON resumeanalyzer.skills (skill_name);
CREATE INDEX idx_skills_category ON resumeanalyzer.skills (category);


-- ============================================================
-- 5. USER_SKILLS  (junction: user ↔ skill)
-- ============================================================

CREATE TABLE resumeanalyzer.user_skills (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     INTEGER NOT NULL REFERENCES auth_user(id)          ON DELETE CASCADE,
    skill_id    UUID    NOT NULL REFERENCES resumeanalyzer.skills(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (user_id, skill_id)
);

CREATE INDEX idx_user_skills_user_skill
    ON resumeanalyzer.user_skills (user_id, skill_id);


-- ============================================================
-- 6. PROJECTS
-- ============================================================

CREATE TABLE resumeanalyzer.projects (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         INTEGER  NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
    project_name    VARCHAR(255) NOT NULL,
    project_info    TEXT         NOT NULL,
    display_order   INTEGER      NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_projects_user_order
    ON resumeanalyzer.projects (user_id, display_order);


-- ============================================================
-- 7. PROJECT_SKILLS  (junction: project ↔ skill)
-- ============================================================

CREATE TABLE resumeanalyzer.project_skills (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id  UUID NOT NULL REFERENCES resumeanalyzer.projects(id) ON DELETE CASCADE,
    skill_id    UUID NOT NULL REFERENCES resumeanalyzer.skills(id)   ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (project_id, skill_id)
);

CREATE INDEX idx_project_skills_project_id ON resumeanalyzer.project_skills (project_id);
CREATE INDEX idx_project_skills_skill_id   ON resumeanalyzer.project_skills (skill_id);


-- ============================================================
-- 8. EXPERIENCES
-- ============================================================

CREATE TABLE resumeanalyzer.experiences (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 INTEGER  NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
    experience_name         VARCHAR(255) NOT NULL,
    start_date              VARCHAR(50)  NOT NULL,
    end_date                VARCHAR(50)  NOT NULL,
    role                    VARCHAR(255),
    location                VARCHAR(50),
    experience_explanation  TEXT    NOT NULL,
    display_order           INTEGER NOT NULL DEFAULT 0,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_experiences_user_order
    ON resumeanalyzer.experiences (user_id, display_order);


-- ============================================================
-- 9. APPLICATIONS
-- ============================================================

CREATE TABLE resumeanalyzer.applications (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             INTEGER  NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
    job_name            VARCHAR(255) NOT NULL,
    company_name        VARCHAR(255) NOT NULL,
    job_link            VARCHAR(500) NOT NULL,
    resume_file_path    VARCHAR(500) NOT NULL,
    status              VARCHAR(50)  NOT NULL DEFAULT 'Applied',
    notes               TEXT,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT status_check    CHECK (status IN ('Applied','Rejected','Timed out','Processed','Accepted','Interview')),
    CONSTRAINT job_link_format CHECK (job_link ~* '^https?://')
);

CREATE INDEX idx_applications_user_status
    ON resumeanalyzer.applications (user_id, status);
CREATE INDEX idx_applications_user_company
    ON resumeanalyzer.applications (user_id, company_name);


-- ============================================================
-- USEFUL QUERIES
-- ============================================================

-- Full profile for a given user (replace 1 with the target user_id):
-- SELECT
--     u.email,
--     b.full_name,
--     b.phone_number,
--     b.linkedin_url,
--     b.github_url
-- FROM auth_user u
-- JOIN resumeanalyzer.applicant_basic_info b ON b.user_id = u.id
-- WHERE u.id = 1;

-- All skills for a user:
-- SELECT s.skill_name, s.category
-- FROM resumeanalyzer.user_skills us
-- JOIN resumeanalyzer.skills s ON s.id = us.skill_id
-- WHERE us.user_id = 1
-- ORDER BY s.category, s.skill_name;

-- Application statistics per user:
-- SELECT
--     user_id,
--     status,
--     COUNT(*) AS total
-- FROM resumeanalyzer.applications
-- GROUP BY user_id, status
-- ORDER BY user_id, status;

-- Projects with their skills:
-- SELECT
--     p.project_name,
--     array_agg(s.skill_name ORDER BY s.skill_name) AS skills
-- FROM resumeanalyzer.projects p
-- JOIN resumeanalyzer.project_skills ps ON ps.project_id = p.id
-- JOIN resumeanalyzer.skills          s  ON s.id          = ps.skill_id
-- WHERE p.user_id = 1
-- GROUP BY p.id, p.project_name
-- ORDER BY p.display_order;
