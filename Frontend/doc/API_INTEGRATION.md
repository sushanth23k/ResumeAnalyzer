# API Integration Guide

Complete guide for integrating the frontend with the backend REST APIs.

## Overview

The frontend communicates with the backend Django REST API at `http://127.0.0.1:8000/api`. All API calls are handled through the centralized service layer in `src/services/api.ts`.

## API Service Layer

**File**: `src/services/api.ts`

- Base URL: `http://127.0.0.1:8000/api`
- All endpoints match Django backend structure
- Consistent error handling with `handleResponse()`
- Supports all CRUD operations via GET/POST methods

### Available APIs

- `basicInfoApi` - Basic applicant information
- `academicsApi` - Education records
- `achievementsApi` - Achievements
- `skillsApi` - Skills management (master list)
- `projectsApi` - Projects with skills
- `experiencesApi` - Work experiences
- `applicationsApi` - Job applications
- `completeInfoApi` - Get all applicant data at once
- `resumeApi` - Resume file upload/download/delete
- `statsApi` - Application statistics

## Integration Status

### ✅ Completed Components

#### 1. Applications Page
**File**: `src/pages/Applications.tsx`

- ✅ Integrated with backend API
- ✅ Load applications on mount
- ✅ Create, edit, and delete applications
- ✅ Loading state with spinner
- ✅ Error handling with retry button
- ✅ Field mapping: `link` ↔ `jobLink`, `resumeLink` ↔ `notes`
- ✅ Resume file upload/download/delete support

#### 2. Basic Information Component
**File**: `src/pages/ApplicantInfo/BasicInfo.tsx`

- ✅ Integrated with backend APIs
- ✅ Load data on mount (basic info, academics, achievements)
- ✅ Save/update basic information
- ✅ CRUD operations for academics and achievements
- ✅ Loading and error states
- ✅ Field mapping: `linkedIn` → `linkedinUrl`, `github` → `githubUrl`

#### 3. Projects and Skills Component
**File**: `src/pages/ApplicantInfo/ProjectsAndSkills.tsx`

- ✅ Integrated with backend APIs
- ✅ Load projects with skills
- ✅ CRUD operations for projects
- ✅ Skills management (master list and user skills)
- ✅ Create new skills
- ✅ Skill categories support
- ✅ Loading and error states

#### 4. Experiences Component
**File**: `src/pages/ApplicantInfo/Experiences.tsx`

- ✅ Integrated with backend APIs
- ✅ Load experiences on mount
- ✅ CRUD operations for experiences
- ✅ Location field support
- ✅ Display order management
- ✅ Loading and error states

## Backend API Endpoints

### Base URL
```
http://127.0.0.1:8000/api
```

### Applications
- `GET /applications` - Get all applications (with filters)
- `POST /applications` with `action: "create|update|delete"` - CRUD operations

### Basic Information
- `GET /applicant-info/basic` - Get basic info
- `POST /applicant-info/basic` - Save/update basic info (auto create/update)

### Academics
- `GET /applicant-info/academics` - Get all academics
- `POST /applicant-info/academics` with `action: "create|update|delete"` - CRUD operations

### Achievements
- `GET /applicant-info/achievements` - Get all achievements
- `POST /applicant-info/achievements` with `action: "create|update|delete"` - CRUD operations

### Skills
- `GET /skills` - Get all available skills
- `POST /skills` - Create new skill
- `GET /applicant-info/skills` - Get user's skills
- `POST /applicant-info/skills` with `action: "add|remove"` - Manage user skills

### Projects
- `GET /applicant-info/projects` - Get all projects (with skills)
- `POST /applicant-info/projects` with `action: "create|update|delete"` - CRUD operations

### Experiences
- `GET /applicant-info/experiences` - Get all experiences
- `POST /applicant-info/experiences` with `action: "create|update|delete"` - CRUD operations

### Resume Files
- `GET /resume?id=<application_id>` - Download resume file
- `POST /resume` with `action: "upload"` and `file` in FormData - Upload resume
- `POST /resume` with `action: "delete"` and `id` parameter - Delete resume

### Statistics
- `GET /applications/stats` - Get application statistics

## Field Name Mappings

### Applications
| Frontend Property | Backend Field | API Field |
|------------------|---------------|-----------|
| link             | jobLink       | jobLink   |
| resumeLink       | notes         | notes     |

### Basic Information
| Frontend Property | Backend Field | API Field  |
|------------------|---------------|------------|
| linkedIn         | linkedinUrl   | linkedinUrl|
| github           | githubUrl     | githubUrl  |

### Skills
- **Frontend (old)**: `string[]`
- **Backend/API**: `SkillData[]` with `{id, skillName, category}`

### Projects
- **Frontend**: `skills: string[]`
- **Backend**: `skills: SkillData[]` with `skillIds: string[]` for create/update

## API Request Pattern

All POST requests follow the backend's action-based pattern:

```json
{
  "action": "create|update|delete|reorder|add|remove",
  "id": "uuid (when required)",
  ...other fields
}
```

## Error Handling Pattern

All API calls should follow this pattern:

```typescript
try {
  setError(null);
  // API call
} catch (err) {
  setError(err instanceof Error ? err.message : 'Operation failed');
  console.error('Error:', err);
}
```

## Loading States

Add loading indicators:

```tsx
if (loading) {
  return (
    <div className={styles.component}>
      <div className={styles.loading}>Loading...</div>
    </div>
  );
}
```

## CSS Updates

For each component CSS file, add:

```css
.loading {
  text-align: center;
  padding: 3rem;
  font-size: 1.1rem;
  color: #666;
}

.error {
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.error p {
  margin: 0;
  color: #c33;
}

.retryButton {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}
```

## File Upload Implementation

The resume file upload follows the backend's multipart/form-data pattern:

```typescript
const formData = new FormData();
formData.append('action', 'upload');
formData.append('id', applicationId);
formData.append('file', file);
```

**File Validation:**
- Allowed types: PDF, DOC, DOCX
- Max size: 10MB

## Testing Instructions

### 1. Start Backend Server
```bash
cd /path/to/Backend
python manage.py runserver
```

Backend should be running on `http://127.0.0.1:8000/`

### 2. Start Frontend Development Server
```bash
cd /path/to/Frontend
npm run dev
```

Frontend will be available at `http://localhost:5173/`

### 3. Test Applications Page
1. Navigate to Applications page
2. Should see loading indicator
3. Applications should load from backend
4. Test CRUD operations
5. Test resume file upload/download/delete
6. Test error handling (stop backend server)

### 4. Test Basic Info
1. Navigate to Applicant Info > Basic Info
2. Should load existing data from backend
3. Edit and save changes
4. Add/edit/delete academics
5. Add/edit/delete achievements

### 5. Test Projects & Skills
1. Navigate to Applicant Info (Projects tab)
2. Should load projects with skills
3. Create new project
4. Add skills to project
5. Create new skill if not exists

### 6. Test Experiences
1. Navigate to Applicant Info (Experiences tab)
2. Should load experiences
3. Create/edit/delete experiences
4. Verify location field works

## Important Notes

### Backend Design
- Uses **GET** for all read operations
- Uses **POST** for all write operations
- POST requests include `action` field: `create`, `update`, `delete`, `add`, `remove`, `reorder`
- IDs are UUIDs generated by backend
- All resources have consistent response format:
  ```json
  {
    "success": true/false,
    "data": {...},
    "message": "...",
    "error": {...}
  }
  ```

### CORS Configuration
Ensure Django backend has CORS enabled for `http://localhost:5173`:

```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]
```

## Future Enhancements

1. **State Management**: Consider adding Redux/Zustand for better state management
2. **Optimistic Updates**: Update UI before API confirmation for better UX
3. **File Upload Progress**: Add progress bar for large file uploads
4. **Toast Notifications**: Replace page reload with toast notifications
5. **Pagination**: Implement pagination in Applications table
6. **Search/Filter**: Add search and filter capabilities
7. **Drag-and-Drop**: Add drag-and-drop for display order management
8. **Bulk Operations**: Allow bulk delete/status update for applications

