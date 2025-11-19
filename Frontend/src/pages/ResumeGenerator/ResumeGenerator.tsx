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

  const steps = [
    { id: 'experience' as GeneratorStep, label: 'Experience Generator', icon: '🎯' },
    { id: 'project' as GeneratorStep, label: 'Project Generator', icon: '💼' },
    { id: 'skills' as GeneratorStep, label: 'Skills Generator', icon: '⚡' },
    { id: 'resumeOutput' as GeneratorStep, label: 'Resume Output', icon: '📄' },
  ];

  const handleStepComplete = (step: GeneratorStep) => {
    setStepStatus(prev => ({ ...prev, [step]: true }));
    
    // Auto-navigate to next step
    const currentIndex = steps.findIndex(s => s.id === step);
    if (currentIndex < steps.length - 1) {
      setActiveStep(steps[currentIndex + 1].id);
    }
  };

  const canNavigateToStep = (step: GeneratorStep): boolean => {
    const currentIndex = steps.findIndex(s => s.id === activeStep);
    const targetIndex = steps.findIndex(s => s.id === step);
    
    // Can always navigate to current or previous steps
    if (targetIndex <= currentIndex) return true;
    
    // Can navigate to next step only if current step is completed
    if (targetIndex === currentIndex + 1) {
      return stepStatus[activeStep];
    }
    
    // Cannot skip ahead
    return false;
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <h2>Resume Generator</h2>
        <p className={styles.subtitle}>Create tailored resume content</p>
        <nav className={styles.nav}>
          {steps.map(step => (
            <button
              key={step.id}
              className={`${styles.navButton} ${
                activeStep === step.id ? styles.active : ''
              } ${stepStatus[step.id] ? styles.completed : ''} ${
                !canNavigateToStep(step.id) ? styles.disabled : ''
              }`}
              onClick={() => canNavigateToStep(step.id) && setActiveStep(step.id)}
              disabled={!canNavigateToStep(step.id)}
            >
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
      </div>

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
