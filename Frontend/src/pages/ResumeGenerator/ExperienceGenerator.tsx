import React, { useState, useEffect } from 'react';
import { useResume } from '../../context/ResumeContext';
import { experiencesApi, ExperienceData, experienceGeneratorApi } from '../../services/api';
import { GeneratedExperience } from '../../types/resume';
import styles from './Generator.module.css';

interface SharedGeneratorData {
  jobRole: string;
  jobRequirements: string;
}

interface ExperienceGeneratorProps {
  onComplete: () => void;
  sharedData: SharedGeneratorData;
  onUpdateSharedData: (data: SharedGeneratorData) => void;
}

const ExperienceGenerator: React.FC<ExperienceGeneratorProps> = ({ onComplete, sharedData, onUpdateSharedData }) => {
  const { setGeneratorOutput, setRawExperienceData } = useResume();
  const [experiences, setExperiences] = useState<ExperienceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobRole, setJobRole] = useState(sharedData.jobRole);
  const [jobRequirements, setJobRequirements] = useState(sharedData.jobRequirements);
  const [sidePrompt, setSidePrompt] = useState('');
  const [bulletCounts, setBulletCounts] = useState<number[]>([]);
  const [generatedExperiences, setGeneratedExperiences] = useState<GeneratedExperience[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [editingExperience, setEditingExperience] = useState<GeneratedExperience | null>(null);

  useEffect(() => {
    loadExperiences();
  }, []);

  const loadExperiences = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await experiencesApi.getAll();
      setExperiences(data);
      // Initialize bullet counts with default value of 5 for each experience
      setBulletCounts(data.map(() => 5));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load experiences');
      console.error('Error loading experiences:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Use original experiences as the new version
    const skippedExperiences: GeneratedExperience[] = experiences.map(exp => ({
      companyName: exp.experienceName,
      newExperience: [
        `${exp.role || 'Professional Role'} (${exp.startDate} - ${exp.endDate})`,
        exp.experienceExplanation
      ]
    }));
    
    setGeneratedExperiences(skippedExperiences);
    setGeneratorOutput(prev => ({ ...prev, experiences: skippedExperiences }));
    setHasGenerated(true);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // Call the real Experience Generator API
      const response = await experienceGeneratorApi.generate({
        job_role: jobRole,
        job_description: jobRequirements,
        points_count: bulletCounts,
        additional_instruction: sidePrompt,
      });

      // Store the raw API response for the Skills Generator
      setRawExperienceData(response.output);

      // Transform the API response to the frontend format
      const transformedExperiences: GeneratedExperience[] = response.output.map(item => ({
        companyName: item.experience_company_name,
        newExperience: item.resume_points
      }));

      setGeneratedExperiences(transformedExperiences);
      setGeneratorOutput(prev => ({ ...prev, experiences: transformedExperiences }));
      setHasGenerated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate experiences');
      console.error('Error generating experiences:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNext = () => {
    onComplete();
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditingExperience({ ...generatedExperiences[index] });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editingExperience && editingIndex >= 0) {
      const updated = [...generatedExperiences];
      updated[editingIndex] = editingExperience;
      setGeneratedExperiences(updated);
      setGeneratorOutput(prev => ({ ...prev, experiences: updated }));
    }
    setIsEditing(false);
    setEditingIndex(-1);
    setEditingExperience(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingIndex(-1);
    setEditingExperience(null);
  };

  const handleAddExperiencePoint = () => {
    if (editingExperience) {
      setEditingExperience({
        ...editingExperience,
        newExperience: [...editingExperience.newExperience, '']
      });
    }
  };

  const handleRemoveExperiencePoint = (pointIndex: number) => {
    if (editingExperience) {
      setEditingExperience({
        ...editingExperience,
        newExperience: editingExperience.newExperience.filter((_, i) => i !== pointIndex)
      });
    }
  };

  const handleUpdateExperiencePoint = (pointIndex: number, value: string) => {
    if (editingExperience) {
      const updated = [...editingExperience.newExperience];
      updated[pointIndex] = value;
      setEditingExperience({
        ...editingExperience,
        newExperience: updated
      });
    }
  };

  if (loading) {
    return (
      <div className={styles.generator}>
        <div className={styles.loadingState}>
          <span className={styles.loadSpinner} />
          Loading your experiences…
        </div>
      </div>
    );
  }

  return (
    <div className={styles.generator}>
      {/* ── Dismissible Error Banner ── */}
      {error && (
        <div className={styles.errorBanner}>
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className={styles.errorDismiss} aria-label="Dismiss">✕</button>
        </div>
      )}

      <div className={styles.header}>
        <p className={styles.stepEyebrow}>Step 1 of 4</p>
        <h2>🎯 Experience Generator</h2>
        <p>AI will rewrite your experience bullet points to match the job description. You can also skip this step.</p>
      </div>

      <div className={styles.section}>
        <h3>Current Experiences</h3>
        <div className={styles.experienceList}>
          {experiences.length === 0 ? (
            <p className={styles.empty}>No experiences added yet. Add them in Applicant Info.</p>
          ) : (
            experiences.map((exp, index) => (
              <div key={exp.id} className={styles.experienceItem}>
                <h4>{exp.experienceName}</h4>
                <p className={styles.date}>
                  {exp.startDate} - {exp.endDate}
                  {exp.role && <span> • {exp.role}</span>}
                  {exp.location && <span> • {exp.location}</span>}
                </p>
                <p className={styles.description}>{exp.experienceExplanation}</p>
                <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                    Bullet points to generate:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={bulletCounts[index] || 5}
                    onChange={(e) => {
                      const newCounts = [...bulletCounts];
                      newCounts[index] = parseInt(e.target.value) || 5;
                      setBulletCounts(newCounts);
                    }}
                    className={styles.input}
                    style={{ width: '80px' }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className={styles.section}>
        <h3>Job Role</h3>
        <input
          type="text"
          value={jobRole}
          onChange={e => {
            setJobRole(e.target.value);
            onUpdateSharedData({ ...sharedData, jobRole: e.target.value });
          }}
          placeholder="e.g., Software Engineer, Data Analyst, Product Manager..."
          className={styles.input}
        />
      </div>

      <div className={styles.section}>
        <h3>Job Requirements</h3>
        <textarea
          value={jobRequirements}
          onChange={e => {
            setJobRequirements(e.target.value);
            onUpdateSharedData({ ...sharedData, jobRequirements: e.target.value });
          }}
          placeholder="Paste the job description and requirements here..."
          rows={8}
          className={styles.textarea}
        />
      </div>

      <div className={styles.section}>
        <h3>Side Prompt (Optional)</h3>
        <input
          type="text"
          value={sidePrompt}
          onChange={e => setSidePrompt(e.target.value)}
          placeholder="Any additional instructions or focus areas..."
          className={styles.input}
        />
      </div>

      <div className={styles.buttonGroup}>
        <button
          onClick={handleSkip}
          disabled={experiences.length === 0 || isGenerating}
          className={styles.skipButton}
        >
          ⏭️ Skip
        </button>
        <button
          onClick={handleGenerate}
          disabled={isGenerating || experiences.length === 0}
          className={styles.generateButton}
        >
          {isGenerating ? '⏳ Generating...' : '✨ Generate'}
        </button>
      </div>

      {hasGenerated && (
        <>
          <div className={styles.output}>
            <h3>Generated Experience</h3>
            {isEditing && editingExperience ? (
              <div className={styles.editContainer}>
                <h4>Editing: {editingExperience.companyName}</h4>
                <div className={styles.section} style={{ marginTop: '1rem' }}>
                  <label className={styles.pointsLabel}>Company Name:</label>
                  <input
                    type="text"
                    value={editingExperience.companyName}
                    onChange={(e) => setEditingExperience({
                      ...editingExperience,
                      companyName: e.target.value
                    })}
                    className={styles.input}
                  />
                </div>
                <div className={styles.section} style={{ marginTop: '1rem' }}>
                  <label className={styles.pointsLabel}>Experience Points:</label>
                  {editingExperience.newExperience.map((point, pointIndex) => (
                    <div key={pointIndex} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'flex-start' }}>
                      <textarea
                        value={point}
                        onChange={(e) => handleUpdateExperiencePoint(pointIndex, e.target.value)}
                        className={styles.textarea}
                        rows={2}
                        style={{ flex: 1 }}
                      />
                      <button
                        onClick={() => handleRemoveExperiencePoint(pointIndex)}
                        className={styles.deleteButton}
                        style={{ padding: '0.5rem', marginTop: '0.25rem' }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={handleAddExperiencePoint}
                    className={styles.addButton}
                    style={{ marginTop: '0.5rem' }}
                  >
                    + Add Experience Point
                  </button>
                </div>
                <div className={styles.editActions}>
                  <button onClick={handleSaveEdit} className={styles.saveButton}>
                    Save
                  </button>
                  <button onClick={handleCancelEdit} className={styles.cancelButton}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              generatedExperiences.map((exp, index) => (
                <div key={index} className={styles.companySection}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h4 className={styles.companyName}>Company: {exp.companyName}</h4>
                    <button
                      onClick={() => handleEdit(index)}
                      className={styles.editButton}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                    >
                      ✏️ Edit
                    </button>
                  </div>
                  <div className={styles.experiencePoints}>
                    <p className={styles.pointsLabel}>New Experience:</p>
                    <ul className={styles.bulletList}>
                      {exp.newExperience.map((point, pointIndex) => (
                        <li key={pointIndex}>{point}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))
            )}
          </div>
          {!isEditing && (
            <button onClick={handleNext} className={styles.nextButton}>
              Continue to Next Step →
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default ExperienceGenerator;
