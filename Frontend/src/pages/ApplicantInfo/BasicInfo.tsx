import React, { useState, useEffect } from 'react';
import { basicInfoApi, academicsApi, achievementsApi, AcademicData, AchievementData, BasicInfoData } from '../../services/api';
import styles from './BasicInfo.module.css';

const BasicInfo: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Basic info state
  const [basicInfo, setBasicInfo] = useState<BasicInfoData>({
    fullName: '',
    phoneNumber: '',
    email: '',
    linkedinUrl: '',
    githubUrl: '',
    address: '',
  });
  
  // Academics state
  const [academics, setAcademics] = useState<AcademicData[]>([]);
  
  // Achievements state
  const [achievements, setAchievements] = useState<AchievementData[]>([]);

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load basic info
      const basicData = await basicInfoApi.get();
      if (basicData) {
        setBasicInfo(basicData);
      }
      
      // Load academics
      const academicsData = await academicsApi.getAll();
      setAcademics(academicsData);
      
      // Load achievements
      const achievementsData = await achievementsApi.getAll();
      setAchievements(achievementsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBasicInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBasicInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleAcademicChange = (index: number, field: keyof AcademicData, value: string) => {
    const updated = [...academics];
    updated[index] = { ...updated[index], [field]: value };
    setAcademics(updated);
  };

  const addAcademic = () => {
    setAcademics(prev => [
      ...prev,
      { collegeName: '', graduationDate: '', course: '', displayOrder: prev.length },
    ]);
  };

  const removeAcademic = (index: number) => {
    setAcademics(prev => prev.filter((_, i) => i !== index));
  };

  const handleAchievementChange = (index: number, value: string) => {
    const updated = [...achievements];
    updated[index] = { ...updated[index], achievementPoint: value };
    setAchievements(updated);
  };

  const addAchievement = () => {
    setAchievements(prev => [
      ...prev,
      { achievementPoint: '', displayOrder: prev.length },
    ]);
  };

  const removeAchievement = (index: number) => {
    setAchievements(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      setError(null);
      setLoading(true);
      
      // Save basic info
      await basicInfoApi.save(basicInfo);
      
      // Save academics - delete removed ones, update existing, create new
      const existingAcademicIds = academics.filter(a => a.id).map(a => a.id);
      
      // Delete academics that were removed
      const originalAcademics = await academicsApi.getAll();
      for (const original of originalAcademics) {
        if (original.id && !existingAcademicIds.includes(original.id)) {
          await academicsApi.delete(original.id);
        }
      }
      
      // Create or update academics
      for (const academic of academics) {
        if (academic.id) {
          await academicsApi.update(academic.id, academic);
        } else {
          const created = await academicsApi.create(academic);
          academic.id = created.id;
        }
      }
      
      // Save achievements - delete removed ones, update existing, create new
      const existingAchievementIds = achievements.filter(a => a.id).map(a => a.id);
      
      // Delete achievements that were removed
      const originalAchievements = await achievementsApi.getAll();
      for (const original of originalAchievements) {
        if (original.id && !existingAchievementIds.includes(original.id)) {
          await achievementsApi.delete(original.id);
        }
      }
      
      // Create or update achievements
      for (const achievement of achievements) {
        if (achievement.id) {
          await achievementsApi.update(achievement.id, achievement);
        } else {
          const created = await achievementsApi.create(achievement);
          achievement.id = created.id;
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
      <div className={styles.basicInfo}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.basicInfo}>
      {error && (
        <div className={styles.error}>
          <p>⚠️ {error}</p>
          <button onClick={loadAllData} className={styles.retryButton}>
            Retry
          </button>
        </div>
      )}
      
      <div className={styles.header}>
        <h2>Basic Information</h2>
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
        <h3>Personal Details</h3>
        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label>Full Name *</label>
            {isEditing ? (
              <input
                type="text"
                name="fullName"
                value={basicInfo.fullName}
                onChange={handleBasicInfoChange}
                required
              />
            ) : (
              <p>{basicInfo.fullName || '-'}</p>
            )}
          </div>

          <div className={styles.field}>
            <label>Phone Number *</label>
            {isEditing ? (
              <input
                type="tel"
                name="phoneNumber"
                value={basicInfo.phoneNumber}
                onChange={handleBasicInfoChange}
                required
              />
            ) : (
              <p>{basicInfo.phoneNumber || '-'}</p>
            )}
          </div>

          <div className={styles.field}>
            <label>Email *</label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={basicInfo.email}
                onChange={handleBasicInfoChange}
                required
              />
            ) : (
              <p>{basicInfo.email || '-'}</p>
            )}
          </div>

          <div className={styles.field}>
            <label>LinkedIn URL *</label>
            {isEditing ? (
              <input
                type="url"
                name="linkedinUrl"
                value={basicInfo.linkedinUrl}
                onChange={handleBasicInfoChange}
                placeholder="https://linkedin.com/in/yourprofile"
                required
              />
            ) : (
              <p>{basicInfo.linkedinUrl || '-'}</p>
            )}
          </div>

          <div className={styles.field}>
            <label>GitHub URL *</label>
            {isEditing ? (
              <input
                type="url"
                name="githubUrl"
                value={basicInfo.githubUrl}
                onChange={handleBasicInfoChange}
                placeholder="https://github.com/yourusername"
                required
              />
            ) : (
              <p>{basicInfo.githubUrl || '-'}</p>
            )}
          </div>

          <div className={styles.field}>
            <label>Address *</label>
            {isEditing ? (
              <input
                type="text"
                name="address"
                value={basicInfo.address}
                onChange={handleBasicInfoChange}
                required
              />
            ) : (
              <p>{basicInfo.address || '-'}</p>
            )}
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>Academics</h3>
          {isEditing && (
            <button onClick={addAcademic} className={styles.addButton}>
              + Add Academic
            </button>
          )}
        </div>
        {academics.length === 0 ? (
          <p className={styles.empty}>No academics added yet</p>
        ) : (
          academics.map((academic, index) => (
            <div key={academic.id || index} className={styles.listItem}>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label>College Name *</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={academic.collegeName}
                      onChange={e => handleAcademicChange(index, 'collegeName', e.target.value)}
                      required
                    />
                  ) : (
                    <p>{academic.collegeName}</p>
                  )}
                </div>

                <div className={styles.field}>
                  <label>Graduation Date *</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={academic.graduationDate}
                      onChange={e => handleAcademicChange(index, 'graduationDate', e.target.value)}
                      placeholder="e.g., May 2024"
                      required
                    />
                  ) : (
                    <p>{academic.graduationDate}</p>
                  )}
                </div>

                <div className={styles.field}>
                  <label>Course *</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={academic.course}
                      onChange={e => handleAcademicChange(index, 'course', e.target.value)}
                      required
                    />
                  ) : (
                    <p>{academic.course}</p>
                  )}
                </div>
              </div>
              {isEditing && (
                <button
                  onClick={() => removeAcademic(index)}
                  className={styles.removeButton}
                >
                  Remove
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>Achievements</h3>
          {isEditing && (
            <button onClick={addAchievement} className={styles.addButton}>
              + Add Achievement
            </button>
          )}
        </div>
        {achievements.length === 0 ? (
          <p className={styles.empty}>No achievements added yet</p>
        ) : (
          <ul className={styles.achievementList}>
            {achievements.map((achievement, index) => (
              <li key={achievement.id || index} className={styles.achievementItem}>
                {isEditing ? (
                  <div className={styles.achievementEdit}>
                    <input
                      type="text"
                      value={achievement.achievementPoint}
                      onChange={e => handleAchievementChange(index, e.target.value)}
                      placeholder="Achievement description"
                      required
                    />
                    <button
                      onClick={() => removeAchievement(index)}
                      className={styles.removeButton}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <span>{achievement.achievementPoint}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default BasicInfo;
