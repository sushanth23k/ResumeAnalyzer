import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Application, ApplicantInfo, GeneratorOutput } from '../types/resume';
import { GeneratedExperienceItem, GeneratedProjectItem } from '../services/api';

interface ResumeContextType {
  applications: Application[];
  setApplications: React.Dispatch<React.SetStateAction<Application[]>>;
  applicantInfo: ApplicantInfo;
  setApplicantInfo: React.Dispatch<React.SetStateAction<ApplicantInfo>>;
  generatorOutput: GeneratorOutput;
  setGeneratorOutput: React.Dispatch<React.SetStateAction<GeneratorOutput>>;
  // Raw API responses for passing between generators
  rawExperienceData: GeneratedExperienceItem[];
  setRawExperienceData: React.Dispatch<React.SetStateAction<GeneratedExperienceItem[]>>;
  rawProjectData: GeneratedProjectItem[];
  setRawProjectData: React.Dispatch<React.SetStateAction<GeneratedProjectItem[]>>;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

const initialApplicantInfo: ApplicantInfo = {
  basicInformation: {
    fullName: '',
    phoneNumber: '',
    email: '',
    linkedIn: '',
    github: '',
    address: '',
    academics: [],
    achievements: [],
  },
  projectsAndSkills: {
    projects: [],
    skills: [],
  },
  experiences: [],
};

const initialGeneratorOutput: GeneratorOutput = {
  experiences: [],
  projects: [],
  skills: {},
};

export const ResumeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [applications, setApplications] = useState<Application[]>(() => {
    const saved = localStorage.getItem('applications');
    return saved ? JSON.parse(saved) : [];
  });

  const [applicantInfo, setApplicantInfo] = useState<ApplicantInfo>(() => {
    const saved = localStorage.getItem('applicantInfo');
    return saved ? JSON.parse(saved) : initialApplicantInfo;
  });

  const [generatorOutput, setGeneratorOutput] = useState<GeneratorOutput>(() => {
    const saved = localStorage.getItem('generatorOutput');
    return saved ? JSON.parse(saved) : initialGeneratorOutput;
  });

  const [rawExperienceData, setRawExperienceData] = useState<GeneratedExperienceItem[]>([]);
  const [rawProjectData, setRawProjectData] = useState<GeneratedProjectItem[]>([]);

  useEffect(() => {
    localStorage.setItem('applications', JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem('applicantInfo', JSON.stringify(applicantInfo));
  }, [applicantInfo]);

  useEffect(() => {
    localStorage.setItem('generatorOutput', JSON.stringify(generatorOutput));
  }, [generatorOutput]);

  return (
    <ResumeContext.Provider
      value={{
        applications,
        setApplications,
        applicantInfo,
        setApplicantInfo,
        generatorOutput,
        setGeneratorOutput,
        rawExperienceData,
        setRawExperienceData,
        rawProjectData,
        setRawProjectData,
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
};

export const useResume = () => {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
};

