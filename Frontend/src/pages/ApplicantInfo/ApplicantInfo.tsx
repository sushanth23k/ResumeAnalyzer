import React, { useState } from 'react';
import BasicInfo from './BasicInfo';
import ProjectsAndSkills from './ProjectsAndSkills';
import Experiences from './Experiences';
import styles from './ApplicantInfo.module.css';

type Section = 'basic' | 'projects' | 'experiences';

const ApplicantInfo: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>('basic');

  const sections = [
    { id: 'basic' as Section, label: 'Basic Information', icon: '👤' },
    { id: 'projects' as Section, label: 'Projects and Skills', icon: '💼' },
    { id: 'experiences' as Section, label: 'Experiences', icon: '🎯' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <h2>Applicant Info</h2>
        <nav className={styles.nav}>
          {sections.map(section => (
            <button
              key={section.id}
              className={`${styles.navButton} ${
                activeSection === section.id ? styles.active : ''
              }`}
              onClick={() => setActiveSection(section.id)}
            >
              <span className={styles.icon}>{section.icon}</span>
              {section.label}
            </button>
          ))}
        </nav>
      </div>

      <div className={styles.content}>
        {activeSection === 'basic' && <BasicInfo />}
        {activeSection === 'projects' && <ProjectsAndSkills />}
        {activeSection === 'experiences' && <Experiences />}
      </div>
    </div>
  );
};

export default ApplicantInfo;

