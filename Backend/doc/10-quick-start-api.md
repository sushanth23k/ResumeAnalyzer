# Quick Start Guide - Resume Analyzer API

This guide will help you get the Resume Analyzer backend API up and running quickly with the new **GET/POST only** design.

## Prerequisites

- Python 3.8+ installed
- Virtual environment activated
- Django and dependencies installed

## Step 1: Setup

```bash
# Navigate to Backend directory
cd /Volumes/SushanthSSD/Projects/ResumeAnalyzer/Backend

# Activate virtual environment (if not already activated)
source venv/bin/activate

# Install dependencies (if not already installed)
pip install -r requirements.txt
```

## Step 2: Database Setup

```bash
# Run migrations (if not already done)
python manage.py makemigrations
python manage.py migrate

# Optional: Create superuser for admin access
python manage.py createsuperuser
```

## Step 3: Start the Server

```bash
# Start Django development server
python manage.py runserver
```

The server will start at: `http://localhost:8000`

## Step 4: Test the API

### Option 1: Quick Browser Test

Visit in your browser:
```
http://localhost:8000/api/applicant-info/complete
http://localhost:8000/api/skills
http://localhost:8000/api/applications/stats
```

### Option 2: Using cURL

**Test Basic Info (POST):**
```bash
curl -X POST http://localhost:8000/api/applicant-info/basic \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "phoneNumber": "1234567890",
    "email": "john@example.com"
  }'
```

**Test Basic Info (GET):**
```bash
curl http://localhost:8000/api/applicant-info/basic
```

**Create a Skill:**
```bash
curl -X POST http://localhost:8000/api/skills \
  -H "Content-Type: application/json" \
  -d '{
    "skillName": "Python",
    "category": "Programming"
  }'
```

**Get All Skills:**
```bash
curl http://localhost:8000/api/skills
```

**Create an Academic Record:**
```bash
curl -X POST http://localhost:8000/api/applicant-info/academics \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create",
    "collegeName": "MIT",
    "graduationDate": "May 2024",
    "course": "BS Computer Science"
  }'
```

**Get Academic by ID (Save the ID from create response):**
```bash
curl "http://localhost:8000/api/applicant-info/academics?id=<academic_uuid>"
```

**Update Academic:**
```bash
curl -X POST http://localhost:8000/api/applicant-info/academics \
  -H "Content-Type: application/json" \
  -d '{
    "action": "update",
    "id": "<academic_uuid>",
    "course": "BS Computer Science (Updated)"
  }'
```

**Delete Academic:**
```bash
curl -X POST http://localhost:8000/api/applicant-info/academics \
  -H "Content-Type: application/json" \
  -d '{
    "action": "delete",
    "id": "<academic_uuid>"
  }'
```

### Option 3: Using Postman or Insomnia

1. Import the API endpoints from `doc/09-api-documentation.md`
2. Set base URL to `http://localhost:8000/api`
3. For POST requests, set Content-Type to `application/json`
4. Use query parameters for GET requests with IDs
5. Use `action` field in POST body to specify operations

## API Design Overview

### Key Concepts

1. **Only GET and POST Methods**
   - GET: Retrieve data
   - POST: Create, update, delete operations

2. **Action-Based POST Requests**
   ```json
   {
     "action": "create",  // or "update", "delete", "reorder", "add", "remove"
     // ... other fields
   }
   ```

3. **Query Parameters for IDs**
   ```
   GET /api/applicant-info/academics?id=<uuid>
   ```

4. **Clean URLs**
   - No URL path parameters
   - Simple, predictable endpoints

## Common Operations

### Create Complete Applicant Profile

```bash
# 1. Basic Info
curl -X POST http://localhost:8000/api/applicant-info/basic \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Jane Doe",
    "phoneNumber": "9876543210",
    "email": "jane@example.com",
    "linkedinUrl": "https://linkedin.com/in/janedoe",
    "githubUrl": "https://github.com/janedoe"
  }'

# 2. Add Education
curl -X POST http://localhost:8000/api/applicant-info/academics \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create",
    "collegeName": "MIT",
    "graduationDate": "May 2024",
    "course": "BS Computer Science"
  }'

# 3. Add Skills
curl -X POST http://localhost:8000/api/skills \
  -H "Content-Type: application/json" \
  -d '{"skillName": "Python", "category": "Programming"}'

# Get the skill ID from response, then add to user
curl -X POST http://localhost:8000/api/applicant-info/skills \
  -H "Content-Type: application/json" \
  -d '{
    "action": "add",
    "skillIds": ["<skill-id-here>"]
  }'

# 4. Add Project
curl -X POST http://localhost:8000/api/applicant-info/projects \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create",
    "projectName": "Resume Analyzer",
    "projectInfo": "Django REST API project",
    "skillIds": ["<skill-id-here>"]
  }'

# 5. Get Complete Profile
curl http://localhost:8000/api/applicant-info/complete
```

### Managing Applications

```bash
# Create application
curl -X POST http://localhost:8000/api/applications \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create",
    "jobName": "Software Engineer",
    "companyName": "Google",
    "jobLink": "https://careers.google.com/jobs/123",
    "status": "Applied"
  }'

# Get application by ID
curl "http://localhost:8000/api/applications?id=<application_uuid>"

# Update application status
curl -X POST http://localhost:8000/api/applications \
  -H "Content-Type: application/json" \
  -d '{
    "action": "update",
    "id": "<application_uuid>",
    "status": "Interview",
    "notes": "Interview next week"
  }'

# Upload resume
curl -X POST http://localhost:8000/api/resume \
  -F "action=upload" \
  -F "id=<application_uuid>" \
  -F "file=@/path/to/resume.pdf"

# Download resume
curl "http://localhost:8000/api/resume?id=<application_uuid>" -O

# View statistics
curl http://localhost:8000/api/applications/stats
```

## Available Endpoints

| Endpoint | GET | POST Actions |
|----------|-----|--------------|
| `/applicant-info/basic` | Get info | Create/update |
| `/applicant-info/academics` | Get all/single | create, update, delete, reorder |
| `/applicant-info/achievements` | Get all/single | create, update, delete, reorder |
| `/skills` | Get all | Create skill |
| `/applicant-info/skills` | Get user skills | add, remove |
| `/applicant-info/projects` | Get all/single | create, update, delete, reorder |
| `/applicant-info/experiences` | Get all/single | create, update, delete, reorder |
| `/applicant-info/complete` | Get all data | N/A |
| `/applications` | Get all/single | create, update, delete |
| `/applications/stats` | Get statistics | N/A |
| `/resume` | Download | upload, delete |

## Troubleshooting

### Port Already in Use
If port 8000 is already in use:
```bash
python manage.py runserver 8001
```
Then use `http://localhost:8001` as base URL.

### Database Errors
Reset the database:
```bash
rm db.sqlite3
python manage.py migrate
```

### Import Errors
Reinstall dependencies:
```bash
pip install -r requirements.txt --force-reinstall
```

### CSRF Errors
The API endpoints have CSRF protection disabled for development. In production, implement proper authentication and CSRF handling.

### Invalid Action Error
Make sure you're using one of the valid actions:
- `create` (or omit for default)
- `update`
- `delete`
- `reorder`
- `add` (for user skills)
- `remove` (for user skills)
- `upload` (for resume files)

### ID Not Found Errors
- For GET: Use query parameter `?id=<uuid>`
- For POST: Include `id` in JSON body
- Make sure UUID is valid and exists in database

## Python Examples

### Using requests library

```python
import requests

BASE_URL = "http://localhost:8000/api"

# Create basic info
response = requests.post(
    f"{BASE_URL}/applicant-info/basic",
    json={
        "fullName": "John Doe",
        "email": "john@example.com",
        "phoneNumber": "1234567890"
    }
)
print(response.json())

# Create academic
response = requests.post(
    f"{BASE_URL}/applicant-info/academics",
    json={
        "action": "create",
        "collegeName": "MIT",
        "graduationDate": "2024",
        "course": "CS"
    }
)
academic_id = response.json()['data']['id']

# Get academic by ID
response = requests.get(
    f"{BASE_URL}/applicant-info/academics",
    params={"id": academic_id}
)
print(response.json())

# Update academic
response = requests.post(
    f"{BASE_URL}/applicant-info/academics",
    json={
        "action": "update",
        "id": academic_id,
        "course": "Computer Science"
    }
)
print(response.json())

# Delete academic
response = requests.post(
    f"{BASE_URL}/applicant-info/academics",
    json={
        "action": "delete",
        "id": academic_id
    }
)
print(response.json())
```

## Next Steps

1. **Read Full Documentation:** See `doc/09-api-documentation.md` for complete API reference
2. **Integrate Frontend:** Connect your frontend application to these APIs
3. **Explore Admin:** Access http://localhost:8000/admin with superuser credentials
4. **Production Setup:** Follow production guidelines in documentation

## Support

For issues or questions:
1. Check `doc/09-api-documentation.md` for detailed endpoint information
2. Review Django server logs in terminal where server is running
3. Use Django admin to inspect database contents

---

**Quick Start Version:** 2.0 (GET/POST Only)  
**Last Updated:** 2025
