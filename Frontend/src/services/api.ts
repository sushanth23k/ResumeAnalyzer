// API Service for Resume Analyzer Backend
// Base URL from App.tsx

export const BackendURL = "http://127.0.0.1:8000/";
export const API_BASE_URL = `${BackendURL}api`;

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error?.message || 'API request failed');
  }
  
  return data.data;
}

// ============================================
// BASIC INFORMATION API
// ============================================

export interface BasicInfoData {
  id?: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  linkedinUrl: string;
  githubUrl: string;
  address: string;
}

export const basicInfoApi = {
  get: async (): Promise<BasicInfoData | null> => {
    const response = await fetch(`${API_BASE_URL}/applicant-info/basic`);
    const data = await response.json();
    return data.success ? data.data : null;
  },

  save: async (data: BasicInfoData): Promise<BasicInfoData> => {
    const response = await fetch(`${API_BASE_URL}/applicant-info/basic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<BasicInfoData>(response);
  },
};

// ============================================
// ACADEMICS API
// ============================================

export interface AcademicData {
  id?: string;
  collegeName: string;
  graduationDate: string;
  course: string;
  displayOrder: number;
}

export const academicsApi = {
  getAll: async (): Promise<AcademicData[]> => {
    const response = await fetch(`${API_BASE_URL}/applicant-info/academics`);
    return handleResponse<AcademicData[]>(response);
  },

  create: async (data: Omit<AcademicData, 'id'>): Promise<AcademicData> => {
    const response = await fetch(`${API_BASE_URL}/applicant-info/academics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', ...data }),
    });
    return handleResponse<AcademicData>(response);
  },

  update: async (id: string, data: Partial<AcademicData>): Promise<AcademicData> => {
    const response = await fetch(`${API_BASE_URL}/applicant-info/academics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', id, ...data }),
    });
    return handleResponse<AcademicData>(response);
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/applicant-info/academics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id }),
    });
    await handleResponse<void>(response);
  },
};

// ============================================
// ACHIEVEMENTS API
// ============================================

export interface AchievementData {
  id?: string;
  achievementPoint: string;
  displayOrder: number;
}

export const achievementsApi = {
  getAll: async (): Promise<AchievementData[]> => {
    const response = await fetch(`${API_BASE_URL}/applicant-info/achievements`);
    return handleResponse<AchievementData[]>(response);
  },

  create: async (data: Omit<AchievementData, 'id'>): Promise<AchievementData> => {
    const response = await fetch(`${API_BASE_URL}/applicant-info/achievements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', ...data }),
    });
    return handleResponse<AchievementData>(response);
  },

  update: async (id: string, data: Partial<AchievementData>): Promise<AchievementData> => {
    const response = await fetch(`${API_BASE_URL}/applicant-info/achievements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', id, ...data }),
    });
    return handleResponse<AchievementData>(response);
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/applicant-info/achievements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id }),
    });
    await handleResponse<void>(response);
  },
};

// ============================================
// SKILLS API
// ============================================

export interface SkillData {
  id: string;
  skillName: string;
  category: string;
}

export const skillsApi = {
  getAll: async (category?: string, search?: string): Promise<SkillData[]> => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    
    const url = `${API_BASE_URL}/skills${params.toString() ? '?' + params : ''}`;
    const response = await fetch(url);
    return handleResponse<SkillData[]>(response);
  },

  create: async (skillName: string, category: string): Promise<SkillData> => {
    const response = await fetch(`${API_BASE_URL}/skills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skillName, category }),
    });
    return handleResponse<SkillData>(response);
  },

  getUserSkills: async (): Promise<SkillData[]> => {
    const response = await fetch(`${API_BASE_URL}/applicant-info/skills`);
    return handleResponse<SkillData[]>(response);
  },

  addUserSkills: async (skillIds: string[]): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/applicant-info/skills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add', skillIds }),
    });
    await handleResponse<void>(response);
  },

  removeUserSkills: async (skillIds: string[]): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/applicant-info/skills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'remove', skillIds }),
    });
    await handleResponse<void>(response);
  },
};

// ============================================
// PROJECTS API
// ============================================

export interface ProjectData {
  id: string;
  projectName: string;
  projectInfo: string;
  displayOrder: number;
  skills: SkillData[];
}

export const projectsApi = {
  getAll: async (): Promise<ProjectData[]> => {
    const response = await fetch(`${API_BASE_URL}/applicant-info/projects`);
    return handleResponse<ProjectData[]>(response);
  },

  create: async (data: { projectName: string; projectInfo: string; skillIds: string[]; displayOrder: number }): Promise<ProjectData> => {
    const response = await fetch(`${API_BASE_URL}/applicant-info/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', ...data }),
    });
    return handleResponse<ProjectData>(response);
  },

  update: async (id: string, data: Partial<{ projectName: string; projectInfo: string; skillIds: string[]; displayOrder: number }>): Promise<ProjectData> => {
    const response = await fetch(`${API_BASE_URL}/applicant-info/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', id, ...data }),
    });
    return handleResponse<ProjectData>(response);
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/applicant-info/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id }),
    });
    await handleResponse<void>(response);
  },
};

// ============================================
// EXPERIENCES API
// ============================================

export interface ExperienceData {
  id: string;
  experienceName: string;
  startDate: string;
  endDate: string;
  role: string;
  location?: string;
  experienceExplanation: string;
  displayOrder: number;
}

export const experiencesApi = {
  getAll: async (): Promise<ExperienceData[]> => {
    const response = await fetch(`${API_BASE_URL}/applicant-info/experiences`);
    return handleResponse<ExperienceData[]>(response);
  },

  create: async (data: Omit<ExperienceData, 'id'>): Promise<ExperienceData> => {
    const response = await fetch(`${API_BASE_URL}/applicant-info/experiences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', ...data }),
    });
    return handleResponse<ExperienceData>(response);
  },

  update: async (id: string, data: Partial<ExperienceData>): Promise<ExperienceData> => {
    const response = await fetch(`${API_BASE_URL}/applicant-info/experiences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', id, ...data }),
    });
    return handleResponse<ExperienceData>(response);
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/applicant-info/experiences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id }),
    });
    await handleResponse<void>(response);
  },
};

// ============================================
// APPLICATIONS API
// ============================================

export interface ApplicationData {
  id: string;
  jobName: string;
  companyName: string;
  jobLink: string;
  resumeFilePath?: string;
  status: 'Applied' | 'Rejected' | 'Timed out' | 'Processed' | 'Accepted' | 'Interview';
  notes?: string;
}

export const applicationsApi = {
  getAll: async (params?: {
    status?: string;
    company?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ applications: ApplicationData[]; total: number; page: number; limit: number }> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.company) searchParams.append('company', params.company);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());

    const url = `${API_BASE_URL}/applications${searchParams.toString() ? '?' + searchParams : ''}`;
    const response = await fetch(url);
    return handleResponse<{ applications: ApplicationData[]; total: number; page: number; limit: number }>(response);
  },

  create: async (data: Omit<ApplicationData, 'id' | 'resumeFilePath'>): Promise<ApplicationData> => {
    const response = await fetch(`${API_BASE_URL}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', ...data }),
    });
    return handleResponse<ApplicationData>(response);
  },

  update: async (id: string, data: Partial<Omit<ApplicationData, 'id' | 'resumeFilePath'>>): Promise<ApplicationData> => {
    const response = await fetch(`${API_BASE_URL}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', id, ...data }),
    });
    return handleResponse<ApplicationData>(response);
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id }),
    });
    await handleResponse<void>(response);
  },
};

// ============================================
// RESUME FILE MANAGEMENT API
// ============================================

export interface ResumeFileData {
  resumeFilePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export const resumeFileApi = {
  upload: async (applicationId: string, file: File): Promise<ResumeFileData> => {
    const formData = new FormData();
    formData.append('action', 'upload');
    formData.append('id', applicationId);
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/resume`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse<ResumeFileData>(response);
  },

  download: async (applicationId: string): Promise<Blob> => {
    const response = await fetch(`${API_BASE_URL}/resume?id=${applicationId}`);
    if (!response.ok) {
      throw new Error('Failed to download resume');
    }
    return await response.blob();
  },

  delete: async (applicationId: string): Promise<void> => {
    const formData = new FormData();
    formData.append('action', 'delete');
    formData.append('id', applicationId);

    const response = await fetch(`${API_BASE_URL}/resume`, {
      method: 'POST',
      body: formData,
    });
    await handleResponse<void>(response);
  },
};

// ============================================
// APPLICATION STATISTICS API
// ============================================

export interface ApplicationStatsData {
  total: number;
  byStatus: {
    Applied: number;
    Rejected: number;
    'Timed out': number;
    Processed: number;
    Accepted: number;
    Interview: number;
  };
  successRate: number;
  recentApplications: Array<{
    id: string;
    jobName: string;
    companyName: string;
    status: string;
  }>;
}

export const applicationStatsApi = {
  get: async (): Promise<ApplicationStatsData> => {
    const response = await fetch(`${API_BASE_URL}/applications/stats`);
    return handleResponse<ApplicationStatsData>(response);
  },
};

// ============================================
// COMPLETE APPLICANT INFO API
// ============================================

export interface CompleteApplicantInfoData {
  basicInformation: BasicInfoData | null;
  academics: AcademicData[];
  achievements: AchievementData[];
  skills: SkillData[];
  projects: ProjectData[];
  experiences: ExperienceData[];
}

export const completeInfoApi = {
  get: async (): Promise<CompleteApplicantInfoData> => {
    const response = await fetch(`${API_BASE_URL}/applicant-info/complete`);
    return handleResponse<CompleteApplicantInfoData>(response);
  },
};

// ============================================
// RESUME GENERATOR APIs
// ============================================

// Experience Generator API
export const ANALYZER_BASE_URL = `${BackendURL}analyzer`;
export interface ExperienceGeneratorRequest {
  job_role: string;
  job_description: string;
  points_count: number[];
  additional_instruction: string;
}

export interface GeneratedExperienceItem {
  experience_id: number;
  experience_role: string;
  resume_points: string[];
  experience_company_name: string;
  start_date: string;
  end_date: string;
}

export interface ExperienceGeneratorResponse {
  message: string;
  status: string;
  output: GeneratedExperienceItem[];
}

export const experienceGeneratorApi = {
  generate: async (data: ExperienceGeneratorRequest): Promise<ExperienceGeneratorResponse> => {
    const response = await fetch(`${ANALYZER_BASE_URL}/experience-gen`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (!response.ok || result.status !== 'success') {
      throw new Error(result.message || 'Experience generation failed');
    }
    
    return result;
  },
};

// Project Generator API
export interface ProjectGeneratorRequest {
  job_role: string;
  job_description: string;
  points_count: number[];
  additional_instruction: string;
}

export interface GeneratedProjectItem {
  project_id: number;
  project_name: string;
  project_points: string[];
  project_skills: string[];
}

export interface ProjectGeneratorResponse {
  message: string;
  status: string;
  output: GeneratedProjectItem[];
}

export const projectGeneratorApi = {
  generate: async (data: ProjectGeneratorRequest): Promise<ProjectGeneratorResponse> => {
    const response = await fetch(`${ANALYZER_BASE_URL}/project-gen`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (!response.ok || result.status !== 'success') {
      throw new Error(result.message || 'Project generation failed');
    }
    
    return result;
  },
};

// Skills Generator API
export interface SkillsGeneratorRequest {
  job_role: string;
  job_description: string;
  additional_instruction: string;
  include_web_research: boolean;
  experience_data: GeneratedExperienceItem[];
  project_data: GeneratedProjectItem[];
}

export interface GeneratedSkillCategory {
  skill_category: string;
  skills: string[];
}

export interface SkillsGeneratorResponse {
  message: string;
  status: string;
  output: GeneratedSkillCategory[];
}

export const skillsGeneratorApi = {
  generate: async (data: SkillsGeneratorRequest): Promise<SkillsGeneratorResponse> => {
    const response = await fetch(`${ANALYZER_BASE_URL}/skill-gen`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (!response.ok || result.status !== 'success') {
      throw new Error(result.message || 'Skills generation failed');
    }
    
    return result;
  },
};

