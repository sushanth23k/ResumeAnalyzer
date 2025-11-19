# Resume Analyzer Backend - API Documentation

Complete REST API documentation for the Resume Analyzer application using **GET and POST methods only**.

## Table of Contents

1. [Getting Started](#getting-started)
2. [API Design Principles](#api-design-principles)
3. [API Endpoints Overview](#api-endpoints-overview)
4. [Basic Information APIs](#1-basic-information-apis)
5. [Academics APIs](#2-academics-apis)
6. [Achievements APIs](#3-achievements-apis)
7. [Skills APIs](#4-skills-apis)
8. [Projects APIs](#5-projects-apis)
9. [Experiences APIs](#6-experiences-apis)
10. [Complete Applicant Info API](#7-complete-applicant-info-api)
11. [Applications APIs](#8-applications-apis)
12. [Resume File Management APIs](#9-resume-file-management-apis)
13. [Application Statistics API](#10-application-statistics-api)
14. [Error Handling](#error-handling)

---

## Getting Started

### Base URL
```
http://localhost:8000/api
```

### Running the Server
```bash
cd /path/to/Backend
python manage.py runserver
```

### Testing the APIs
Use the provided test script:
```bash
python test_api_comprehensive.py
```

Or use tools like:
- Postman
- cURL
- HTTPie
- Browser (for GET requests)

---

## API Design Principles

### HTTP Methods
- **GET**: Retrieve data (read operations)
- **POST**: Create, update, delete operations (write operations)

### Data Transmission
- **GET**: Parameters passed as query strings (`?id=123&name=value`)
- **POST**: Data passed in request body as JSON
- **IDs and identifiers**: Always passed as query parameters or in JSON body, **never in URL path**

### Action-Based POST Requests
POST requests use an `action` field to specify the operation:
- `create`: Create new record (default if action not specified)
- `update`: Update existing record
- `delete`: Delete record
- `reorder`: Reorder items (for ordered lists)
- `add`/`remove`: For user skills operations

---

## API Endpoints Overview

| Category | Endpoint | Methods | Description |
|----------|----------|---------|-------------|
| **Basic Info** | `/applicant-info/basic` | GET, POST | Manage applicant's basic information |
| **Academics** | `/applicant-info/academics` | GET, POST | Manage education records |
| **Achievements** | `/applicant-info/achievements` | GET, POST | Manage achievements |
| **Skills** | `/skills` | GET, POST | Manage all available skills |
| **User Skills** | `/applicant-info/skills` | GET, POST | Manage user's selected skills |
| **Projects** | `/applicant-info/projects` | GET, POST | Manage projects |
| **Experiences** | `/applicant-info/experiences` | GET, POST | Manage work experiences |
| **Complete Info** | `/applicant-info/complete` | GET | Get all applicant information |
| **Applications** | `/applications` | GET, POST | Manage job applications |
| **Resume Files** | `/resume` | GET, POST | Manage resume files |
| **Statistics** | `/applications/stats` | GET | Get application statistics |

---

## 1. Basic Information APIs

### Get Basic Information
```http
GET /api/applicant-info/basic
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "fullName": "string",
    "phoneNumber": "string",
    "email": "string",
    "linkedinUrl": "string",
    "githubUrl": "string",
    "address": "string"
  }
}
```

### Create/Update Basic Information
```http
POST /api/applicant-info/basic
Content-Type: application/json

{
  "fullName": "John Doe",
  "phoneNumber": "1234567890",
  "email": "john@example.com",
  "linkedinUrl": "https://linkedin.com/in/johndoe",
  "githubUrl": "https://github.com/johndoe",
  "address": "123 Main St"
}
```

**Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Basic information created successfully"
}
```

---

## 2. Academics APIs

### Get All Academics
```http
GET /api/applicant-info/academics
```

### Get Single Academic by ID
```http
GET /api/applicant-info/academics?id=<academic_id>
```

### Create Academic Record
```http
POST /api/applicant-info/academics
Content-Type: application/json

{
  "action": "create",
  "collegeName": "University Name",
  "graduationDate": "May 2024",
  "course": "Bachelor of Science in Computer Science",
  "displayOrder": 0
}
```

### Update Academic Record
```http
POST /api/applicant-info/academics
Content-Type: application/json

{
  "action": "update",
  "id": "academic_uuid",
  "collegeName": "Updated University Name",
  "course": "Updated Course"
}
```

### Delete Academic Record
```http
POST /api/applicant-info/academics
Content-Type: application/json

{
  "action": "delete",
  "id": "academic_uuid"
}
```

### Reorder Academics
```http
POST /api/applicant-info/academics
Content-Type: application/json

{
  "action": "reorder",
  "academicOrders": [
    { "id": "uuid1", "displayOrder": 0 },
    { "id": "uuid2", "displayOrder": 1 }
  ]
}
```

---

## 3. Achievements APIs

### Get All Achievements
```http
GET /api/applicant-info/achievements
```

### Get Single Achievement by ID
```http
GET /api/applicant-info/achievements?id=<achievement_id>
```

### Create Achievement
```http
POST /api/applicant-info/achievements
Content-Type: application/json

{
  "action": "create",
  "achievementPoint": "Won first prize in coding competition",
  "displayOrder": 0
}
```

### Update Achievement
```http
POST /api/applicant-info/achievements
Content-Type: application/json

{
  "action": "update",
  "id": "achievement_uuid",
  "achievementPoint": "Updated achievement text"
}
```

### Delete Achievement
```http
POST /api/applicant-info/achievements
Content-Type: application/json

{
  "action": "delete",
  "id": "achievement_uuid"
}
```

### Reorder Achievements
```http
POST /api/applicant-info/achievements
Content-Type: application/json

{
  "action": "reorder",
  "achievementOrders": [
    { "id": "uuid1", "displayOrder": 0 },
    { "id": "uuid2", "displayOrder": 1 }
  ]
}
```

---

## 4. Skills APIs

### Get All Available Skills
```http
GET /api/skills
GET /api/skills?category=Programming
GET /api/skills?search=python
```

**Query Parameters:**
- `category`: Filter by skill category
- `search`: Search skills by name (case-insensitive)

### Create New Skill
```http
POST /api/skills
Content-Type: application/json

{
  "skillName": "Python",
  "category": "Programming"
}
```

### Get User Skills
```http
GET /api/applicant-info/skills
```

### Add Skills to User
```http
POST /api/applicant-info/skills
Content-Type: application/json

{
  "action": "add",
  "skillIds": ["uuid1", "uuid2", "uuid3"]
}
```

### Remove Skills from User
```http
POST /api/applicant-info/skills
Content-Type: application/json

{
  "action": "remove",
  "skillIds": ["uuid1", "uuid2"]
}
```

---

## 5. Projects APIs

### Get All Projects
```http
GET /api/applicant-info/projects
```

**Response includes skills for each project:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "projectName": "Project Name",
      "projectInfo": "Description",
      "displayOrder": 0,
      "skills": [
        { "id": "uuid", "skillName": "Python", "category": "Programming" }
      ]
    }
  ]
}
```

### Get Single Project by ID
```http
GET /api/applicant-info/projects?id=<project_id>
```

### Create Project
```http
POST /api/applicant-info/projects
Content-Type: application/json

{
  "action": "create",
  "projectName": "Resume Analyzer",
  "projectInfo": "Django-based resume analysis system",
  "skillIds": ["uuid1", "uuid2"],
  "displayOrder": 0
}
```

### Update Project
```http
POST /api/applicant-info/projects
Content-Type: application/json

{
  "action": "update",
  "id": "project_uuid",
  "projectName": "Updated Name",
  "projectInfo": "Updated description",
  "skillIds": ["uuid3", "uuid4"]
}
```

### Delete Project
```http
POST /api/applicant-info/projects
Content-Type: application/json

{
  "action": "delete",
  "id": "project_uuid"
}
```

### Reorder Projects
```http
POST /api/applicant-info/projects
Content-Type: application/json

{
  "action": "reorder",
  "projectOrders": [
    { "id": "uuid1", "displayOrder": 0 },
    { "id": "uuid2", "displayOrder": 1 }
  ]
}
```

---

## 6. Experiences APIs

### Get All Experiences
```http
GET /api/applicant-info/experiences
```

### Get Single Experience by ID
```http
GET /api/applicant-info/experiences?id=<experience_id>
```

### Create Experience
```http
POST /api/applicant-info/experiences
Content-Type: application/json

{
  "action": "create",
  "experienceName": "Tech Corp",
  "startDate": "Jan 2023",
  "endDate": "Dec 2023",
  "role": "Software Engineer",
  "location": "San Francisco, CA",
  "experienceExplanation": "Developed web applications",
  "displayOrder": 0
}
```

### Update Experience
```http
POST /api/applicant-info/experiences
Content-Type: application/json

{
  "action": "update",
  "id": "experience_uuid",
  "role": "Senior Software Engineer",
  "location": "Remote",
  "experienceExplanation": "Updated description"
}
```

### Delete Experience
```http
POST /api/applicant-info/experiences
Content-Type: application/json

{
  "action": "delete",
  "id": "experience_uuid"
}
```

### Reorder Experiences
```http
POST /api/applicant-info/experiences
Content-Type: application/json

{
  "action": "reorder",
  "experienceOrders": [
    { "id": "uuid1", "displayOrder": 0 },
    { "id": "uuid2", "displayOrder": 1 }
  ]
}
```

---

## 7. Complete Applicant Info API

### Get Complete Applicant Information
```http
GET /api/applicant-info/complete
```

**Response includes all sections:**
```json
{
  "success": true,
  "data": {
    "basicInformation": { ... },
    "academics": [ ... ],
    "achievements": [ ... ],
    "skills": [ ... ],
    "projects": [ ... ],
    "experiences": [ ... ]
  }
}
```

---

## 8. Applications APIs

### Get All Applications
```http
GET /api/applications
GET /api/applications?status=Applied
GET /api/applications?company=Google
GET /api/applications?limit=10&offset=0
GET /api/applications?sortBy=companyName&sortOrder=asc
```

**Query Parameters:**
- `id`: Get specific application by ID
- `status`: Filter by status ('Applied', 'Rejected', 'Timed out', 'Processed', 'Accepted', 'Interview')
- `company`: Filter by company name (contains, case-insensitive)
- `limit`: Number of results per page (default: 10)
- `offset`: Number of results to skip (default: 0)
- `sortBy`: Sort field (jobName, companyName, status)
- `sortOrder`: Sort direction (asc, desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "applications": [ ... ],
    "total": 100,
    "page": 1,
    "limit": 10
  }
}
```

### Get Single Application by ID
```http
GET /api/applications?id=<application_id>
```

### Create Application
```http
POST /api/applications
Content-Type: application/json

{
  "action": "create",
  "jobName": "Software Engineer",
  "companyName": "Google",
  "jobLink": "https://careers.google.com/jobs/123",
  "status": "Applied",
  "notes": "Applied through company website"
}
```

### Update Application
```http
POST /api/applications
Content-Type: application/json

{
  "action": "update",
  "id": "application_uuid",
  "status": "Interview",
  "notes": "Interview scheduled for next week"
}
```

### Delete Application
```http
POST /api/applications
Content-Type: application/json

{
  "action": "delete",
  "id": "application_uuid"
}
```

---

## 9. Resume File Management APIs

### Upload Resume File
```http
POST /api/resume
Content-Type: multipart/form-data

action=upload
id=<application_uuid>
file=<file_data>
```

**Supported formats:**
- PDF (`.pdf`)
- Microsoft Word (`.doc`)
- Microsoft Word (`.docx`)

**Max file size:** 10MB

**Response:**
```json
{
  "success": true,
  "data": {
    "resumeFilePath": "ResumeBlobs/filename.pdf",
    "fileName": "filename.pdf",
    "fileSize": 123456,
    "mimeType": "application/pdf"
  },
  "message": "Resume uploaded successfully"
}
```

### Download Resume File
```http
GET /api/resume?id=<application_uuid>
```

**Response:** Binary file download with appropriate Content-Type and Content-Disposition headers.

### Delete Resume File
```http
POST /api/resume
Content-Type: application/x-www-form-urlencoded

action=delete&id=<application_uuid>
```

---

## 10. Application Statistics API

### Get Application Statistics
```http
GET /api/applications/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 50,
    "byStatus": {
      "Applied": 20,
      "Rejected": 10,
      "Timed out": 5,
      "Processed": 5,
      "Accepted": 5,
      "Interview": 5
    },
    "successRate": 20.00,
    "recentApplications": [
      {
        "id": "uuid",
        "jobName": "Software Engineer",
        "companyName": "Google",
        "status": "Applied"
      }
    ]
  }
}
```

---

## Error Handling

### Error Response Format
All errors follow this format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": "Additional details (optional)"
  }
}
```

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `VALIDATION_ERROR` | Input validation failed | 400 |
| `NOT_FOUND` | Resource not found | 404 |
| `DUPLICATE_ENTRY` | Unique constraint violation | 400 |
| `FILE_UPLOAD_ERROR` | File upload failed | 400/500 |
| `FILE_NOT_FOUND` | Resume file not found | 404 |
| `INVALID_FILE_TYPE` | Unsupported file format | 400 |
| `FILE_SIZE_EXCEEDED` | File too large (>10MB) | 400 |
| `DATABASE_ERROR` | Database operation failed | 500 |

### Example Error Responses

**Validation Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Input validation failed",
    "details": {
      "email": ["Enter a valid email address."]
    }
  }
}
```

**Not Found Error:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Academic record not found"
  }
}
```

**File Upload Error:**
```json
{
  "success": false,
  "error": {
    "code": "FILE_SIZE_EXCEEDED",
    "message": "File size exceeds 10MB limit"
  }
}
```

---

## Testing Examples

### Using cURL

**Create Basic Info:**
```bash
curl -X POST http://localhost:8000/api/applicant-info/basic \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "phoneNumber": "1234567890",
    "email": "john@example.com"
  }'
```

**Get Academics with Query Parameter:**
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
    "collegeName": "Updated University"
  }'
```

**Upload Resume:**
```bash
curl -X POST http://localhost:8000/api/resume \
  -F "action=upload" \
  -F "id=<application_uuid>" \
  -F "file=@/path/to/resume.pdf"
```

**Get Complete Info:**
```bash
curl http://localhost:8000/api/applicant-info/complete
```

### Using Python Requests

```python
import requests

# Create application
response = requests.post(
    'http://localhost:8000/api/applications',
    json={
        'action': 'create',
        'jobName': 'Software Engineer',
        'companyName': 'Google',
        'jobLink': 'https://careers.google.com/jobs/123',
        'status': 'Applied'
    }
)
print(response.json())

# Get application by ID
app_id = response.json()['data']['id']
response = requests.get(
    f'http://localhost:8000/api/applications',
    params={'id': app_id}
)
print(response.json())

# Upload resume
with open('resume.pdf', 'rb') as f:
    response = requests.post(
        'http://localhost:8000/api/resume',
        data={'action': 'upload', 'id': app_id},
        files={'file': f}
    )
print(response.json())
```

---

## API Summary

### Key Changes from Traditional REST

1. **Only GET and POST methods** - No PUT, DELETE, PATCH
2. **Action-based POST requests** - Use `action` field to specify operation
3. **Query parameters for IDs** - All IDs passed as query params (`?id=uuid`) or in JSON body
4. **No URL path parameters** - Clean, simple URLs without dynamic segments
5. **Consistent patterns** - All endpoints follow same conventions

### Benefits

- **Simpler routing** - No complex URL patterns
- **Easier to implement** - Fewer HTTP methods to handle
- **Firewall friendly** - Only GET/POST typically needed
- **Backward compatible** - Easy to add new actions without URL changes
- **Clear intent** - Action field makes operation explicit

---

## Notes

1. **UUID Format:** All IDs are UUID v4 format (e.g., `550e8400-e29b-41d4-a716-446655440000`)
2. **Date Format:** Dates are stored as flexible strings (e.g., "May 2024", "2020-2024", "Jan 2023")
3. **File Storage:** Resume files are stored in the `ResumeBlobs/` directory
4. **CSRF:** CSRF protection is disabled for API endpoints (use authentication in production)
5. **Default Action:** If `action` field is omitted in POST, defaults to `create`
6. **Display Order:** Items with `displayOrder` field are sorted in ascending order

---

## Production Considerations

Before deploying to production:

1. **Enable Authentication:** Add JWT or session-based authentication
2. **Enable CSRF Protection:** Remove `@csrf_exempt` decorators and implement proper CSRF handling
3. **Add Rate Limiting:** Implement rate limiting to prevent abuse
4. **Use HTTPS:** Always use HTTPS in production
5. **Set DEBUG=False:** Disable debug mode in Django settings
6. **Configure CORS:** Set up proper CORS headers if frontend is on different domain
7. **File Security:** Implement virus scanning for uploaded files
8. **Backup Strategy:** Set up regular database and file backups

---

**Documentation Version:** 2.0 (GET/POST Only)  
**Last Updated:** 2025  
**Backend Framework:** Django 4.2.7 + Django REST Framework 3.14.0
