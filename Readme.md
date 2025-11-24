# Resume Analyzer

A modern full-stack application for managing job applications and generating tailored resume content using AI. Built with Django REST API backend and React TypeScript frontend.

## 🎯 Overview

Resume Analyzer helps job seekers optimize their resumes for specific job applications using AI-powered content generation. The application provides comprehensive job application tracking, profile management, and intelligent resume customization.

### Key Features

- **📊 Dashboard**: Application statistics and quick access to all features
- **📝 Applications Management**: Track job applications with status updates and resume uploads
- **👤 Applicant Profile**: Manage personal info, experiences, projects, and skills
- **🚀 AI Resume Generator**: Generate tailored resume content using Groq AI
- **📄 Export Options**: Export resumes as Word (.docx) or PDF files

## 🏗️ Technology Stack

**Backend:**
- Django 4.2.7 with Django REST Framework
- SQLite database
- Groq AI integration for content generation
- Python 3.8+

**Frontend:**
- React 18 with TypeScript
- React Router 6 for navigation
- CSS Modules for styling
- Vite for build tooling

## 🚀 Quick Setup

### Prerequisites

- Python 3.8 or higher
- Node.js 16+ and npm
- Git

### 1. Clone Repository

```bash
git clone <repository-url>
cd ResumeAnalyzer
```

### 2. Backend Setup

```bash
cd Backend

# Create virtual environment
python -m venv venv 

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env  # Create this file manually if it doesn't exist
```

**Create `.env` file in Backend directory:**

```env
# Groq AI Configuration
GROQ_API_KEY=your_groq_api_key_here
MODEL_NAME=llama3-8b-8192

# Django Configuration (Optional)
SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=True
```

**Run migrations and start server:**

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser  # Optional: create admin user
python manage.py runserver
```

Backend will be available at: `http://127.0.0.1:8000`

### 3. Frontend Setup

```bash
cd Frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at: `http://localhost:5173`

## 📁 Project Structure

```
ResumeAnalyzer/
├── Backend/
│   ├── AnalyzerApp/          # AI content generation app
│   ├── BackendApp/           # Main backend app with models
│   ├── ResumeAnalyzer/       # Django project settings
│   ├── requirements.txt      # Python dependencies
│   ├── manage.py            # Django management script
│   └── .env                 # Environment variables (create this)
├── Frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   └── types/          # TypeScript interfaces
│   ├── package.json        # Node.js dependencies
│   └── vite.config.ts      # Vite configuration
└── README.md               # This file
```

## 🔐 Environment Configuration

### Backend Environment Variables (.env)

Create a `.env` file in the `Backend/` directory:

```env
# Required: Groq AI API Key
GROQ_API_KEY=your_groq_api_key_here

# Required: Groq Model Name
MODEL_NAME=llama3-8b-8192

# Optional: Django Secret Key (change in production)
SECRET_KEY=your-secret-key-here

# Optional: Debug Mode
DEBUG=True
```

**To get Groq API Key:**
1. Visit [Groq Console](https://console.groq.com/)
2. Sign up/Login
3. Generate an API key
4. Add it to your `.env` file

### Files to Ignore

The project includes `.gitignore` files that exclude:

**Backend (.gitignore):**
- `db.sqlite3` - Database file (will be created locally)
- `venv/` - Virtual environment
- `*.pyc` - Python compiled files
- `.env` - Environment variables
- `ResumeBlobs/` - Uploaded resume files

**Frontend (.gitignore):**
- `node_modules/` - Node.js dependencies
- `dist/` - Build output
- `.env.local` - Local environment variables

**Important:** You need to create your own `.env` file and `db.sqlite3` will be generated when you run migrations.

## 🔧 Development

### Backend Development

```bash
cd Backend
source venv/bin/activate

# Run development server
python manage.py runserver

# Run migrations after model changes
python manage.py makemigrations
python manage.py migrate

# Access admin panel
# http://127.0.0.1:8000/admin/
```

### Frontend Development

```bash
cd Frontend

# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### API Endpoints

The backend provides REST API endpoints at `http://127.0.0.1:8000/api/`:

- `/api/applications/` - Job applications CRUD
- `/api/applicant-info/` - User profile management
- `/api/experiences/` - Work experience management
- `/api/projects/` - Project management
- `/api/skills/` - Skills management
- `/api/generate-experience/` - AI experience generation
- `/api/generate-projects/` - AI project generation
- `/api/generate-skills/` - AI skills generation

## 🧪 Testing

### Backend Testing

```bash
cd Backend
python manage.py test
```

### Frontend Testing

```bash
cd Frontend
npm run lint  # ESLint checking
npm run build # Build verification
```

## 📚 Documentation

Detailed documentation is available in the `doc/` folders:

- **Backend/doc/**: API documentation, database schema, setup guides
- **Frontend/doc/**: Component documentation, integration guides

## 🚨 Troubleshooting

### Common Issues

**Backend Issues:**
- **Database errors**: Run `python manage.py migrate`
- **Module not found**: Run `pip install -r requirements.txt`
- **Port in use**: Use `python manage.py runserver 8080`

**Frontend Issues:**
- **Dependencies error**: Run `npm install`
- **Build errors**: Check TypeScript errors with `npm run build`
- **API connection**: Ensure backend is running on port 8000

**Environment Issues:**
- **Groq API errors**: Verify `GROQ_API_KEY` in `.env` file
- **Missing .env**: Create `.env` file in Backend directory with required variables

### Getting Help

1. Check the documentation in `Backend/doc/` and `Frontend/doc/`
2. Verify all environment variables are set correctly
3. Ensure both backend and frontend servers are running
4. Check browser console for frontend errors
5. Check terminal output for backend errors

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Ready to start?** Follow the setup instructions above and you'll have the Resume Analyzer running locally in minutes!
