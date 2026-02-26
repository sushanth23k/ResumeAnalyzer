import React, { useState, useEffect } from 'react';
import {
  basicInfoApi, academicsApi, achievementsApi,
  AcademicData, AchievementData, BasicInfoData,
} from '../../services/api';
import styles from './BasicInfo.module.css';

const BasicInfo: React.FC = () => {
  const [isEditing, setIsEditing]         = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSaving, setIsSaving]           = useState(false);
  const [error, setError]                 = useState<string | null>(null);

  const [basicInfo, setBasicInfo] = useState<BasicInfoData>({
    fullName: '', phoneNumber: '', email: '',
    linkedinUrl: '', githubUrl: '', address: '',
  });
  const [academics, setAcademics]       = useState<AcademicData[]>([]);
  const [achievements, setAchievements] = useState<AchievementData[]>([]);

  useEffect(() => { loadAllData(); }, []);

  const loadAllData = async () => {
    try {
      setInitialLoading(true);
      setError(null);
      const [basicData, academicsData, achievementsData] = await Promise.all([
        basicInfoApi.get(),
        academicsApi.getAll(),
        achievementsApi.getAll(),
      ]);
      if (basicData) setBasicInfo(basicData);
      setAcademics(academicsData);
      setAchievements(achievementsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleBasicInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBasicInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleAcademicChange = (i: number, field: keyof AcademicData, value: string) => {
    setAcademics(prev => { const u = [...prev]; u[i] = { ...u[i], [field]: value }; return u; });
  };

  const addAcademic = () =>
    setAcademics(prev => [...prev, { collegeName: '', graduationDate: '', course: '', displayOrder: prev.length }]);

  const removeAcademic = (i: number) =>
    setAcademics(prev => prev.filter((_, idx) => idx !== i));

  const handleAchievementChange = (i: number, value: string) =>
    setAchievements(prev => { const u = [...prev]; u[i] = { ...u[i], achievementPoint: value }; return u; });

  const addAchievement = () =>
    setAchievements(prev => [...prev, { achievementPoint: '', displayOrder: prev.length }]);

  const removeAchievement = (i: number) =>
    setAchievements(prev => prev.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await basicInfoApi.save(basicInfo);

      const existingAcademicIds = academics.filter(a => a.id).map(a => a.id);
      const origAcademics = await academicsApi.getAll();
      for (const o of origAcademics) {
        if (o.id && !existingAcademicIds.includes(o.id)) await academicsApi.delete(o.id);
      }
      for (const a of academics) {
        if (a.id) { await academicsApi.update(a.id, a); }
        else { const c = await academicsApi.create(a); a.id = c.id; }
      }

      const existingAchievementIds = achievements.filter(a => a.id).map(a => a.id);
      const origAchievements = await achievementsApi.getAll();
      for (const o of origAchievements) {
        if (o.id && !existingAchievementIds.includes(o.id)) await achievementsApi.delete(o.id);
      }
      for (const a of achievements) {
        if (a.id) { await achievementsApi.update(a.id, a); }
        else { const c = await achievementsApi.create(a); a.id = c.id; }
      }

      await loadAllData();
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save data');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => { loadAllData(); setIsEditing(false); };

  // Stats
  const filledFields = [
    basicInfo.fullName, basicInfo.phoneNumber, basicInfo.email,
    basicInfo.linkedinUrl, basicInfo.githubUrl, basicInfo.address,
  ].filter(Boolean).length;
  const profilePct = Math.round((filledFields / 6) * 100);

  if (initialLoading) {
    return (
      <div className={styles.loadingState}>
        <span className={styles.loadSpinner} />
        Loading profile data…
      </div>
    );
  }

  return (
    <div className={styles.basicInfo}>

      {/* ── Dismissible Error Banner ── */}
      {error && (
        <div className={styles.errorBanner}>
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className={styles.errorDismiss} aria-label="Dismiss">✕</button>
        </div>
      )}

      {/* ── Page Header ── */}
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Applicant Profile</p>
          <h2 className={styles.pageTitle}>Basic Information</h2>
          <p className={styles.pageSubtitle}>Personal details, education, and key achievements</p>
        </div>
        <div className={styles.headerActions}>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className={styles.editButton}>✏️ Edit</button>
          ) : (
            <>
              <button onClick={handleCancel} className={styles.cancelButton} disabled={isSaving}>Cancel</button>
              <button onClick={handleSave} className={styles.saveButton} disabled={isSaving}>
                {isSaving ? <><span className={styles.btnSpinner} />Saving…</> : '💾 Save'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Stats Strip ── */}
      <div className={styles.statsStrip}>
        <div className={`${styles.statCard} ${styles.statPrimary}`}>
          <span className={styles.statIcon}>👤</span>
          <span className={styles.statValue}>{profilePct}%</span>
          <span className={styles.statLabel}>Profile</span>
        </div>
        <div className={`${styles.statCard} ${styles.statSecondary}`}>
          <span className={styles.statIcon}>🎓</span>
          <span className={styles.statValue}>{academics.length}</span>
          <span className={styles.statLabel}>Academics</span>
        </div>
        <div className={`${styles.statCard} ${styles.statAccent}`}>
          <span className={styles.statIcon}>🏆</span>
          <span className={styles.statValue}>{achievements.length}</span>
          <span className={styles.statLabel}>Achievements</span>
        </div>
      </div>

      {/* ══════════ PERSONAL DETAILS ══════════ */}
      <div className={styles.section}>
        <p className={styles.sectionEyebrow}>Step 1 of 3</p>
        <h3 className={styles.sectionTitle}>Personal Details</h3>
        <div className={styles.formGrid}>
          {[
            { label: 'Full Name',    name: 'fullName'     as keyof BasicInfoData, type: 'text',  ph: '' },
            { label: 'Phone Number', name: 'phoneNumber'  as keyof BasicInfoData, type: 'tel',   ph: '' },
            { label: 'Email',        name: 'email'        as keyof BasicInfoData, type: 'email', ph: '' },
            { label: 'LinkedIn URL', name: 'linkedinUrl'  as keyof BasicInfoData, type: 'url',   ph: 'https://linkedin.com/in/…' },
            { label: 'GitHub URL',   name: 'githubUrl'    as keyof BasicInfoData, type: 'url',   ph: 'https://github.com/…' },
            { label: 'Address',      name: 'address'      as keyof BasicInfoData, type: 'text',  ph: '' },
          ].map(f => (
            <div key={f.name} className={styles.field}>
              <label>{f.label}</label>
              {isEditing ? (
                <input
                  type={f.type}
                  name={f.name}
                  value={basicInfo[f.name]}
                  onChange={handleBasicInfoChange}
                  placeholder={f.ph}
                />
              ) : (
                <p>{basicInfo[f.name] || <span className={styles.emptyField}>—</span>}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ══════════ ACADEMICS ══════════ */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Step 2 of 3</p>
            <h3 className={styles.sectionTitle}>Academics</h3>
          </div>
          {isEditing && (
            <button onClick={addAcademic} className={styles.addButton}>＋ Add</button>
          )}
        </div>

        {academics.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>🎓</span>
            <p className={styles.emptyText}>
              {isEditing ? 'Click "+ Add" to add your education.' : 'No academics added yet.'}
            </p>
          </div>
        ) : (
          academics.map((academic, index) => (
            <div key={academic.id ?? index} className={styles.listItem}>
              <div className={styles.listItemHeader}>
                <span className={styles.listItemBadge}>{index + 1}</span>
                {isEditing && (
                  <button onClick={() => removeAcademic(index)} className={styles.removeButton}>
                    ✕ Remove
                  </button>
                )}
              </div>
              <div className={styles.formGrid}>
                {[
                  { label: 'College Name', field: 'collegeName' as keyof AcademicData, type: 'text', ph: '' },
                  { label: 'Graduation Date', field: 'graduationDate' as keyof AcademicData, type: 'text', ph: 'e.g. May 2024' },
                  { label: 'Course', field: 'course' as keyof AcademicData, type: 'text', ph: '' },
                ].map(f => (
                  <div key={f.field} className={styles.field}>
                    <label>{f.label}</label>
                    {isEditing ? (
                      <input
                        type={f.type}
                        value={String(academic[f.field] ?? '')}
                        onChange={e => handleAcademicChange(index, f.field, e.target.value)}
                        placeholder={f.ph}
                      />
                    ) : (
                      <p>{String(academic[f.field] ?? '—')}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ══════════ ACHIEVEMENTS ══════════ */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Step 3 of 3</p>
            <h3 className={styles.sectionTitle}>Achievements</h3>
          </div>
          {isEditing && (
            <button onClick={addAchievement} className={styles.addButton}>＋ Add</button>
          )}
        </div>

        {achievements.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>🏆</span>
            <p className={styles.emptyText}>
              {isEditing ? 'Click "+ Add" to list your achievements.' : 'No achievements added yet.'}
            </p>
          </div>
        ) : (
          <ul className={styles.achievementList}>
            {achievements.map((a, i) => (
              <li key={a.id ?? i} className={styles.achievementItem}>
                {isEditing ? (
                  <div className={styles.achievementEdit}>
                    <input
                      type="text"
                      value={a.achievementPoint}
                      onChange={e => handleAchievementChange(i, e.target.value)}
                      placeholder="e.g. Won national hackathon 2024"
                    />
                    <button onClick={() => removeAchievement(i)} className={styles.removeSmall} title="Remove">✕</button>
                  </div>
                ) : (
                  <span>{a.achievementPoint}</span>
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
