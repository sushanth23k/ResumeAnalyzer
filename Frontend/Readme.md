# Resume Analyzer — Frontend

React TypeScript SPA for managing job applications, user profiles, and generating AI-powered resume content.

## Overview

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript 5 |
| Build tool | Vite 5 |
| Routing | React Router 6 |
| Styling | CSS Modules |
| Document generation | docx, jsPDF, html2canvas |
| Container | Docker / Docker Compose (frontend-only) |
| Web server | Nginx 1.25 |

---

## Project Structure

```
Frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── DataTable.tsx
│   │   └── ProtectedRoute.tsx
│   ├── context/             # React Context providers
│   │   ├── AuthContext.tsx  # JWT auth state
│   │   └── ResumeContext.tsx
│   ├── pages/               # Page-level components
│   │   ├── auth/            # Login, Signup, ForgotPassword, ...
│   │   ├── ApplicantInfo/   # Profile management
│   │   ├── ResumeGenerator/ # AI resume generation
│   │   ├── Dashboard.tsx
│   │   ├── Applications.tsx
│   │   └── Home.tsx
│   ├── services/            # API client modules
│   │   ├── api.ts           # Core API calls
│   │   └── authApi.ts       # Auth-specific calls
│   ├── utils/
│   │   └── apiClient.ts     # Axios/fetch wrapper
│   └── types/
│       └── resume.ts        # TypeScript interfaces
├── nginx.conf               # Nginx configuration (served inside container)
├── Dockerfile               # Multi-stage build
├── docker-compose.yml       # Frontend-only deployment
├── vite.config.ts
└── package.json
```

---

## Quick Start — Local Development

### 1. Install dependencies

```bash
cd Frontend
npm install
```

### 2. Configure the backend URL

Create `.env.local` (or `.env`) in the `Frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:8000
```

This variable is consumed by Vite at build time and baked into the JS bundle.

### 3. Start development server

```bash
npm run dev
# App at http://localhost:5173
```

Make sure the backend is running at the URL specified above.

---

## Docker Deployment (Frontend Only)

```bash
cd Frontend

# Build and run — pass the backend URL as a build argument
VITE_API_BASE_URL=http://your-backend-host:8000 docker compose up --build
```

The frontend is served at `http://localhost` (port 80 by default).

### Environment variables

| Variable | Default | Notes |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000` | Compiled into JS bundle at build time |
| `FRONTEND_PORT` | `80` | Host port to bind Nginx to |

`VITE_API_BASE_URL` is a **build-time** variable.  You must rebuild the image whenever the backend URL changes:

```bash
VITE_API_BASE_URL=https://api.myapp.com docker compose up --build
```

---

## Running Frontend and Backend Together

The frontend and backend are deployed as **independent Docker services**.  A typical workflow:

```bash
# Terminal 1 — start the backend (Django + Gunicorn + PostgreSQL)
cd Backend
docker compose up --build

# Terminal 2 — build and start the frontend pointing at the backend
cd Frontend
VITE_API_BASE_URL=http://localhost:8000 docker compose up --build
```

For production, replace `http://localhost:8000` with the public URL or internal hostname of your backend.

---

## Building for Production

```bash
npm run build
# Output in dist/
```

The `dist/` directory can be served by any static file host (Nginx, S3, Netlify, Vercel, etc.).

---

## Authentication Flow

1. **Register** — `POST /auth/register/` with email + password
2. **Verify email** — click link sent to inbox (or use console backend in dev)
3. **Login** — `POST /auth/login/` → receives `access` and `refresh` JWT tokens
4. **API calls** — include `Authorization: Bearer <access>` header
5. **Token refresh** — `POST /auth/token/refresh/` when access token expires (60 min)

---

## Key Pages

| Route | Component | Description |
|---|---|---|
| `/` | `Home` | Landing page |
| `/auth/login` | `Login` | JWT login |
| `/auth/signup` | `Signup` | Registration |
| `/dashboard` | `Dashboard` | Stats overview |
| `/applicant-info` | `ApplicantInfo` | Profile editing |
| `/applications` | `Applications` | Job application tracking |
| `/resume-generator` | `ResumeGenerator` | AI content generation |

---

## Nginx Configuration

The `nginx.conf` inside the container:

- Serves static files from `/usr/share/nginx/html` with long-lived cache headers
- Falls back to `index.html` for all routes (React Router SPA support)
- Exposes a `/health` endpoint for uptime monitoring
- Gzip compression enabled for JS/CSS/JSON/fonts

---

**Frontend Version**: 3.0 — separate Docker deployment  
**Last Updated**: February 2026  
**React**: 18 | **Vite**: 5 | **TypeScript**: 5
