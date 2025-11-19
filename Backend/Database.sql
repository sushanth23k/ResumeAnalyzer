-- ============================================
-- Resume Analyzer Database Schema
-- Simplified for Single User Application
-- ============================================

-- ============================================
-- 1. APPLICANT BASIC INFORMATION TABLE
-- ============================================
CREATE TABLE applicant_basic_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    linkedin_url VARCHAR(500),
    github_url VARCHAR(500),
    address TEXT,
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT linkedin_format CHECK (linkedin_url IS NULL OR linkedin_url ~* '^https?://(www\.)?linkedin\.com/'),
    CONSTRAINT github_format CHECK (github_url IS NULL OR github_url ~* '^https?://(www\.)?github\.com/')
);

CREATE INDEX idx_applicant_basic_info_email ON applicant_basic_info(email);

-- ============================================
-- 2. ACADEMICS TABLE
-- ============================================
CREATE TABLE academics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    college_name VARCHAR(255) NOT NULL,
    graduation_date VARCHAR(50) NOT NULL,
    course VARCHAR(255) NOT NULL,
    display_order INTEGER DEFAULT 0
);

CREATE INDEX idx_academics_display_order ON academics(display_order);

-- ============================================
-- 3. ACHIEVEMENTS TABLE
-- ============================================
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    achievement_point TEXT NOT NULL,
    display_order INTEGER DEFAULT 0
);

CREATE INDEX idx_achievements_display_order ON achievements(display_order);

-- ============================================
-- 4. SKILLS TABLE (Master Skills List)
-- ============================================
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50)
);

CREATE INDEX idx_skills_name ON skills(skill_name);
CREATE INDEX idx_skills_category ON skills(category);

-- ============================================
-- 5. USER SKILLS TABLE (Junction Table)
-- Links skills to the single user's skill list
-- ============================================
CREATE TABLE user_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    UNIQUE(skill_id)
);

CREATE INDEX idx_user_skills_skill_id ON user_skills(skill_id);

-- ============================================
-- 6. PROJECTS TABLE
-- ============================================
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_name VARCHAR(255) NOT NULL,
    project_info TEXT NOT NULL,
    display_order INTEGER DEFAULT 0
);

CREATE INDEX idx_projects_display_order ON projects(display_order);

-- ============================================
-- 7. PROJECT SKILLS TABLE (Junction Table)
-- Links skills to specific projects
-- ============================================
CREATE TABLE project_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    UNIQUE(project_id, skill_id)
);

CREATE INDEX idx_project_skills_project_id ON project_skills(project_id);
CREATE INDEX idx_project_skills_skill_id ON project_skills(skill_id);

-- ============================================
-- 8. EXPERIENCES TABLE
-- ============================================
CREATE TABLE experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experience_name VARCHAR(255) NOT NULL,
    start_date VARCHAR(50) NOT NULL,
    end_date VARCHAR(50) NOT NULL,
    role VARCHAR(255),
    location VARCHAR(50),
    experience_explanation TEXT NOT NULL,
    display_order INTEGER DEFAULT 0
);

CREATE INDEX idx_experiences_display_order ON experiences(display_order);

-- ============================================
-- 9. APPLICATIONS TABLE
-- Includes resume file path storage
-- ============================================
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    job_link VARCHAR(500) NOT NULL,
    resume_file_path VARCHAR(500) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Applied',
    notes TEXT,
    CONSTRAINT status_check CHECK (status IN ('Applied', 'Rejected', 'Timed out', 'Processed', 'Accepted', 'Interview')),
    CONSTRAINT job_link_format CHECK (job_link ~* '^https?://')
);

CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_company_name ON applications(company_name);