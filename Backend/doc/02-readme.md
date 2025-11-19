# ResumeAnalyzer - Main Documentation

A Django REST API application for resume analysis and job application tracking.

## Table of Contents

1. [Features](#features)
2. [Project Structure](#project-structure)
3. [Requirements](#requirements)
4. [Installation & Setup](#installation--setup)
5. [Configuration](#configuration)
6. [Database](#database)
7. [API Development](#api-development)
8. [Admin Interface](#admin-interface)
9. [Testing](#testing)
10. [Development Tips](#development-tips)
11. [Production Considerations](#production-considerations)
12. [Troubleshooting](#troubleshooting)

## Features

- ✅ Django REST Framework integration
- ✅ SQLite database (easily switchable to PostgreSQL/MySQL)
- ✅ Function-based API views
- ✅ Advanced query parameter support
- ✅ Comprehensive admin interface
- ✅ Database schema for resume management
- ✅ Job application tracking
- ✅ Skills and project management

## Project Structure

```
Backend/
├── manage.py                 # Django management script
├── requirements.txt          # Project dependencies
├── db.sqlite3               # SQLite database
├── run_sql.py               # SQL query runner script
├── ResumeBlobs/             # Resume file storage
├── ResumeAnalyzer/          # Main project directory
│   ├── settings.py          # Project settings
│   ├── urls.py              # Main URL configuration
│   ├── wsgi.py              # WSGI configuration
│   └── asgi.py              # ASGI configuration
├── BackendApp/              # Backend application
│   ├── models.py            # Database models
│   ├── admin.py             # Admin configuration
│   └── migrations/          # Database migrations
├── AnalyzerApp/             # Analyzer application
└── doc/                     # Documentation folder
```

## Requirements

- Python 3.8 or higher
- pip (Python package manager)

## Installation & Setup

### 1. Navigate to Project Directory

```bash
cd /Volumes/SushanthSSD/Projects/ResumeAnalyzer/Backend
```

### 2. Create and Activate Virtual Environment

```bash
# Create virtual environment (if not already created)
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate

# On Windows:
# venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Run Migrations

```bash
# Create database tables
python manage.py makemigrations
python manage.py migrate
```

### 5. Create Superuser (for Admin Access)

```bash
python manage.py createsuperuser
```

Follow the prompts to create an admin account.

### 6. Run the Development Server

```bash
python manage.py runserver
```

The server will start at `http://127.0.0.1:8000/`

## Configuration

### Settings

Key configuration files:
- `ResumeAnalyzer/settings.py` - Main settings file
- `requirements.txt` - Python dependencies

### Database Configuration

Default database is SQLite. To change to PostgreSQL/MySQL, update `settings.py`:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'your_database',
        'USER': 'your_user',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

## Database

### Schema Overview

The database includes the following main tables:
- `applicant_basic_info` - Personal information
- `academics` - Educational background
- `achievements` - Achievement points
- `skills` - Master skills list
- `user_skills` - User's selected skills
- `projects` - Project information
- `project_skills` - Skills linked to projects
- `experiences` - Work experience
- `applications` - Job application tracking

For detailed schema documentation, see [Database Schema](04-database-schema.md).

### Running SQL Queries

Use the SQL query runner script:

```bash
# Interactive mode
python run_sql.py

# Command line mode
python run_sql.py "SELECT * FROM applicant_basic_info;"
```

For more details, see [SQL Query Runner Guide](07-sql-query-runner.md).

## API Development

### Creating API Endpoints

1. Add models in `BackendApp/models.py` or `AnalyzerApp/models.py`
2. Create serializers in `serializers.py`
3. Create views in `views.py`
4. Configure URLs in `urls.py`

### Function-Based Views

The project uses function-based views with `@api_view` decorators. For implementation details, see [Function-Based Views Guide](06-function-based-views.md).

## Admin Interface

Access the Django admin panel at: `http://127.0.0.1:8000/admin/`

Features:
- View all database records
- Filter and search functionality
- Bulk operations
- User-friendly interface

## Testing

### Run Tests

```bash
# Run all tests
python manage.py test

# Run tests with verbose output
python manage.py test --verbosity=2

# Run tests for specific app
python manage.py test BackendApp
```

## Development Tips

### Using Django Shell

```bash
python manage.py shell
```

```python
from BackendApp.models import ApplicantBasicInfo, Skills

# Create records
applicant = ApplicantBasicInfo.objects.create(
    full_name="John Doe",
    email="john@example.com",
    phone_number="1234567890"
)

# Query records
skills = Skills.objects.all()
```

### Database Management

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Show migrations
python manage.py showmigrations
```

## Production Considerations

Before deploying to production:

1. **Change SECRET_KEY**: Generate a new secret key in `settings.py`
2. **Set DEBUG=False**: Disable debug mode
3. **Configure ALLOWED_HOSTS**: Add your domain
4. **Use PostgreSQL/MySQL**: Replace SQLite
5. **Configure Static Files**: Set up static file serving
6. **Enable HTTPS**: Use SSL/TLS certificates
7. **Add Authentication**: Implement user authentication
8. **Set up CORS**: Configure CORS headers

## Troubleshooting

### Migration Issues

```bash
# Reset migrations (development only)
python manage.py migrate --run-syncdb

# Or delete db.sqlite3 and run migrations again
rm db.sqlite3
python manage.py makemigrations
python manage.py migrate
```

### Port Already in Use

```bash
# Use a different port
python manage.py runserver 8080
```

### Module Not Found Errors

```bash
# Ensure virtual environment is activated
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

## Additional Resources

- [Quick Start Guide](01-quick-start.md) - Fast setup
- [Project Overview](03-project-overview.md) - Architecture details
- [Database Schema](04-database-schema.md) - Schema documentation
- [SQL Query Runner Guide](07-sql-query-runner.md) - SQL tools usage

## Support

For issues or questions, please refer to:
- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework Documentation](https://www.django-rest-framework.org/)

---

**Last Updated**: 2025  
**Project**: ResumeAnalyzer

