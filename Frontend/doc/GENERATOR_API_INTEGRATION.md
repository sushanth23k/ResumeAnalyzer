# Resume Generator API Integration

Complete documentation for the integration of Experience, Project, and Skills Generator APIs into the Resume Generator feature.

## Overview

This document describes the integration of three AI-powered generator APIs that create tailored resume content based on job requirements:

1. **Experience Generator** - Generates tailored experience bullet points
2. **Project Generator** - Creates optimized project descriptions  
3. **Skills Generator** - Organizes and enhances skills by category

## API Endpoints

### Base URL
```
http://127.0.0.1:8000/analyzer/
```

### 1. Experience Generator API

**Endpoint:** `POST /analyzer/experience-gen`

**Purpose:** Generates tailored experience bullet points based on job requirements and user's work history.

**Request Body:**
```typescript
{
  job_role: string;              // Target job role
  job_description: string;        // Full job description
  points_count: number[];         // Array of bullet counts per experience
  additional_instruction: string; // Optional side prompt
}
```

**Example Request:**
```json
{
  "job_role": "Software Dev Engineer II (SDE2), Amazon Connect",
  "job_description": "Description As part of the AWS Solutions organization...",
  "points_count": [5, 4, 2],
  "additional_instruction": ""
}
```

**Response:**
```typescript
{
  message: string;
  status: "success" | "error";
  output: [
    {
      experience_id: number;
      experience_role: string;
      resume_points: string[];
      experience_company_name: string;
      start_date: string;
      end_date: string;
    }
  ]
}
```

**Example Response:**
```json
{
  "message": "Experience generation",
  "status": "success",
  "output": [
    {
      "experience_id": 1,
      "experience_role": "Full Stack Developer",
      "resume_points": [
        "Developed a voice communication framework for testing FreshAi's drive-thru platform.",
        "Designed and implemented a scalable backend architecture using Spring Boot and Java.",
        "Built an automated testing framework using GCP",
        "Applied data science techniques to analyze FreshAi conversations",
        "Ensured seamless integration with AWS services."
      ],
      "experience_company_name": "The Wendy's Company, Fresh Ai",
      "start_date": "September 2024",
      "end_date": "Present"
    }
  ]
}
```

### 2. Project Generator API

**Endpoint:** `POST /analyzer/project-gen`

**Purpose:** Generates enhanced project descriptions aligned with job requirements.

**Request Body:**
```typescript
{
  job_role: string;              // Target job role
  job_description: string;        // Full job description
  points_count: number[];         // Array of point counts per project
  additional_instruction: string; // Optional side prompt
}
```

**Example Request:**
```json
{
  "job_role": "Software Dev Engineer II (SDE2), Amazon Connect",
  "job_description": "Description As part of the AWS Solutions organization...",
  "points_count": [2, 2],
  "additional_instruction": ""
}
```

**Response:**
```typescript
{
  message: string;
  status: "success" | "error";
  output: [
    {
      project_id: number;
      project_name: string;
      project_points: string[];
      project_skills: string[];
    }
  ]
}
```

**Example Response:**
```json
{
  "message": "Project generation",
  "status": "success",
  "output": [
    {
      "project_id": 1,
      "project_name": "Airbnb Hotel Analysis",
      "project_points": [
        "Analyzed customer preferences and popular destinations using Python, Apache Spark",
        "Developed scalable data pipelines using SOA architecture."
      ],
      "project_skills": [
        "Python",
        "Apache Spark",
        "Data Bricks",
        "SOA",
        "NoSQL"
      ]
    }
  ]
}
```

### 3. Skills Generator API

**Endpoint:** `POST /analyzer/skill-gen`

**Purpose:** Generates organized, categorized skills based on job requirements and previously generated content.

**Request Body:**
```typescript
{
  job_role: string;                    // Target job role
  job_description: string;              // Full job description
  additional_instruction: string;       // Optional side prompt
  include_web_research: boolean;        // Enable web research
  experience_data: GeneratedExperienceItem[]; // Output from Experience API
  project_data: GeneratedProjectItem[];       // Output from Project API
}
```

**Example Request:**
```json
{
  "job_role": "Software Dev Engineer II (SDE2), Amazon Connect",
  "job_description": "Description As part of the AWS Solutions organization...",
  "additional_instruction": "",
  "include_web_research": true,
  "experience_data": [...],  // Full experience_gen API output
  "project_data": [...]      // Full project_gen API output
}
```

**Response:**
```typescript
{
  message: string;
  status: "success" | "error";
  output: [
    {
      skill_category: string;
      skills: string[];
    }
  ]
}
```

**Example Response:**
```json
{
  "message": "Skill generation",
  "status": "success",
  "output": [
    {
      "skill_category": "Programming Languages",
      "skills": ["Java", "Python", "JavaScript", "SQL", "TypeScript"]
    },
    {
      "skill_category": "Web Frameworks",
      "skills": ["Spring Boot", "ReactJS", "Node.js", "Django"]
    },
    {
      "skill_category": "Database Management",
      "skills": ["PostgreSQL", "MongoDB", "DynamoDB", "Redis"]
    }
  ]
}
```

## Frontend Integration

### API Service Layer

**File:** `src/services/api.ts`

New API service functions added:

```typescript
// Experience Generator
export const experienceGeneratorApi = {
  generate: async (data: ExperienceGeneratorRequest): Promise<ExperienceGeneratorResponse>
};

// Project Generator
export const projectGeneratorApi = {
  generate: async (data: ProjectGeneratorRequest): Promise<ProjectGeneratorResponse>
};

// Skills Generator
export const skillsGeneratorApi = {
  generate: async (data: SkillsGeneratorRequest): Promise<SkillsGeneratorResponse>
};
```

### Context Updates

**File:** `src/context/ResumeContext.tsx`

Added new context state for storing raw API responses:

```typescript
interface ResumeContextType {
  // ... existing fields ...
  rawExperienceData: GeneratedExperienceItem[];
  setRawExperienceData: React.Dispatch<React.SetStateAction<GeneratedExperienceItem[]>>;
  rawProjectData: GeneratedProjectItem[];
  setRawProjectData: React.Dispatch<React.SetStateAction<GeneratedProjectItem[]>>;
}
```

**Purpose:** These raw API responses are needed because the Skills Generator API requires the full output from Experience and Project generators.

### Component Integration

#### 1. ExperienceGenerator.tsx

**Changes:**
- Imports `experienceGeneratorApi` from services
- Uses `setRawExperienceData` from context
- Calls real API in `handleGenerate`:

```typescript
const handleGenerate = async () => {
  setIsGenerating(true);
  setError(null);
  
  try {
    const response = await experienceGeneratorApi.generate({
      job_role: jobRole,
      job_description: jobRequirements,
      points_count: bulletCounts,
      additional_instruction: sidePrompt,
    });

    // Store raw response for Skills Generator
    setRawExperienceData(response.output);

    // Transform to frontend format
    const transformedExperiences = response.output.map(item => ({
      companyName: item.experience_company_name,
      newExperience: item.resume_points
    }));

    setGeneratedExperiences(transformedExperiences);
    setGeneratorOutput(prev => ({ ...prev, experiences: transformedExperiences }));
    setHasGenerated(true);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to generate experiences');
  } finally {
    setIsGenerating(false);
  }
};
```

#### 2. ProjectGenerator.tsx

**Changes:**
- Imports `projectGeneratorApi` from services
- Uses `setRawProjectData` from context
- Calls real API in `handleGenerate`:

```typescript
const handleGenerate = async () => {
  setIsGenerating(true);
  setError(null);
  
  try {
    const response = await projectGeneratorApi.generate({
      job_role: jobRole,
      job_description: jobRequirements,
      points_count: lineCounts,
      additional_instruction: sidePrompt,
    });

    // Store raw response for Skills Generator
    setRawProjectData(response.output);

    // Transform to frontend format
    const transformedProjects = response.output.map(item => ({
      projectName: item.project_name,
      newProjectInfo: item.project_points.join(' ')
    }));

    setGeneratedProjects(transformedProjects);
    setGeneratorOutput(prev => ({ ...prev, projects: transformedProjects }));
    setHasGenerated(true);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to generate projects');
  } finally {
    setIsGenerating(false);
  }
};
```

#### 3. SkillsGenerator.tsx

**Changes:**
- Imports `skillsGeneratorApi` from services
- Uses `rawExperienceData` and `rawProjectData` from context
- Calls real API in `handleGenerate`:

```typescript
const handleGenerate = async () => {
  setIsGenerating(true);
  setError(null);
  
  try {
    const response = await skillsGeneratorApi.generate({
      job_role: jobRole,
      job_description: jobRequirements,
      additional_instruction: sidePrompt,
      include_web_research: includeWebResearch,
      experience_data: rawExperienceData,
      project_data: rawProjectData,
    });

    // Transform array format to object format
    const transformedSkills: SkillsByCategory = {};
    response.output.forEach(category => {
      transformedSkills[category.skill_category] = category.skills;
    });

    setGeneratedSkills(transformedSkills);
    setGeneratorOutput(prev => ({ ...prev, skills: transformedSkills }));
    setHasGenerated(true);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to generate skills');
  } finally {
    setIsGenerating(false);
  }
};
```

## Data Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    User Workflow                              │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 1: Experience Generator                                 │
│  ────────────────────────────────────────────────────────────│
│  Input:                                                       │
│  • Job Role                                                   │
│  • Job Description                                            │
│  • Bullet Counts per Experience                               │
│  • Side Prompt (optional)                                     │
│                                                               │
│  Output:                                                      │
│  • Generated experience bullet points                         │
│  • Stored in context: rawExperienceData                      │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 2: Project Generator                                    │
│  ────────────────────────────────────────────────────────────│
│  Input:                                                       │
│  • Job Role (shared from Step 1)                              │
│  • Job Description (shared from Step 1)                       │
│  • Line Counts per Project                                    │
│  • Side Prompt (optional)                                     │
│                                                               │
│  Output:                                                      │
│  • Generated project descriptions                             │
│  • Stored in context: rawProjectData                         │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 3: Skills Generator                                     │
│  ────────────────────────────────────────────────────────────│
│  Input:                                                       │
│  • Job Role (shared from previous steps)                      │
│  • Job Description (shared from previous steps)               │
│  • Side Prompt (optional)                                     │
│  • Include Web Research (checkbox)                            │
│  • rawExperienceData (from Step 1)                           │
│  • rawProjectData (from Step 2)                              │
│                                                               │
│  Output:                                                      │
│  • Categorized skills list                                    │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 4: Resume Output                                        │
│  ────────────────────────────────────────────────────────────│
│  • Combines all generated content                             │
│  • Rich text editor for final edits                           │
│  • Export to Word/PDF                                         │
└──────────────────────────────────────────────────────────────┘
```

## Data Transformation

### Experience Generator

**API Response → Frontend Format:**

```typescript
// API Response
{
  experience_id: 1,
  experience_company_name: "Tech Corp",
  experience_role: "Software Engineer",
  start_date: "Jan 2023",
  end_date: "Dec 2023",
  resume_points: ["Point 1", "Point 2"]
}

// Transformed to Frontend Format
{
  companyName: "Tech Corp",
  newExperience: ["Point 1", "Point 2"]
}
```

### Project Generator

**API Response → Frontend Format:**

```typescript
// API Response
{
  project_id: 1,
  project_name: "ML Platform",
  project_points: ["Sentence 1.", "Sentence 2."],
  project_skills: ["Python", "AWS"]
}

// Transformed to Frontend Format
{
  projectName: "ML Platform",
  newProjectInfo: "Sentence 1. Sentence 2."
}
```

### Skills Generator

**API Response → Frontend Format:**

```typescript
// API Response (Array)
[
  {
    skill_category: "Programming Languages",
    skills: ["Java", "Python"]
  },
  {
    skill_category: "Cloud Technologies",
    skills: ["AWS", "Azure"]
  }
]

// Transformed to Frontend Format (Object)
{
  "Programming Languages": ["Java", "Python"],
  "Cloud Technologies": ["AWS", "Azure"]
}
```

## Error Handling

All generators implement comprehensive error handling:

```typescript
try {
  setIsGenerating(true);
  setError(null);
  
  const response = await api.generate(data);
  
  // Process response...
  setHasGenerated(true);
} catch (err) {
  setError(err instanceof Error ? err.message : 'Generation failed');
  console.error('Error:', err);
} finally {
  setIsGenerating(false);
}
```

**Error States:**
- Network errors
- API errors (status !== "success")
- Invalid response format
- Backend unavailable

**User Feedback:**
- Loading spinner during generation
- Error message display with retry option
- Clear success indication

## Testing

### Prerequisites

1. **Backend Server Running:**
   ```bash
   cd /path/to/Backend
   python manage.py runserver
   ```
   Backend should be at `http://127.0.0.1:8000/`

2. **Frontend Development Server:**
   ```bash
   cd /path/to/Frontend
   npm run dev
   ```
   Frontend at `http://localhost:5173/`

### Test Scenarios

#### 1. Experience Generator

**Test Case 1: Basic Generation**
- Navigate to Resume Generator → Experience Generator
- Enter job role: "Software Engineer"
- Paste job description
- Set bullet counts: [5, 4, 3]
- Click "Generate"
- Verify generated experiences appear
- Check that experiences have correct bullet counts

**Test Case 2: Skip Functionality**
- Click "Skip" instead of "Generate"
- Verify original experiences are used
- Verify can proceed to next step

**Test Case 3: Edit Generated Content**
- After generation, click "Edit" on an experience
- Modify bullet points
- Add/remove points
- Save changes
- Verify changes persist

#### 2. Project Generator

**Test Case 1: Basic Generation**
- Complete Experience Generator first
- Navigate to Project Generator
- Verify job role/description are pre-filled
- Set line counts: [3, 2]
- Click "Generate"
- Verify generated projects appear
- Check project descriptions have appropriate length

**Test Case 2: Line Count Variation**
- Set different line counts: [1, 5, 3]
- Generate
- Verify each project has correct number of sentences

#### 3. Skills Generator

**Test Case 1: Basic Generation (Without Web Research)**
- Complete Experience and Project generators
- Navigate to Skills Generator
- Keep "Include web research" unchecked
- Click "Generate"
- Verify skills are organized by category
- Check that skills align with job requirements

**Test Case 2: With Web Research**
- Enable "Include web research" checkbox
- Click "Generate"
- Verify additional/enhanced skills appear
- Compare with non-web-research results

**Test Case 3: Category Management**
- After generation, click "Add Category"
- Add a custom category
- Add skills to the category
- Edit existing category
- Delete a category
- Verify all changes persist

#### 4. Integration Flow

**Test Case 1: Complete Flow**
- Start from Experience Generator
- Generate experiences with API
- Proceed to Project Generator
- Generate projects with API
- Proceed to Skills Generator
- Generate skills with API (should use previous data)
- Proceed to Resume Output
- Verify all generated content appears correctly

**Test Case 2: Shared Data Persistence**
- Enter job role in Experience Generator
- Navigate to Project Generator
- Verify job role is pre-filled
- Navigate to Skills Generator
- Verify job role is still present

### Error Testing

**Test Case 1: Backend Unavailable**
- Stop the backend server
- Try to generate content
- Verify error message appears
- Verify UI remains functional
- Restart backend
- Retry generation

**Test Case 2: Invalid Input**
- Try generating with empty job role
- Try generating with empty job description
- Verify appropriate validation/error messages

**Test Case 3: API Error Response**
- (Requires backend modification to return error)
- Verify error message displays
- Verify error doesn't crash the app

## Performance Considerations

### Loading States
- All generators show loading indicator during API calls
- Buttons are disabled during generation
- User cannot proceed until generation completes

### Data Persistence
- Raw API responses stored in context (not localStorage)
- Generated content stored in context and localStorage
- Shared data (job role, job description) persists across steps

### Optimization Opportunities
1. **Caching**: Consider caching API responses for same inputs
2. **Debouncing**: Debounce form inputs to prevent unnecessary re-renders
3. **Progressive Enhancement**: Consider streaming responses for long generations
4. **Batch Requests**: For future: consider generating all at once

## Known Limitations

1. **Sequential Generation**: Skills Generator requires Experience and Project data, so they must be generated first
2. **No Undo**: Once generated, previous results are overwritten (can be added)
3. **No Save Draft**: Generation is not saved until user completes all steps
4. **Single Job Role**: Currently supports one job role at a time

## Future Enhancements

1. **Regenerate Individual Items**: Allow regenerating specific experiences/projects
2. **Batch Generation**: Generate all three at once with one API call
3. **Template Library**: Save and reuse successful generations
4. **A/B Testing**: Generate multiple versions and compare
5. **Real-time Collaboration**: Share and edit generations with others
6. **Version History**: Track changes and revert to previous versions
7. **Export Options**: Additional export formats (JSON, plain text, etc.)

## Troubleshooting

### Issue: "Failed to generate experiences"

**Possible Causes:**
- Backend not running
- CORS not configured properly
- Invalid API endpoint URL
- Network connectivity issues

**Solutions:**
1. Verify backend is running: `http://127.0.0.1:8000/`
2. Check browser console for detailed error
3. Verify CORS settings in Django backend
4. Check API endpoint URLs in `api.ts`

### Issue: Skills Generator shows empty data

**Cause:** Experience or Project generators were skipped or failed

**Solution:**
1. Go back to Experience Generator
2. Generate (don't skip) experiences
3. Go to Project Generator
4. Generate (don't skip) projects
5. Return to Skills Generator

### Issue: Generated content doesn't appear

**Possible Causes:**
- API returned error but wasn't caught
- Data transformation failed
- Context not updating properly

**Solutions:**
1. Check browser console for errors
2. Verify API response format matches expected structure
3. Check that `setGeneratorOutput` is being called
4. Verify context provider is wrapping the component

### Issue: Bullet/line counts not respected

**Cause:** `points_count` array not properly synced with items

**Solution:**
- Verify `bulletCounts`/`lineCounts` arrays are initialized correctly
- Check that arrays are same length as experiences/projects
- Ensure counts are updated when items are added/removed

## Files Modified

### New Files
- `/doc/GENERATOR_API_INTEGRATION.md` - This documentation

### Modified Files
1. `/src/services/api.ts` - Added generator API functions and interfaces
2. `/src/context/ResumeContext.tsx` - Added raw data storage for API responses
3. `/src/pages/ResumeGenerator/ExperienceGenerator.tsx` - Integrated Experience API
4. `/src/pages/ResumeGenerator/ProjectGenerator.tsx` - Integrated Project API
5. `/src/pages/ResumeGenerator/SkillsGenerator.tsx` - Integrated Skills API

## API Contract Summary

| Generator | Endpoint | Method | Input | Output |
|-----------|----------|--------|-------|--------|
| Experience | `/analyzer/experience-gen` | POST | job_role, job_description, points_count[], additional_instruction | experience_id, experience_role, resume_points[], experience_company_name, start_date, end_date |
| Project | `/analyzer/project-gen` | POST | job_role, job_description, points_count[], additional_instruction | project_id, project_name, project_points[], project_skills[] |
| Skills | `/analyzer/skill-gen` | POST | job_role, job_description, additional_instruction, include_web_research, experience_data[], project_data[] | skill_category, skills[] |

---

**Last Updated:** November 19, 2024  
**Version:** 1.0  
**Status:** ✅ Integrated and Ready for Testing

