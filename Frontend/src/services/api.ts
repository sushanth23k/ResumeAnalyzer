// API Service for Resume Analyzer Backend
import { authFetch } from '../utils/apiClient';

export const BackendURL = 'http://127.0.0.1:8000/';
export const API_BASE_URL = `${BackendURL}api`;
export const ANALYZER_BASE_URL = `${BackendURL}analyzer`;

// Helper — expects { success, data } envelope
async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!data.success) throw new Error(data.error?.message || 'API request failed');
  return data.data;
}

// ─── Basic Information ─────────────────────────────────────────────────────

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
    const res = await authFetch(`${API_BASE_URL}/applicant-info/basic`);
    const data = await res.json();
    return data.success ? data.data : null;
  },

  save: async (info: BasicInfoData): Promise<BasicInfoData> => {
    const res = await authFetch(`${API_BASE_URL}/applicant-info/basic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(info),
    });
    return handleResponse<BasicInfoData>(res);
  },
};

// ─── Academics ─────────────────────────────────────────────────────────────

export interface AcademicData {
  id?: string;
  collegeName: string;
  graduationDate: string;
  course: string;
  displayOrder: number;
}

export const academicsApi = {
  getAll: async (): Promise<AcademicData[]> => {
    const res = await authFetch(`${API_BASE_URL}/applicant-info/academics`);
    return handleResponse<AcademicData[]>(res);
  },

  create: async (data: Omit<AcademicData, 'id'>): Promise<AcademicData> => {
    const res = await authFetch(`${API_BASE_URL}/applicant-info/academics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', ...data }),
    });
    return handleResponse<AcademicData>(res);
  },

  update: async (id: string, data: Partial<AcademicData>): Promise<AcademicData> => {
    const res = await authFetch(`${API_BASE_URL}/applicant-info/academics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', id, ...data }),
    });
    return handleResponse<AcademicData>(res);
  },

  delete: async (id: string): Promise<void> => {
    const res = await authFetch(`${API_BASE_URL}/applicant-info/academics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id }),
    });
    await handleResponse<void>(res);
  },
};

// ─── Achievements ──────────────────────────────────────────────────────────

export interface AchievementData {
  id?: string;
  achievementPoint: string;
  displayOrder: number;
}

export const achievementsApi = {
  getAll: async (): Promise<AchievementData[]> => {
    const res = await authFetch(`${API_BASE_URL}/applicant-info/achievements`);
    return handleResponse<AchievementData[]>(res);
  },

  create: async (data: Omit<AchievementData, 'id'>): Promise<AchievementData> => {
    const res = await authFetch(`${API_BASE_URL}/applicant-info/achievements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', ...data }),
    });
    return handleResponse<AchievementData>(res);
  },

  update: async (id: string, data: Partial<AchievementData>): Promise<AchievementData> => {
    const res = await authFetch(`${API_BASE_URL}/applicant-info/achievements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', id, ...data }),
    });
    return handleResponse<AchievementData>(res);
  },

  delete: async (id: string): Promise<void> => {
    const res = await authFetch(`${API_BASE_URL}/applicant-info/achievements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id }),
    });
    await handleResponse<void>(res);
  },
};

// ─── Skills ────────────────────────────────────────────────────────────────

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
    const res = await authFetch(url);
    return handleResponse<SkillData[]>(res);
  },

  create: async (skillName: string, category: string): Promise<SkillData> => {
    const res = await authFetch(`${API_BASE_URL}/skills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skillName, category }),
    });
    return handleResponse<SkillData>(res);
  },

  getUserSkills: async (): Promise<SkillData[]> => {
    const res = await authFetch(`${API_BASE_URL}/applicant-info/skills`);
    return handleResponse<SkillData[]>(res);
  },

  addUserSkills: async (skillIds: string[]): Promise<void> => {
    const res = await authFetch(`${API_BASE_URL}/applicant-info/skills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add', skillIds }),
    });
    await handleResponse<void>(res);
  },

  removeUserSkills: async (skillIds: string[]): Promise<void> => {
    const res = await authFetch(`${API_BASE_URL}/applicant-info/skills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'remove', skillIds }),
    });
    await handleResponse<void>(res);
  },
};

// ─── Projects ──────────────────────────────────────────────────────────────

export interface ProjectData {
  id: string;
  projectName: string;
  projectInfo: string;
  displayOrder: number;
  skills: SkillData[];
}

export const projectsApi = {
  getAll: async (): Promise<ProjectData[]> => {
    const res = await authFetch(`${API_BASE_URL}/applicant-info/projects`);
    return handleResponse<ProjectData[]>(res);
  },

  create: async (data: {
    projectName: string;
    projectInfo: string;
    skillIds: string[];
    displayOrder: number;
  }): Promise<ProjectData> => {
    const res = await authFetch(`${API_BASE_URL}/applicant-info/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', ...data }),
    });
    return handleResponse<ProjectData>(res);
  },

  update: async (
    id: string,
    data: Partial<{
      projectName: string;
      projectInfo: string;
      skillIds: string[];
      displayOrder: number;
    }>,
  ): Promise<ProjectData> => {
    const res = await authFetch(`${API_BASE_URL}/applicant-info/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', id, ...data }),
    });
    return handleResponse<ProjectData>(res);
  },

  delete: async (id: string): Promise<void> => {
    const res = await authFetch(`${API_BASE_URL}/applicant-info/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id }),
    });
    await handleResponse<void>(res);
  },
};

// ─── Experiences ───────────────────────────────────────────────────────────

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
    const res = await authFetch(`${API_BASE_URL}/applicant-info/experiences`);
    return handleResponse<ExperienceData[]>(res);
  },

  create: async (data: Omit<ExperienceData, 'id'>): Promise<ExperienceData> => {
    const res = await authFetch(`${API_BASE_URL}/applicant-info/experiences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', ...data }),
    });
    return handleResponse<ExperienceData>(res);
  },

  update: async (id: string, data: Partial<ExperienceData>): Promise<ExperienceData> => {
    const res = await authFetch(`${API_BASE_URL}/applicant-info/experiences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', id, ...data }),
    });
    return handleResponse<ExperienceData>(res);
  },

  delete: async (id: string): Promise<void> => {
    const res = await authFetch(`${API_BASE_URL}/applicant-info/experiences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id }),
    });
    await handleResponse<void>(res);
  },
};

// ─── Applications ──────────────────────────────────────────────────────────

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
    const sp = new URLSearchParams();
    if (params?.status) sp.append('status', params.status);
    if (params?.company) sp.append('company', params.company);
    if (params?.limit) sp.append('limit', params.limit.toString());
    if (params?.offset) sp.append('offset', params.offset.toString());
    const url = `${API_BASE_URL}/applications${sp.toString() ? '?' + sp : ''}`;
    const res = await authFetch(url);
    return handleResponse<{ applications: ApplicationData[]; total: number; page: number; limit: number }>(res);
  },

  create: async (data: Omit<ApplicationData, 'id' | 'resumeFilePath'>): Promise<ApplicationData> => {
    const res = await authFetch(`${API_BASE_URL}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', ...data }),
    });
    return handleResponse<ApplicationData>(res);
  },

  update: async (
    id: string,
    data: Partial<Omit<ApplicationData, 'id' | 'resumeFilePath'>>,
  ): Promise<ApplicationData> => {
    const res = await authFetch(`${API_BASE_URL}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', id, ...data }),
    });
    return handleResponse<ApplicationData>(res);
  },

  delete: async (id: string): Promise<void> => {
    const res = await authFetch(`${API_BASE_URL}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id }),
    });
    await handleResponse<void>(res);
  },
};

// ─── Resume File ───────────────────────────────────────────────────────────

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
    const res = await authFetch(`${API_BASE_URL}/resume`, { method: 'POST', body: formData });
    return handleResponse<ResumeFileData>(res);
  },

  download: async (applicationId: string): Promise<Blob> => {
    const res = await authFetch(`${API_BASE_URL}/resume?id=${applicationId}`);
    if (!res.ok) throw new Error('Failed to download resume');
    return res.blob();
  },

  delete: async (applicationId: string): Promise<void> => {
    const formData = new FormData();
    formData.append('action', 'delete');
    formData.append('id', applicationId);
    const res = await authFetch(`${API_BASE_URL}/resume`, { method: 'POST', body: formData });
    await handleResponse<void>(res);
  },
};

// ─── Application Stats ─────────────────────────────────────────────────────

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
  recentApplications: Array<{ id: string; jobName: string; companyName: string; status: string }>;
}

export const applicationStatsApi = {
  get: async (): Promise<ApplicationStatsData> => {
    const res = await authFetch(`${API_BASE_URL}/applications/stats`);
    return handleResponse<ApplicationStatsData>(res);
  },
};

// ─── Complete Info ─────────────────────────────────────────────────────────

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
    const res = await authFetch(`${API_BASE_URL}/applicant-info/complete`);
    return handleResponse<CompleteApplicantInfoData>(res);
  },
};

// ─── AI Generator APIs ─────────────────────────────────────────────────────

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
    const res = await authFetch(`${ANALYZER_BASE_URL}/experience-gen`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok || result.status !== 'success') throw new Error(result.message || 'Experience generation failed');
    return result;
  },
};

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
    const res = await authFetch(`${ANALYZER_BASE_URL}/project-gen`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok || result.status !== 'success') throw new Error(result.message || 'Project generation failed');
    return result;
  },
};

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
    const res = await authFetch(`${ANALYZER_BASE_URL}/skill-gen`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok || result.status !== 'success') throw new Error(result.message || 'Skills generation failed');
    return result;
  },
};
