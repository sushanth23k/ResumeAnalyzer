import React, { useState } from 'react';
import ExperienceGenerator from './ExperienceGenerator';
import ProjectGenerator from './ProjectGenerator';
import SkillsGenerator from './SkillsGenerator';
import ResumeOutput from './ResumeOutput';
import { GeneratorStepStatus } from '../../types/resume';
import styles from './ResumeGenerator.module.css';

type GeneratorStep = 'experience' | 'project' | 'skills' | 'resumeOutput';

interface SharedGeneratorData {
  jobRole: string;
  jobRequirements: string;
}

const STEPS = [
  { id: 'experience'  as GeneratorStep, label: 'Experience',  icon: '🎯', desc: 'Generate tailored bullet points' },
  { id: 'project'     as GeneratorStep, label: 'Projects',    icon: '💼', desc: 'Highlight key contributions' },
  { id: 'skills'      as GeneratorStep, label: 'Skills',      icon: '⚡', desc: 'Match skills to job requirements' },
  { id: 'resumeOutput'as GeneratorStep, label: 'Resume',      icon: '📄', desc: 'Preview & export your resume' },
];

const ResumeGenerator: React.FC = () => {
  const [activeStep, setActiveStep] = useState<GeneratorStep>('experience');
  const [stepStatus, setStepStatus] = useState<GeneratorStepStatus>({
    experience: false,
    project: false,
    skills: false,
    resumeOutput: false,
  });
  const [sharedData, setSharedData] = useState<SharedGeneratorData>({
    jobRole: '',
    jobRequirements: '',
  });

  const completedCount = Object.values(stepStatus).filter(Boolean).length;
  const progressPct    = Math.round((completedCount / (STEPS.length-1)) * 100);

  const handleStepComplete = (step: GeneratorStep) => {
    setStepStatus(prev => ({ ...prev, [step]: true }));
    const idx = STEPS.findIndex(s => s.id === step);
    if (idx < STEPS.length - 1) setActiveStep(STEPS[idx + 1].id);
  };

  const canNavigateToStep = (step: GeneratorStep): boolean => {
    const currentIdx = STEPS.findIndex(s => s.id === activeStep);
    const targetIdx  = STEPS.findIndex(s => s.id === step);
    if (targetIdx <= currentIdx) return true;
    if (targetIdx === currentIdx + 1) return stepStatus[activeStep];
    return false;
  };

  return (
    <div className={styles.container}>

      {/* ── Sidebar ── */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <p className={styles.sidebarEyebrow}>AI-Powered</p>
          <h2 className={styles.sidebarTitle}>Resume Generator</h2>
          <p className={styles.sidebarSubtitle}>Create tailored, job-specific resume content with AI assistance</p>
        </div>

        {/* Progress Bar */}
        <div className={styles.progressWrapper}>
          <div className={styles.progressLabel}>
            <span>{completedCount} of {STEPS.length} steps completed</span>
            <span className={styles.progressPct}>{progressPct}%</span>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        <nav className={styles.nav}>
          {STEPS.map((step, i) => (
            <button
              key={step.id}
              className={[
                styles.navButton,
                activeStep === step.id   ? styles.active    : '',
                stepStatus[step.id]      ? styles.completed : '',
                !canNavigateToStep(step.id) ? styles.disabled : '',
              ].join(' ')}
              onClick={() => canNavigateToStep(step.id) && setActiveStep(step.id)}
              disabled={!canNavigateToStep(step.id)}
            >
              <span className={styles.navStep}>{stepStatus[step.id] ? '✓' : i + 1}</span>
              <span className={styles.icon}>{step.icon}</span>
              <span className={styles.labelContainer}>
                <span className={styles.label}>{step.label}</span>
                {stepStatus[step.id] && (
                  <span className={styles.checkmark}>✓</span>
                )}
              </span>
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <p className={styles.sidebarTip}>
            ✨ Each step refines the AI output. Complete them in order for best results.
          </p>
        </div>
      </div>

      {/* ── Content ── */}
      <div className={styles.content}>
        {activeStep === 'experience' && (
          <ExperienceGenerator
            onComplete={() => handleStepComplete('experience')}
            sharedData={sharedData}
            onUpdateSharedData={setSharedData}
          />
        )}
        {activeStep === 'project' && (
          <ProjectGenerator
            onComplete={() => handleStepComplete('project')}
            sharedData={sharedData}
            onUpdateSharedData={setSharedData}
          />
        )}
        {activeStep === 'skills' && (
          <SkillsGenerator
            onComplete={() => handleStepComplete('skills')}
            sharedData={sharedData}
            onUpdateSharedData={setSharedData}
          />
        )}
        {activeStep === 'resumeOutput' && <ResumeOutput />}
      </div>
    </div>
  );
};

export default ResumeGenerator;
