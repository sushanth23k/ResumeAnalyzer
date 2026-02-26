import React, { useState, useEffect } from 'react';
import { experiencesApi, ExperienceData } from '../../services/api';
import styles from './Experiences.module.css';

const BLANK_EXP = (): ExperienceData => ({
  id: '', experienceName: '', startDate: '', endDate: '',
  role: '', location: '', experienceExplanation: '', displayOrder: 0,
});

const Experiences: React.FC = () => {
  const [isEditing, setIsEditing]           = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSaving, setIsSaving]             = useState(false);
  const [error, setError]                   = useState<string | null>(null);
  const [experiences, setExperiences]       = useState<ExperienceData[]>([]);
  const [confirmRemoveIdx, setConfirmRemoveIdx] = useState<number | null>(null);

  useEffect(() => { loadAllData(); }, []);

  const loadAllData = async () => {
    try {
      setInitialLoading(true);
      setError(null);
      const data = await experiencesApi.getAll();
      setExperiences(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load experiences');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (i: number, field: keyof ExperienceData, value: string) =>
    setExperiences(prev => { const u = [...prev]; u[i] = { ...u[i], [field]: value }; return u; });

  const addExperience = () =>
    setExperiences(prev => [...prev, { ...BLANK_EXP(), displayOrder: prev.length }]);

  const removeExperience = (i: number) => {
    setExperiences(prev => prev.filter((_, idx) => idx !== i));
    setConfirmRemoveIdx(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const existingIds = experiences.filter(e => e.id).map(e => e.id);
      const originals = await experiencesApi.getAll();
      for (const o of originals) {
        if (o.id && !existingIds.includes(o.id)) await experiencesApi.delete(o.id);
      }
      for (const exp of experiences) {
        const payload = {
          experienceName: exp.experienceName, startDate: exp.startDate,
          endDate: exp.endDate, role: exp.role, location: exp.location,
          experienceExplanation: exp.experienceExplanation,
        };
        if (exp.id) {
          await experiencesApi.update(exp.id, payload);
        } else {
          const c = await experiencesApi.create({ ...payload, displayOrder: exp.displayOrder });
          exp.id = c.id;
        }
      }
      await loadAllData();
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save experiences');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => { loadAllData(); setIsEditing(false); };

  if (initialLoading) {
    return (
      <div className={styles.loadingState}>
        <span className={styles.loadSpinner} />
        Loading experiences…
      </div>
    );
  }

  return (
    <div className={styles.experiences}>

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
          <h2 className={styles.pageTitle}>Work Experiences</h2>
          <p className={styles.pageSubtitle}>Roles, responsibilities, and durations used in resume generation</p>
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
          <span className={styles.statIcon}>🎯</span>
          <span className={styles.statValue}>{experiences.length}</span>
          <span className={styles.statLabel}>Experiences</span>
        </div>
        <div className={`${styles.statCard} ${styles.statSecondary}`}>
          <span className={styles.statIcon}>⏱</span>
          <span className={styles.statValue}>
            {experiences.filter(e => e.endDate?.toLowerCase() === 'present' || e.endDate === '').length}
          </span>
          <span className={styles.statLabel}>Current</span>
        </div>
        <div className={`${styles.statCard} ${styles.statAccent}`}>
          <span className={styles.statIcon}>📍</span>
          <span className={styles.statValue}>
            {experiences.filter(e => e.location).length}
          </span>
          <span className={styles.statLabel}>With Location</span>
        </div>
      </div>

      {/* ── Add button (editing mode) ── */}
      {isEditing && (
        <button onClick={addExperience} className={styles.addExperienceBtn}>
          ＋ Add Experience
        </button>
      )}

      {/* ── Empty State ── */}
      {experiences.length === 0 && (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🎯</span>
          <h3 className={styles.emptyTitle}>No experiences yet</h3>
          <p className={styles.emptyText}>
            {isEditing
              ? 'Click "+ Add Experience" to add your first role.'
              : 'Click Edit to start adding your work history.'}
          </p>
        </div>
      )}

      {/* ── Experience Cards ── */}
      {experiences.map((exp, i) => (
        <div key={exp.id ?? i} className={styles.expCard}>

          {/* Card Header */}
          <div className={styles.expCardHeader}>
            <div className={styles.expCardMeta}>
              <div className={styles.expAvatar}>
                {(exp.experienceName || 'E')[0].toUpperCase()}
              </div>
              <div>
                <p className={styles.expName}>{exp.experienceName || 'New Experience'}</p>
                <p className={styles.expRole}>
                  {[exp.role, exp.location].filter(Boolean).join(' · ') || 'Add details below'}
                </p>
              </div>
            </div>
            {exp.startDate && (
              <span className={styles.expDateBadge}>
                {exp.startDate} → {exp.endDate || 'present'}
              </span>
            )}
            {isEditing && (
              confirmRemoveIdx === i ? (
                <div className={styles.confirmDelete}>
                  <span className={styles.confirmText}>Remove?</span>
                  <button className={styles.confirmYes} onClick={() => removeExperience(i)}>Yes</button>
                  <button className={styles.confirmNo} onClick={() => setConfirmRemoveIdx(null)}>No</button>
                </div>
              ) : (
                <button className={styles.removeBtn} onClick={() => setConfirmRemoveIdx(i)} title="Remove">🗑️</button>
              )
            )}
          </div>

          {/* Fields */}
          <div className={styles.formGrid}>
            {[
              { label: 'Company / Org Name', field: 'experienceName' as keyof ExperienceData, type: 'text', ph: '' },
              { label: 'Start Date',         field: 'startDate'       as keyof ExperienceData, type: 'text', ph: 'e.g. Jan 2022' },
              { label: 'End Date',           field: 'endDate'         as keyof ExperienceData, type: 'text', ph: 'e.g. Dec 2023 or present' },
              { label: 'Role / Title',       field: 'role'            as keyof ExperienceData, type: 'text', ph: 'e.g. Software Engineer' },
              { label: 'Location',           field: 'location'        as keyof ExperienceData, type: 'text', ph: 'e.g. San Francisco, CA' },
            ].map(f => (
              <div key={f.field} className={styles.field}>
                <label>{f.label}</label>
                {isEditing ? (
                  <input
                    type={f.type}
                    value={String(exp[f.field] ?? '')}
                    onChange={e => handleChange(i, f.field, e.target.value)}
                    placeholder={f.ph}
                  />
                ) : (
                  <p>{String(exp[f.field] ?? '') || <span className={styles.emptyField}>—</span>}</p>
                )}
              </div>
            ))}
          </div>

          <div className={styles.field} style={{ marginTop: 'var(--space-4)' }}>
            <label>Experience Description</label>
            {isEditing ? (
              <textarea
                value={exp.experienceExplanation}
                onChange={e => handleChange(i, 'experienceExplanation', e.target.value)}
                rows={6}
                placeholder="Describe your key responsibilities and achievements…"
              />
            ) : (
              <p className={styles.explanation}>{exp.experienceExplanation || <span className={styles.emptyField}>—</span>}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Experiences;
