# Resume Generator API - Quick Reference Card

## API Endpoints

### Experience Generator
```
POST http://127.0.0.1:8000/analyzer/experience-gen
```

### Project Generator
```
POST http://127.0.0.1:8000/analyzer/project-gen
```

### Skills Generator
```
POST http://127.0.0.1:8000/analyzer/skill-gen
```

## Request Formats

### Experience Generator
```typescript
{
  job_role: string;
  job_description: string;
  points_count: number[];        // [5, 4, 3] = 5 points for exp 1, 4 for exp 2, etc.
  additional_instruction: string;
}
```

### Project Generator
```typescript
{
  job_role: string;
  job_description: string;
  points_count: number[];        // [3, 2] = 3 points for proj 1, 2 for proj 2
  additional_instruction: string;
}
```

### Skills Generator
```typescript
{
  job_role: string;
  job_description: string;
  additional_instruction: string;
  include_web_research: boolean;
  experience_data: GeneratedExperienceItem[];  // From Experience API output
  project_data: GeneratedProjectItem[];        // From Project API output
}
```

## Response Formats

### Experience Generator Response
```typescript
{
  message: string;
  status: "success";
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

### Project Generator Response
```typescript
{
  message: string;
  status: "success";
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

### Skills Generator Response
```typescript
{
  message: string;
  status: "success";
  output: [
    {
      skill_category: string;
      skills: string[];
    }
  ]
}
```

## Frontend Usage

### Import APIs
```typescript
import { 
  experienceGeneratorApi,
  projectGeneratorApi,
  skillsGeneratorApi 
} from '../../services/api';
```

### Experience Generator
```typescript
const response = await experienceGeneratorApi.generate({
  job_role: jobRole,
  job_description: jobRequirements,
  points_count: bulletCounts,
  additional_instruction: sidePrompt,
});

// Store raw response for Skills Generator
setRawExperienceData(response.output);

// Transform to frontend format
const experiences = response.output.map(item => ({
  companyName: item.experience_company_name,
  newExperience: item.resume_points
}));
```

### Project Generator
```typescript
const response = await projectGeneratorApi.generate({
  job_role: jobRole,
  job_description: jobRequirements,
  points_count: lineCounts,
  additional_instruction: sidePrompt,
});

// Store raw response for Skills Generator
setRawProjectData(response.output);

// Transform to frontend format
const projects = response.output.map(item => ({
  projectName: item.project_name,
  newProjectInfo: item.project_points.join(' ')
}));
```

### Skills Generator
```typescript
const response = await skillsGeneratorApi.generate({
  job_role: jobRole,
  job_description: jobRequirements,
  additional_instruction: sidePrompt,
  include_web_research: includeWebResearch,
  experience_data: rawExperienceData,  // From context
  project_data: rawProjectData,        // From context
});

// Transform to frontend format
const skills: SkillsByCategory = {};
response.output.forEach(category => {
  skills[category.skill_category] = category.skills;
});
```

## Context Usage

### Get from Context
```typescript
const { 
  setRawExperienceData,
  setRawProjectData,
  rawExperienceData,
  rawProjectData,
  setGeneratorOutput 
} = useResume();
```

### Store Raw Data
```typescript
// In ExperienceGenerator
setRawExperienceData(response.output);

// In ProjectGenerator
setRawProjectData(response.output);

// In SkillsGenerator - use the data
const response = await skillsGeneratorApi.generate({
  // ...
  experience_data: rawExperienceData,
  project_data: rawProjectData,
});
```

## Error Handling Pattern

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

## Testing

### Start Servers
```bash
# Terminal 1 - Backend
cd /path/to/Backend
python manage.py runserver

# Terminal 2 - Frontend
cd /path/to/Frontend
npm run dev
```

### Test URLs
- Backend: http://127.0.0.1:8000/
- Frontend: http://localhost:5173/
- Resume Generator: http://localhost:5173/resume-generator

## Common Issues

### CORS Error
```python
# Backend settings.py
CORS_ALLOWED_ORIGINS = ["http://localhost:5173"]
```

### API Not Found
- Verify backend is running
- Check endpoint URLs in `src/services/api.ts`

### Empty Skills Response
- Must complete Experience and Project generators first
- Don't use "Skip" - must use "Generate"

## File Locations

### Modified Files
- `src/services/api.ts` - API functions
- `src/context/ResumeContext.tsx` - Raw data storage
- `src/pages/ResumeGenerator/ExperienceGenerator.tsx`
- `src/pages/ResumeGenerator/ProjectGenerator.tsx`
- `src/pages/ResumeGenerator/SkillsGenerator.tsx`

### Documentation
- `doc/GENERATOR_API_INTEGRATION.md` - Complete guide
- `INTEGRATION_SUMMARY.md` - Summary
- `API_QUICK_REFERENCE.md` - This file

---
**Version:** 1.0 | **Updated:** Nov 19, 2024

