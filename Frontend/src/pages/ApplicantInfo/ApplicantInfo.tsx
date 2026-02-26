import React, { useState } from 'react';
import BasicInfo from './BasicInfo';
import ProjectsAndSkills from './ProjectsAndSkills';
import Experiences from './Experiences';
import styles from './ApplicantInfo.module.css';

type Section = 'basic' | 'projects' | 'experiences';

const SECTIONS = [
  { id: 'basic'       as Section, label: 'Basic Information', icon: '👤', description: 'Personal details & education' },
  { id: 'projects'    as Section, label: 'Projects & Skills',  icon: '💼', description: 'Portfolio & skill categories' },
  { id: 'experiences' as Section, label: 'Work Experiences',   icon: '🎯', description: 'Roles & responsibilities' },
];

const ApplicantInfo: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>('basic');

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <p className={styles.sidebarEyebrow}>Resume Data</p>
          <h2 className={styles.sidebarTitle}>Applicant Info</h2>
          <p className={styles.sidebarSubtitle}>Fill in all sections to enable AI-powered resume generation</p>
        </div>

        <nav className={styles.nav}>
          {SECTIONS.map((s, i) => (
            <button
              key={s.id}
              className={`${styles.navButton} ${activeSection === s.id ? styles.active : ''}`}
              onClick={() => setActiveSection(s.id)}
            >
              <span className={styles.navStep}>{i + 1}</span>
              <span className={styles.navIcon}>{s.icon}</span>
              <span className={styles.navText}>
                <span className={styles.navLabel}>{s.label}</span>
                <span className={styles.navDesc}>{s.description}</span>
              </span>
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <p className={styles.sidebarTip}>
            💡 Complete all sections to get the best AI-generated resume content.
          </p>
        </div>
      </div>

      <div className={styles.content}>
        {activeSection === 'basic'       && <BasicInfo />}
        {activeSection === 'projects'    && <ProjectsAndSkills />}
        {activeSection === 'experiences' && <Experiences />}
      </div>
    </div>
  );
};

export default ApplicantInfo;
