// TypeScript interfaces for Resume Analyzer application
// Note: These types are for backward compatibility with existing components
// New components should use types from services/api.ts

export interface Application {
  id: string;
  jobName: string;
  companyName: string;
  link: string;
  resumeLink: string;
  status: ApplicationStatus;
}

export type ApplicationStatus = 
  | 'Applied' 
  | 'Rejected' 
  | 'Timed out' 
  | 'Processed' 
  | 'Accepted' 
  | 'Interview';

export interface Academic {
  id?: string;
  collegeName: string;
  graduationDate: string;
  course: string;
  displayOrder?: number;
}

export interface Achievement {
  id?: string;
  achievementPoint: string;
  displayOrder?: number;
}

export interface BasicInformation {
  fullName: string;
  phoneNumber: string;
  email: string;
  linkedIn: string;
  github: string;
  address: string;
  academics: Academic[];
  achievements: Achievement[];
}

export interface Project {
  id?: string;
  projectName: string;
  skills: string[];
  projectInfo: string;
  displayOrder?: number;
}

export interface ProjectsAndSkills {
  projects: Project[];
  skills: string[];
}

export interface Experience {
  id?: string;
  experienceName: string;
  startDate: string;
  endDate: string;
  role: string;
  experienceExplanation: string;
  displayOrder?: number;
}

export interface ApplicantInfo {
  basicInformation: BasicInformation;
  projectsAndSkills: ProjectsAndSkills;
  experiences: Experience[];
}

export interface SkillCategory {
  subSkillType: string;
  subSkills: string[];
}

export interface GeneratedExperience {
  companyName: string;
  newExperience: string[];
}

export interface GeneratedProject {
  projectName: string;
  newProjectInfo: string;
}

export interface SkillsByCategory {
  [categoryName: string]: string[];
}

export interface GeneratorOutput {
  experiences: GeneratedExperience[];
  projects: GeneratedProject[];
  skills: SkillsByCategory;
}

export interface GeneratorStepStatus {
  experience: boolean;
  project: boolean;
  skills: boolean;
  resumeOutput: boolean;
}

