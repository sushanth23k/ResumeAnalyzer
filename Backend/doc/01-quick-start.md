# Quick Start Guide

Get the ResumeAnalyzer project up and running in 5 minutes!

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

## Step 1: Activate Virtual Environment

```bash
source venv/bin/activate
```

## Step 2: Install Dependencies

```bash
pip install -r requirements.txt
```

## Step 3: Run Database Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

## Step 4: Create Admin User (Optional but Recommended)

```bash
python manage.py createsuperuser
```

Enter your desired username, email, and password when prompted.

## Step 5: Start the Server

```bash
python manage.py runserver
```

## You're Ready! 🎉

### Access the Application:

1. **Admin Panel**: http://127.0.0.1:8000/admin/
2. **API Endpoints**: Will be available once configured

### Next Steps:

- Review the [Main README](02-readme.md) for complete documentation
- Check [Database Schema](04-database-schema.md) to understand the data structure
- Explore [Project Overview](03-project-overview.md) for architecture details

## Troubleshooting

### Database not found
```bash
python manage.py migrate
```

### Port already in use
```bash
python manage.py runserver 8080
```

### Module not found
```bash
pip install -r requirements.txt
```

---

**For detailed documentation, see [Main README](02-readme.md)**

