import React, { useState, useEffect } from 'react';
import { experiencesApi, ExperienceData } from '../../services/api';
import styles from './Experiences.module.css';

const Experiences: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Experiences state
  const [experiences, setExperiences] = useState<ExperienceData[]>([]);

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load experiences
      const experiencesData = await experiencesApi.getAll();
      setExperiences(experiencesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExperienceChange = (index: number, field: keyof ExperienceData, value: string) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    setExperiences(updated);
  };

  const addExperience = () => {
    setExperiences(prev => [
      ...prev,
      {
        id: '',
        experienceName: '',
        startDate: '',
        endDate: '',
        role: '',
        location: '',
        experienceExplanation: '',
        displayOrder: prev.length,
      },
    ]);
  };

  const removeExperience = (index: number) => {
    setExperiences(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      setError(null);
      setLoading(true);
      
      // Save experiences - delete removed ones, update existing, create new
      const existingExperienceIds = experiences.filter(e => e.id).map(e => e.id);
      
      // Delete experiences that were removed
      const originalExperiences = await experiencesApi.getAll();
      for (const original of originalExperiences) {
        if (original.id && !existingExperienceIds.includes(original.id)) {
          await experiencesApi.delete(original.id);
        }
      }
      
      // Create or update experiences
      for (const experience of experiences) {
        if (experience.id) {
          await experiencesApi.update(experience.id, {
            experienceName: experience.experienceName,
            startDate: experience.startDate,
            endDate: experience.endDate,
            role: experience.role,
            location: experience.location,
            experienceExplanation: experience.experienceExplanation,
          });
        } else {
          const created = await experiencesApi.create({
            experienceName: experience.experienceName,
            startDate: experience.startDate,
            endDate: experience.endDate,
            role: experience.role,
            location: experience.location,
            experienceExplanation: experience.experienceExplanation,
            displayOrder: experience.displayOrder,
          });
          experience.id = created.id;
        }
      }
      
      // Reload data to ensure consistency
      await loadAllData();
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save data');
      console.error('Error saving data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    loadAllData();
    setIsEditing(false);
  };

  if (loading && !isEditing) {
    return (
      <div className={styles.experiences}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.experiences}>
      {error && (
        <div className={styles.error}>
          <p>⚠️ {error}</p>
          <button onClick={loadAllData} className={styles.retryButton}>
            Retry
          </button>
        </div>
      )}
      
      <div className={styles.header}>
        <h2>Experiences</h2>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} className={styles.editButton}>
            ✏️ Edit
          </button>
        ) : (
          <div className={styles.actions}>
            <button onClick={handleSave} className={styles.saveButton} disabled={loading}>
              💾 {loading ? 'Saving...' : 'Save'}
            </button>
            <button onClick={handleCancel} className={styles.cancelButton} disabled={loading}>
              ❌ Cancel
            </button>
          </div>
        )}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          {isEditing && (
            <button onClick={addExperience} className={styles.addButton}>
              + Add Experience
            </button>
          )}
        </div>

        {experiences.length === 0 ? (
          <p className={styles.empty}>No experiences added yet</p>
        ) : (
          experiences.map((experience, index) => (
            <div key={experience.id || index} className={styles.experienceCard}>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label>Experience Name *</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={experience.experienceName}
                      onChange={e =>
                        handleExperienceChange(index, 'experienceName', e.target.value)
                      }
                      required
                    />
                  ) : (
                    <h4>{experience.experienceName}</h4>
                  )}
                </div>

                <div className={styles.field}>
                  <label>Start Date *</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={experience.startDate}
                      onChange={e => handleExperienceChange(index, 'startDate', e.target.value)}
                      placeholder="e.g., Jan 2020"
                      required
                    />
                  ) : (
                    <p>{experience.startDate}</p>
                  )}
                </div>

                <div className={styles.field}>
                  <label>End Date * (or 'present')</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={experience.endDate}
                      onChange={e => handleExperienceChange(index, 'endDate', e.target.value)}
                      placeholder="e.g., Dec 2022 or present"
                      required
                    />
                  ) : (
                    <p>{experience.endDate}</p>
                  )}
                </div>

                <div className={styles.field}>
                  <label>Role</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={experience.role}
                      onChange={e => handleExperienceChange(index, 'role', e.target.value)}
                      placeholder="Optional"
                    />
                  ) : (
                    <p>{experience.role || '-'}</p>
                  )}
                </div>

                <div className={styles.field}>
                  <label>Location</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={experience.location || ''}
                      onChange={e => handleExperienceChange(index, 'location', e.target.value)}
                      placeholder="e.g., San Francisco, CA or Remote"
                    />
                  ) : (
                    <p>{experience.location || '-'}</p>
                  )}
                </div>
              </div>

              <div className={styles.field}>
                <label>Experience Explanation *</label>
                {isEditing ? (
                  <textarea
                    value={experience.experienceExplanation}
                    onChange={e =>
                      handleExperienceChange(index, 'experienceExplanation', e.target.value)
                    }
                    rows={15}
                    required
                  />
                ) : (
                  <p className={styles.explanation}>{experience.experienceExplanation}</p>
                )}
              </div>

              {isEditing && (
                <button onClick={() => removeExperience(index)} className={styles.removeButton}>
                  Remove Experience
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Experiences;
