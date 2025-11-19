# Database Schema Documentation

Complete documentation of the ResumeAnalyzer database schema.

## Table of Contents

1. [Overview](#overview)
2. [Schema Diagram](#schema-diagram)
3. [Table Descriptions](#table-descriptions)
4. [Relationships](#relationships)
5. [Indexes](#indexes)
6. [Data Types](#data-types)
7. [Constraints](#constraints)
8. [Usage Examples](#usage-examples)

## Overview

The ResumeAnalyzer database consists of 9 main tables designed to store comprehensive resume and job application information. All tables use UUID primary keys for better distributed system compatibility.

### Database Specifications

- **Database Engine**: SQLite (development) / PostgreSQL (production-ready)
- **Primary Key Type**: UUID (Universally Unique Identifier)
- **Character Encoding**: UTF-8
- **Total Tables**: 9 user tables + Django system tables

## Schema Diagram

```
applicant_basic_info
    (Single user record)

academics
    (Multiple education records)

achievements
    (Multiple achievement records)

skills (Master List)
    ├── user_skills (OneToOne)
    └── project_skills (ManyToMany)
        └── projects

projects
    └── project_skills (ManyToMany)
        └── skills

experiences
    (Multiple work experience records)

applications
    (Job application tracking)
```

## Table Descriptions

### 1. applicant_basic_info

Stores the applicant's personal and contact information.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `full_name` | VARCHAR(255) | NOT NULL | Applicant's full name |
| `phone_number` | VARCHAR(20) | NOT NULL | Contact phone number |
| `email` | VARCHAR(254) | UNIQUE, NOT NULL | Email address (validated) |
| `linkedin_url` | VARCHAR(500) | NULL | LinkedIn profile URL (validated) |
| `github_url` | VARCHAR(500) | NULL | GitHub profile URL (validated) |
| `address` | TEXT | NULL | Physical address |
| `created_at` | DATETIME | NOT NULL | Record creation timestamp |
| `updated_at` | DATETIME | NOT NULL | Record update timestamp |

**Indexes:**
- `idx_applicant_basic_info_email` on `email`

**Validations:**
- Email format validation
- LinkedIn URL format validation (must start with `https://linkedin.com/`)
- GitHub URL format validation (must start with `https://github.com/`)

**Usage Notes:**
- This table is designed for a single-user application
- Only one record should exist (representing the applicant)

### 2. academics

Stores educational background information.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `college_name` | VARCHAR(255) | NOT NULL | Name of educational institution |
| `graduation_date` | VARCHAR(50) | NOT NULL | Graduation date (flexible format) |
| `course` | VARCHAR(255) | NOT NULL | Degree/course name |
| `display_order` | INTEGER | DEFAULT 0 | Order for display purposes |
| `created_at` | DATETIME | NOT NULL | Record creation timestamp |
| `updated_at` | DATETIME | NOT NULL | Record update timestamp |

**Indexes:**
- `idx_academics_display_order` on `display_order`

**Default Ordering:**
- Ordered by `display_order` (ascending)

**Usage Notes:**
- Multiple academic records can exist
- `display_order` determines the sequence for display
- `graduation_date` is stored as string for flexibility (e.g., "2024", "May 2024", "2024-05")

### 3. achievements

Stores achievement points and accomplishments.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `achievement_point` | TEXT | NOT NULL | Description of achievement |
| `display_order` | INTEGER | DEFAULT 0 | Order for display purposes |
| `created_at` | DATETIME | NOT NULL | Record creation timestamp |
| `updated_at` | DATETIME | NOT NULL | Record update timestamp |

**Indexes:**
- `idx_achievements_display_order` on `display_order`

**Default Ordering:**
- Ordered by `display_order` (ascending)

**Usage Notes:**
- Multiple achievement records can exist
- `display_order` determines the sequence for display
- `achievement_point` can contain detailed descriptions

### 4. skills

Master skills list storing all available skills.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `skill_name` | VARCHAR(100) | UNIQUE, NOT NULL | Name of the skill |
| `category` | VARCHAR(50) | NULL | Skill category (e.g., "Programming", "Languages") |
| `created_at` | DATETIME | NOT NULL | Record creation timestamp |
| `updated_at` | DATETIME | NOT NULL | Record update timestamp |

**Indexes:**
- `idx_skills_name` on `skill_name`
- `idx_skills_category` on `category`

**Constraints:**
- `skill_name` must be unique

**Usage Notes:**
- This is a master list of all available skills
- Skills can be categorized for better organization
- Referenced by `user_skills` and `project_skills` tables

### 5. user_skills

Junction table linking skills to the user's skill list.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `skill` | UUID | FOREIGN KEY, UNIQUE | Reference to skills table |
| `created_at` | DATETIME | NOT NULL | Record creation timestamp |

**Indexes:**
- `idx_user_skills_skill_id` on `skill`

**Relationships:**
- **OneToOne** with `skills` table
- **CASCADE DELETE**: If skill is deleted, user_skill is deleted

**Constraints:**
- Each skill can only be in user_skills once (UNIQUE constraint)

**Usage Notes:**
- Represents the user's selected skills
- One-to-one relationship ensures each skill appears only once in user's list

### 6. projects

Stores project information.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `project_name` | VARCHAR(255) | NOT NULL | Name of the project |
| `project_info` | TEXT | NOT NULL | Detailed project description |
| `display_order` | INTEGER | DEFAULT 0 | Order for display purposes |
| `created_at` | DATETIME | NOT NULL | Record creation timestamp |
| `updated_at` | DATETIME | NOT NULL | Record update timestamp |

**Indexes:**
- `idx_projects_display_order` on `display_order`

**Default Ordering:**
- Ordered by `display_order` (ascending)

**Usage Notes:**
- Multiple project records can exist
- `display_order` determines the sequence for display
- Linked to skills via `project_skills` table

### 7. project_skills

Junction table linking skills to specific projects.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `project` | UUID | FOREIGN KEY | Reference to projects table |
| `skill` | UUID | FOREIGN KEY | Reference to skills table |
| `created_at` | DATETIME | NOT NULL | Record creation timestamp |

**Indexes:**
- `idx_project_skills_project_id` on `project`
- `idx_project_skills_skill_id` on `skill`

**Relationships:**
- **ManyToMany** between `projects` and `skills`
- **CASCADE DELETE**: If project or skill is deleted, the relationship is deleted

**Constraints:**
- Unique constraint on `(project, skill)` combination
- Prevents duplicate skill assignments to the same project

**Usage Notes:**
- Represents many-to-many relationship between projects and skills
- A project can have multiple skills
- A skill can be used in multiple projects

### 8. experiences

Stores work experience information.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `experience_name` | VARCHAR(255) | NOT NULL | Company/organization name |
| `start_date` | VARCHAR(50) | NOT NULL | Start date (flexible format) |
| `end_date` | VARCHAR(50) | NOT NULL | End date (flexible format) |
| `role` | VARCHAR(255) | NULL | Job title/role |
| `location` | VARCHAR(50) | NULL | Work location (city, state, remote, etc.) |
| `experience_explanation` | TEXT | NOT NULL | Detailed job description |
| `display_order` | INTEGER | DEFAULT 0 | Order for display purposes |
| `created_at` | DATETIME | NOT NULL | Record creation timestamp |
| `updated_at` | DATETIME | NOT NULL | Record update timestamp |

**Indexes:**
- `idx_experiences_display_order` on `display_order`

**Default Ordering:**
- Ordered by `display_order` (ascending)

**Usage Notes:**
- Multiple experience records can exist
- `display_order` determines the sequence for display
- Dates stored as strings for flexibility (e.g., "2020-2024", "Jan 2020 - Present")

### 9. applications

Stores job application tracking information.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `job_name` | VARCHAR(255) | NOT NULL | Job title/position name |
| `company_name` | VARCHAR(255) | NOT NULL | Company name |
| `job_link` | VARCHAR(500) | NOT NULL | Job posting URL (validated) |
| `resume_file_path` | VARCHAR(500) | NOT NULL | Path to resume file in ResumeBlobs folder |
| `status` | VARCHAR(50) | NOT NULL, DEFAULT 'Applied' | Application status |
| `notes` | TEXT | NULL | Additional notes about the application |
| `created_at` | DATETIME | NOT NULL | Record creation timestamp |
| `updated_at` | DATETIME | NOT NULL | Record update timestamp |

**Indexes:**
- `idx_applications_status` on `status`
- `idx_applications_company_name` on `company_name`

**Constraints:**
- `status` must be one of: 'Applied', 'Rejected', 'Timed out', 'Processed', 'Accepted', 'Interview'
- `job_link` must be a valid HTTP/HTTPS URL

**Status Values:**
- `Applied` - Application submitted
- `Rejected` - Application rejected
- `Timed out` - No response received
- `Processed` - Application being processed
- `Accepted` - Application accepted
- `Interview` - Interview scheduled/completed

**Usage Notes:**
- Tracks job applications with status updates
- `resume_file_path` references files stored in `ResumeBlobs/` folder
- Status can be updated as application progresses

## Relationships

### Entity Relationship Overview

```
applicant_basic_info (1)
    ↓
    └─ Standalone (no foreign keys)

academics (many)
    └─ Standalone (no foreign keys)

achievements (many)
    └─ Standalone (no foreign keys)

skills (many)
    ├─→ user_skills (1:1)
    └─→ project_skills (many)

projects (many)
    └─→ project_skills (many)

experiences (many)
    └─ Standalone (no foreign keys)

applications (many)
    └─ Standalone (no foreign keys)
```

### Foreign Key Relationships

1. **user_skills → skills**
   - Type: OneToOne
   - On Delete: CASCADE
   - Constraint: UNIQUE on skill_id

2. **project_skills → projects**
   - Type: ForeignKey
   - On Delete: CASCADE

3. **project_skills → skills**
   - Type: ForeignKey
   - On Delete: CASCADE
   - Constraint: UNIQUE on (project_id, skill_id)

## Indexes

### Index Summary

| Table | Index Name | Fields | Purpose |
|-------|-----------|--------|---------|
| `applicant_basic_info` | `idx_applicant_basic_info_email` | `email` | Fast email lookups |
| `academics` | `idx_academics_display_order` | `display_order` | Efficient sorting |
| `achievements` | `idx_achievements_display_order` | `display_order` | Efficient sorting |
| `skills` | `idx_skills_name` | `skill_name` | Fast skill lookups |
| `skills` | `idx_skills_category` | `category` | Filter by category |
| `user_skills` | `idx_user_skills_skill_id` | `skill` | Join optimization |
| `projects` | `idx_projects_display_order` | `display_order` | Efficient sorting |
| `project_skills` | `idx_project_skills_project_id` | `project` | Join optimization |
| `project_skills` | `idx_project_skills_skill_id` | `skill` | Join optimization |
| `experiences` | `idx_experiences_display_order` | `display_order` | Efficient sorting |
| `applications` | `idx_applications_status` | `status` | Filter by status |
| `applications` | `idx_applications_company_name` | `company_name` | Search by company |

## Data Types

### UUID
- **Type**: UUID (Universally Unique Identifier)
- **Format**: 32 hexadecimal characters (e.g., `550e8400-e29b-41d4-a716-446655440000`)
- **Usage**: Primary keys for all tables
- **Generation**: Automatic via `uuid.uuid4()`

### VARCHAR
- **Type**: Variable-length character string
- **Max Length**: Varies by field (20-500 characters)
- **Usage**: Names, URLs, short text fields

### TEXT
- **Type**: Unlimited-length text
- **Usage**: Long descriptions, notes, addresses

### INTEGER
- **Type**: Signed integer
- **Usage**: Display order values, counts

### DATETIME
- **Type**: Date and time
- **Format**: ISO 8601 (e.g., `2024-01-01T12:00:00Z`)
- **Usage**: Timestamps (created_at, updated_at)
- **Auto-generation**: Automatic via Django's `auto_now_add` and `auto_now`

## Constraints

### Primary Keys
- All tables use UUID primary keys
- Primary keys are automatically generated

### Unique Constraints
- `applicant_basic_info.email` - Email must be unique
- `skills.skill_name` - Skill name must be unique
- `user_skills.skill` - Each skill can only be in user_skills once
- `project_skills(project, skill)` - Unique combination of project and skill

### Foreign Key Constraints
- All foreign keys use CASCADE delete
- Referential integrity maintained by database

### Check Constraints (via Django Validators)
- Email format validation
- URL format validation (LinkedIn, GitHub, job links)
- Status value validation (applications table)

## Usage Examples

### Query Examples

#### Get All Skills
```sql
SELECT skill_name, category 
FROM skills 
ORDER BY category, skill_name;
```

#### Get User Skills
```sql
SELECT s.skill_name, s.category 
FROM user_skills us
JOIN skills s ON us.skill_id = s.id
ORDER BY s.category;
```

#### Get Projects with Skills
```sql
SELECT p.project_name, GROUP_CONCAT(s.skill_name, ', ') as skills
FROM projects p
LEFT JOIN project_skills ps ON p.id = ps.project_id
LEFT JOIN skills s ON ps.skill_id = s.id
GROUP BY p.id, p.project_name
ORDER BY p.display_order;
```

#### Get Applications by Status
```sql
SELECT job_name, company_name, status, created_at
FROM applications
WHERE status = 'Applied'
ORDER BY created_at DESC;
```

#### Count Applications by Status
```sql
SELECT status, COUNT(*) as count 
FROM applications 
GROUP BY status;
```

### Django ORM Examples

#### Create Applicant Info
```python
from BackendApp.models import ApplicantBasicInfo

applicant = ApplicantBasicInfo.objects.create(
    full_name="John Doe",
    email="john@example.com",
    phone_number="1234567890",
    linkedin_url="https://linkedin.com/in/johndoe"
)
```

#### Add Skills
```python
from BackendApp.models import Skills, UserSkills

# Create skill
skill = Skills.objects.create(
    skill_name="Python",
    category="Programming"
)

# Add to user skills
user_skill = UserSkills.objects.create(skill=skill)
```

#### Create Project with Skills
```python
from BackendApp.models import Projects, ProjectSkills, Skills

# Create project
project = Projects.objects.create(
    project_name="Resume Analyzer",
    project_info="A Django-based resume analysis system",
    display_order=1
)

# Link skills
python_skill = Skills.objects.get(skill_name="Python")
django_skill = Skills.objects.get(skill_name="Django")

ProjectSkills.objects.create(project=project, skill=python_skill)
ProjectSkills.objects.create(project=project, skill=django_skill)
```

#### Track Application
```python
from BackendApp.models import Applications

application = Applications.objects.create(
    job_name="Software Engineer",
    company_name="Tech Corp",
    job_link="https://example.com/job/123",
    resume_file_path="ResumeBlobs/resume_2024.pdf",
    status="Applied",
    notes="Applied through company website"
)
```

## Migration Notes

### Creating Tables

Tables are created via Django migrations:

```bash
python manage.py makemigrations BackendApp
python manage.py migrate
```

### Verifying Schema

```bash
# Using SQL query runner
python run_sql.py ".tables"
python run_sql.py ".schema applicant_basic_info"

# Using Django shell
python manage.py dbshell
```

## Best Practices

1. **Always use UUIDs** for primary keys (already implemented)
2. **Use display_order** for ordered lists (academics, achievements, projects, experiences)
3. **Validate URLs** before storing (handled by Django validators)
4. **Maintain referential integrity** (handled by foreign keys)
5. **Use indexes** for frequently queried fields (already implemented)
6. **Store dates as strings** for flexibility in academics and experiences tables
7. **Track timestamps** for audit trails (created_at, updated_at)

## Related Documentation

- [Database Implementation Summary](08-database-implementation.md)
- [SQL Query Runner Guide](07-sql-query-runner.md)
- [Main README](02-readme.md)

---

**Last Updated**: 2025  
**Database Version**: 1.0  
**Total Tables**: 9 user tables

