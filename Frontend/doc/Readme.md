# Resume Analyzer Frontend

A modern React TypeScript application for managing job applications and generating tailored resume content.

## Features

### 📊 Dashboard
- Overview of application statistics
- Quick access to all main features
- Visual statistics for application statuses

### 📝 Applications
- CRUD operations for job applications
- Track: Job Name, Company, Links, Resume Links, and Status
- Status options: Applied, Rejected, Timed out, Processed, Accepted, Interview
- Resume file upload/download/delete

### 👤 Applicant Info
Multi-section profile management with edit/save functionality:
- **Basic Information**: Personal details, academics, and achievements
- **Projects and Skills**: Project portfolio with skills tagging
- **Experiences**: Work history and experience details

### 🚀 Resume Generator
Generate tailored resume content based on job requirements:
- **Experience Generator**: Customize experiences for specific roles
- **Project Generator**: Tailor project descriptions
- **Skills Generator**: Categorize and organize skills
- **Resume Output**: Rich text editor with Word/PDF export

## Technology Stack

- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe development
- **React Router 6**: Client-side routing
- **CSS Modules**: Scoped styling
- **Vite**: Fast build tool and dev server
- **Backend API**: Django REST API integration

## Getting Started

### Install dependencies
```bash
npm install
```

### Run development server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for production
```bash
npm run build
```

### Preview production build
```bash
npm run preview
```

## Project Structure

```
src/
├── components/         # Reusable components
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── DataTable.tsx
├── context/           # React Context for state management
│   └── ResumeContext.tsx
├── pages/            # Page components
│   ├── Dashboard.tsx
│   ├── Applications.tsx
│   ├── ApplicantInfo/
│   │   ├── ApplicantInfo.tsx
│   │   ├── BasicInfo.tsx
│   │   ├── ProjectsAndSkills.tsx
│   │   └── Experiences.tsx
│   └── ResumeGenerator/
│       ├── ResumeGenerator.tsx
│       ├── ExperienceGenerator.tsx
│       ├── ProjectGenerator.tsx
│       ├── SkillsGenerator.tsx
│       └── ResumeOutput.tsx
├── services/         # API service layer
│   └── api.ts
├── types/            # TypeScript interfaces
│   └── resume.ts
└── App.tsx          # Main application component
```

## Backend Integration

The frontend integrates with a Django REST API backend. See `API_INTEGRATION.md` for detailed integration guide.

**Backend URL**: `http://127.0.0.1:8000/api`

## Documentation

- **API_INTEGRATION.md** - Complete API integration guide
- **RESUME_GENERATOR.md** - Resume Generator documentation
- **PROJECT_SUMMARY.md** - High-level project overview
- **UPDATE_SUMMARY.md** - Recent update summary

## Development Notes

- All components follow functional component patterns with TypeScript
- CSS Modules prevent style conflicts and provide type safety
- The application supports both light and dark color schemes
- Responsive design breakpoints at 768px and 968px
- All API calls are handled through centralized service layer

## Browser Requirements

- Modern browsers with ES6+ support
- Recommended: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

---

**Ready to run!** Just install dependencies with `npm install` and start the dev server with `npm run dev`.
