# Resume Analyzer Backend REST API

A comprehensive Django REST API for managing resume information and job applications.

## 🚀 Quick Start

```bash
# 1. Navigate to Backend directory
cd /Volumes/SushanthSSD/Projects/ResumeAnalyzer/Backend

# 2. Activate virtual environment
source venv/bin/activate

# 3. Run migrations (if needed)
python manage.py migrate

# 4. Start the server
python manage.py runserver

# 5. Test the APIs (in new terminal)
python test_api_comprehensive.py
```

Server runs at: **http://localhost:8000**

## 📚 Documentation

- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Complete API reference with examples
- **[QUICK_START_API.md](QUICK_START_API.md)** - Step-by-step setup and testing guide
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Technical implementation details

## 🎯 Features

- ✅ **37 REST API Endpoints** across 10 categories
- ✅ **Function-based views** for simplicity
- ✅ **File upload/download** for resumes (PDF, DOC, DOCX)
- ✅ **Complete CRUD operations** for all entities
- ✅ **Filtering, sorting, pagination** for applications
- ✅ **Reordering support** for ordered lists
- ✅ **Comprehensive error handling** with clear error codes
- ✅ **Database schema compliance** with UUID primary keys
- ✅ **Resume storage** in ResumeBlobs folder

## 📋 API Categories

| Category | Endpoints | Description |
|----------|-----------|-------------|
| [Basic Info](#basic-information) | 2 | Applicant's personal information |
| [Academics](#academics) | 5 | Education records |
| [Achievements](#achievements) | 5 | Achievement points |
| [Skills](#skills) | 5 | Skills management |
| [Projects](#projects) | 5 | Project portfolio |
| [Experiences](#experiences) | 5 | Work experience |
| [Complete Info](#complete-info) | 1 | All data in one call |
| [Applications](#applications) | 5 | Job applications |
| [Resume Files](#resume-files) | 3 | File management |
| [Statistics](#statistics) | 1 | Analytics |

## 🔗 Key Endpoints

### Basic Information
```http
GET    /api/applicant-info/basic       # Get basic info
PUT    /api/applicant-info/basic       # Create/update basic info
```

### Academics
```http
GET    /api/applicant-info/academics        # List all
POST   /api/applicant-info/academics        # Create new
PUT    /api/applicant-info/academics/{id}   # Update
DELETE /api/applicant-info/academics/{id}   # Delete
PATCH  /api/applicant-info/academics/reorder # Reorder
```

### Skills
```http
GET    /api/skills                      # List all available skills
POST   /api/skills                      # Create new skill
GET    /api/applicant-info/skills       # Get user's skills
POST   /api/applicant-info/skills       # Add skills to user
DELETE /api/applicant-info/skills       # Remove skills from user
```

### Applications
```http
GET    /api/applications                # List all (with filters)
POST   /api/applications                # Create new
GET    /api/applications/{id}           # Get by ID
PUT    /api/applications/{id}           # Update
DELETE /api/applications/{id}           # Delete
GET    /api/applications/stats          # Get statistics
```

### Resume Files
```http
POST   /api/applications/{id}/resume/upload   # Upload resume
GET    /api/applications/{id}/resume/download # Download resume
DELETE /api/applications/{id}/resume          # Delete resume
```

### Complete Info
```http
GET    /api/applicant-info/complete    # Get all applicant data
```

## 💡 Usage Examples

### Get Complete Applicant Information
```bash
curl http://localhost:8000/api/applicant-info/complete
```

### Create Basic Information
```bash
curl -X PUT http://localhost:8000/api/applicant-info/basic \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "phoneNumber": "1234567890",
    "email": "john@example.com",
    "linkedinUrl": "https://linkedin.com/in/johndoe"
  }'
```

### Create Application
```bash
curl -X POST http://localhost:8000/api/applications \
  -H "Content-Type: application/json" \
  -d '{
    "jobName": "Software Engineer",
    "companyName": "Google",
    "jobLink": "https://careers.google.com/jobs/123",
    "status": "Applied"
  }'
```

### Upload Resume
```bash
curl -X POST http://localhost:8000/api/applications/{id}/resume/upload \
  -F "file=@/path/to/resume.pdf"
```

### Get Application Statistics
```bash
curl http://localhost:8000/api/applications/stats
```

## 🧪 Testing

### Automated Test Suite
```bash
python test_api_comprehensive.py
```

This will test all 37 endpoints with sample data and provide colored output.

### Manual Testing
- Use Postman, Insomnia, or cURL
- Visit http://localhost:8000/api/ endpoints in browser
- Check `QUICK_START_API.md` for detailed examples

### Admin Interface
Access Django admin at: http://localhost:8000/admin

## 📦 Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": { ... }
  }
}
```

## 🔧 Configuration

### Database
- **Development:** SQLite (`db.sqlite3`)
- **Production:** PostgreSQL recommended

### File Storage
- **Location:** `ResumeBlobs/` directory
- **Max Size:** 10MB per file
- **Formats:** PDF, DOC, DOCX

### Settings
- **BASE_URL:** http://localhost:8000/api
- **MEDIA_ROOT:** ResumeBlobs/
- **FILE_UPLOAD_MAX_MEMORY_SIZE:** 10MB

## 📁 Project Structure

```
Backend/
├── BackendApp/
│   ├── views.py           # All API views (1,500+ lines)
│   ├── urls.py            # URL routing
│   ├── models.py          # Database models
│   └── ...
├── ResumeAnalyzer/
│   ├── settings.py        # Django settings
│   ├── urls.py            # Main URL config
│   └── ...
├── ResumeBlobs/           # Resume file storage
├── test_api_comprehensive.py  # Test suite
├── API_DOCUMENTATION.md   # Full API docs
└── README_API.md          # This file
```

## ⚠️ Common Issues

### Port Already in Use
```bash
python manage.py runserver 8001
```

### Database Errors
```bash
python manage.py migrate --run-syncdb
```

### Module Not Found
```bash
pip install -r requirements.txt
```

## 🔒 Security Notes

**Current Setup (Development):**
- ⚠️ CSRF disabled for testing
- ⚠️ No authentication required
- ⚠️ Debug mode enabled

**Production Requirements:**
- ✅ Enable authentication
- ✅ Enable CSRF protection
- ✅ Set DEBUG=False
- ✅ Use HTTPS
- ✅ Implement rate limiting
- ✅ Add virus scanning for uploads

## 📊 Database Models

- `ApplicantBasicInfo` - Personal information
- `Academics` - Education records
- `Achievements` - Achievement points
- `Skills` - Master skills list
- `UserSkills` - User's selected skills
- `Projects` - Project portfolio
- `ProjectSkills` - Project-skill associations
- `Experiences` - Work experience
- `Applications` - Job applications

All use UUID primary keys and include timestamps.

## 🎓 API Categories Breakdown

### 1. Basic Information (2)
- GET/PUT basic info

### 2. Academics (5)
- List, Create, Update, Delete, Reorder

### 3. Achievements (5)
- List, Create, Update, Delete, Reorder

### 4. Skills (5)
- List all skills, Create skill, User skills CRUD

### 5. Projects (5)
- List, Create, Update, Delete, Reorder (with skills)

### 6. Experiences (5)
- List, Create, Update, Delete, Reorder

### 7. Complete Info (1)
- Get all applicant data

### 8. Applications (5)
- List (filtered), Create, Get by ID, Update, Delete

### 9. Resume Files (3)
- Upload, Download, Delete

### 10. Statistics (1)
- Application analytics

## 🚦 Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request (validation error) |
| 404 | Not Found |
| 500 | Server Error |

## 🔗 Related Documentation

- [Database Schema](doc/04-database-schema.md)
- [Implementation Summary](IMPLEMENTATION_SUMMARY.md)
- [Quick Start Guide](QUICK_START_API.md)

## 📝 License

This is part of the Resume Analyzer project.

## 👥 Support

For issues:
1. Check [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
2. Review Django server logs
3. Run test suite for debugging

---

**Version:** 1.0  
**Framework:** Django 4.2.7 + DRF 3.14.0  
**Status:** ✅ Production Ready (with security hardening)  
**Total Endpoints:** 37

