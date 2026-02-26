import React, { useState, useEffect } from 'react';
import { projectsApi, skillsApi, ProjectData, SkillData } from '../../services/api';
import styles from './ProjectsAndSkills.module.css';

interface ConfirmDeleteCategory {
  name: string;
  count: number;
}

const ProjectsAndSkills: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [opLoading, setOpLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Projects
  const [isEditingProjects, setIsEditingProjects] = useState(false);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [allSkills, setAllSkills] = useState<SkillData[]>([]); // for project skill picker

  // User skills (grouped by category)
  const [userSkills, setUserSkills] = useState<SkillData[]>([]);

  // Adding a skill inline inside a category card
  const [addingSkillToCategory, setAddingSkillToCategory] = useState<string | null>(null);
  const [newSkillInput, setNewSkillInput] = useState('');

  // Adding a new category
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  // Categories that have been named but have no skills yet
  const [pendingCategories, setPendingCategories] = useState<string[]>([]);

  // Confirm-delete modal for a whole category
  const [confirmDeleteCategory, setConfirmDeleteCategory] = useState<ConfirmDeleteCategory | null>(null);

  useEffect(() => {
    loadAll();
  }, []);

  // ─── Data loading ────────────────────────────────────────────────────────────

  const loadAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const [proj, us, all] = await Promise.all([
        projectsApi.getAll(),
        skillsApi.getUserSkills(),
        skillsApi.getAll(),
      ]);
      setProjects(proj);
      setUserSkills(us);
      setAllSkills(all);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const reloadSkills = async () => {
    const [us, all] = await Promise.all([
      skillsApi.getUserSkills(),
      skillsApi.getAll(),
    ]);
    setUserSkills(us);
    setAllSkills(all);
  };

  // ─── Skill handlers ───────────────────────────────────────────────────────────

  const handleAddSkill = async (category: string) => {
    const name = newSkillInput.trim();
    if (!name) return;
    setOpLoading(true);
    setError(null);
    try {
      const created = await skillsApi.create(name, category);
      await skillsApi.addUserSkills([created.id]);
      setPendingCategories(prev => prev.filter(c => c !== category));
      setAddingSkillToCategory(null);
      setNewSkillInput('');
      await reloadSkills();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add skill');
    } finally {
      setOpLoading(false);
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    setOpLoading(true);
    setError(null);
    try {
      await skillsApi.delete(skillId);
      await reloadSkills();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete skill');
    } finally {
      setOpLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!confirmDeleteCategory) return;
    setOpLoading(true);
    setError(null);
    try {
      if (confirmDeleteCategory.count > 0) {
        await skillsApi.deleteCategory(confirmDeleteCategory.name);
      }
      setPendingCategories(prev => prev.filter(c => c !== confirmDeleteCategory.name));
      setConfirmDeleteCategory(null);
      await reloadSkills();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete category');
      setConfirmDeleteCategory(null);
    } finally {
      setOpLoading(false);
    }
  };

  const handleStartAddCategory = () => {
    setAddingCategory(true);
    setNewCategoryInput('');
  };

  const handleConfirmNewCategory = () => {
    const name = newCategoryInput.trim();
    if (!name) return;
    if (!groupedSkills[name] && !pendingCategories.includes(name)) {
      setPendingCategories(prev => [...prev, name]);
    }
    setAddingCategory(false);
    setNewCategoryInput('');
    // Immediately open the "add skill" input for the new category
    setAddingSkillToCategory(name);
    setNewSkillInput('');
  };

  // ─── Project handlers ─────────────────────────────────────────────────────────

  const handleProjectChange = (index: number, field: 'projectName' | 'projectInfo', value: string) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    setProjects(updated);
  };

  const addProjectSkill = (projectIndex: number, skillId: string) => {
    const skill = allSkills.find(s => s.id === skillId);
    if (skill && !projects[projectIndex].skills.some(s => s.id === skillId)) {
      const updated = [...projects];
      updated[projectIndex].skills = [...updated[projectIndex].skills, skill];
      setProjects(updated);
    }
  };

  const removeProjectSkill = (projectIndex: number, skillId: string) => {
    const updated = [...projects];
    updated[projectIndex].skills = updated[projectIndex].skills.filter(s => s.id !== skillId);
    setProjects(updated);
  };

  const addProject = () => {
    setProjects(prev => [
      ...prev,
      { id: '', projectName: '', projectInfo: '', skills: [], displayOrder: prev.length },
    ]);
  };

  const removeProject = (index: number) => {
    setProjects(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveProjects = async () => {
    setOpLoading(true);
    setError(null);
    try {
      const existingIds = projects.filter(p => p.id).map(p => p.id);
      const originals = await projectsApi.getAll();
      for (const orig of originals) {
        if (orig.id && !existingIds.includes(orig.id)) {
          await projectsApi.delete(orig.id);
        }
      }
      for (const project of projects) {
        const skillIds = project.skills.map(s => s.id);
        if (project.id) {
          await projectsApi.update(project.id, {
            projectName: project.projectName,
            projectInfo: project.projectInfo,
            skillIds,
          });
        } else {
          const created = await projectsApi.create({
            projectName: project.projectName,
            projectInfo: project.projectInfo,
            skillIds,
            displayOrder: project.displayOrder,
          });
          project.id = created.id;
        }
      }
      await loadAll();
      setIsEditingProjects(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save projects');
    } finally {
      setOpLoading(false);
    }
  };

  const handleCancelProjects = () => {
    loadAll();
    setIsEditingProjects(false);
  };

  // ─── Derived state ─────────────────────────────────────────────────────────────

  const groupedSkills = userSkills.reduce<Record<string, SkillData[]>>((acc, skill) => {
    const cat = skill.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  const allCategories = [
    ...Object.keys(groupedSkills),
    ...pendingCategories.filter(c => !groupedSkills[c]),
  ];

  const totalSkills = userSkills.length;
  const totalCategories = Object.keys(groupedSkills).length + pendingCategories.filter(c => !groupedSkills[c]).length;

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* ── Error banner ── */}
      {error && (
        <div className={styles.errorBanner}>
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className={styles.errorDismiss}>✕</button>
        </div>
      )}

      {/* ── Page Header ── */}
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Applicant Profile</p>
          <h2 className={styles.pageTitle}>Projects & Skills</h2>
          <p className={styles.pageSubtitle}>Portfolio projects and skill categories used in resume generation</p>
        </div>
      </div>

      {/* ── Stats Strip ── */}
      <div className={styles.statsStrip}>
        <div className={`${styles.statCard} ${styles.statPrimary}`}>
          <span className={styles.statIcon}>💼</span>
          <span className={styles.statValue}>{projects.length}</span>
          <span className={styles.statLabel}>Projects</span>
        </div>
        <div className={`${styles.statCard} ${styles.statSecondary}`}>
          <span className={styles.statIcon}>⚡</span>
          <span className={styles.statValue}>{totalSkills}</span>
          <span className={styles.statLabel}>Skills</span>
        </div>
        <div className={`${styles.statCard} ${styles.statAccent}`}>
          <span className={styles.statIcon}>🏷️</span>
          <span className={styles.statValue}>{totalCategories}</span>
          <span className={styles.statLabel}>Categories</span>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          PROJECTS SECTION
      ════════════════════════════════════════════ */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Section 1 of 2</p>
            <h2 className={styles.sectionTitle}>Projects</h2>
          </div>
          {!isEditingProjects ? (
            <button onClick={() => setIsEditingProjects(true)} className={styles.editButton}>
              ✏️ Edit
            </button>
          ) : (
            <div className={styles.headerActions}>
              <button onClick={handleSaveProjects} className={styles.saveButton} disabled={opLoading}>
                {opLoading ? 'Saving…' : '💾 Save'}
              </button>
              <button onClick={handleCancelProjects} className={styles.cancelButton} disabled={opLoading}>
                ✕ Cancel
              </button>
            </div>
          )}
        </div>

        {isEditingProjects && (
          <button onClick={addProject} className={styles.addProjectButton}>
            + Add Project
          </button>
        )}

        {projects.length === 0 && !isEditingProjects && (
          <div className={styles.emptyState}>No projects added yet.</div>
        )}

        {projects.map((project, index) => (
          <div key={project.id || index} className={styles.projectCard}>
            {isEditingProjects && (
              <button
                onClick={() => removeProject(index)}
                className={styles.projectDeleteBtn}
                title="Remove project"
              >
                🗑
              </button>
            )}

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Project Name</label>
              {isEditingProjects ? (
                <input
                  type="text"
                  value={project.projectName}
                  onChange={e => handleProjectChange(index, 'projectName', e.target.value)}
                  className={styles.fieldInput}
                  placeholder="Project name"
                />
              ) : (
                <h4 className={styles.projectName}>{project.projectName}</h4>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Skills Used</label>
              {isEditingProjects ? (
                <>
                  <select
                    onChange={e => {
                      if (e.target.value) {
                        addProjectSkill(index, e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className={styles.fieldSelect}
                    defaultValue=""
                  >
                    <option value="" disabled>Select a skill…</option>
                    {allSkills
                      .filter(s => !project.skills.some(ps => ps.id === s.id))
                      .map(s => (
                        <option key={s.id} value={s.id}>
                          {s.skillName} ({s.category})
                        </option>
                      ))}
                  </select>
                  <div className={styles.skillTags}>
                    {project.skills.map(skill => (
                      <span key={skill.id} className={styles.skillTag}>
                        {skill.skillName}
                        <button
                          onClick={() => removeProjectSkill(index, skill.id)}
                          className={styles.skillTagRemove}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <div className={styles.skillTags}>
                  {project.skills.length === 0
                    ? <span className={styles.muted}>None</span>
                    : project.skills.map(s => (
                        <span key={s.id} className={styles.skillTag}>{s.skillName}</span>
                      ))}
                </div>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Description</label>
              {isEditingProjects ? (
                <textarea
                  value={project.projectInfo}
                  onChange={e => handleProjectChange(index, 'projectInfo', e.target.value)}
                  rows={6}
                  className={styles.fieldTextarea}
                  placeholder="Describe the project…"
                />
              ) : (
                <p className={styles.fieldText}>{project.projectInfo || '—'}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ════════════════════════════════════════════
          SKILLS SECTION
      ════════════════════════════════════════════ */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Section 2 of 2</p>
            <h2 className={styles.sectionTitle}>Skills</h2>
          </div>
        </div>

        <div className={styles.skillsGrid}>
          {/* ── Category cards ── */}
          {allCategories.map(category => {
            const skills = groupedSkills[category] ?? [];
            const isPending = !groupedSkills[category];
            return (
              <div key={category} className={`${styles.categoryCard} ${isPending ? styles.categoryCardEmpty : ''}`}>
                {/* Card header */}
                <div className={styles.categoryCardHeader}>
                  <span className={styles.categoryName}>{category}</span>
                  <button
                    onClick={() => setConfirmDeleteCategory({ name: category, count: skills.length })}
                    className={styles.deleteCategoryBtn}
                    title="Delete category"
                    disabled={opLoading}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                    </svg>
                  </button>
                </div>

                {/* Skill list */}
                <div className={styles.categoryCardBody}>
                  {skills.length === 0 && (
                    <p className={styles.emptyCategoryHint}>
                      Add your first skill below
                    </p>
                  )}

                  {skills.map(skill => (
                    <div key={skill.id} className={styles.skillRow}>
                      <span className={styles.skillRowName}>{skill.skillName}</span>
                      <button
                        onClick={() => handleDeleteSkill(skill.id)}
                        className={styles.deleteSkillBtn}
                        disabled={opLoading}
                        title="Delete skill"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                        </svg>
                      </button>
                    </div>
                  ))}

                  {/* Inline add-skill form */}
                  {addingSkillToCategory === category ? (
                    <div className={styles.addSkillForm}>
                      <input
                        type="text"
                        value={newSkillInput}
                        onChange={e => setNewSkillInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleAddSkill(category);
                          if (e.key === 'Escape') {
                            setAddingSkillToCategory(null);
                            setNewSkillInput('');
                          }
                        }}
                        placeholder="Skill name…"
                        className={styles.addSkillInput}
                        autoFocus
                        disabled={opLoading}
                      />
                      <div className={styles.addSkillFormActions}>
                        <button
                          onClick={() => handleAddSkill(category)}
                          className={styles.addConfirmBtn}
                          disabled={opLoading || !newSkillInput.trim()}
                        >
                          Add
                        </button>
                        <button
                          onClick={() => { setAddingSkillToCategory(null); setNewSkillInput(''); }}
                          className={styles.addCancelBtn}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setAddingSkillToCategory(category);
                        setNewSkillInput('');
                      }}
                      className={styles.addSkillTrigger}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Add skill
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* ── Add category card / form ── */}
          {addingCategory ? (
            <div className={styles.addCategoryFormCard}>
              <p className={styles.addCategoryFormLabel}>New category name</p>
              <input
                type="text"
                value={newCategoryInput}
                onChange={e => setNewCategoryInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleConfirmNewCategory();
                  if (e.key === 'Escape') { setAddingCategory(false); setNewCategoryInput(''); }
                }}
                placeholder="e.g. Frameworks"
                className={styles.addCategoryInput}
                autoFocus
              />
              <div className={styles.addCategoryFormActions}>
                <button
                  onClick={handleConfirmNewCategory}
                  className={styles.addConfirmBtn}
                  disabled={!newCategoryInput.trim()}
                >
                  Create
                </button>
                <button
                  onClick={() => { setAddingCategory(false); setNewCategoryInput(''); }}
                  className={styles.addCancelBtn}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button onClick={handleStartAddCategory} className={styles.addCategoryCard}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.addCategoryIcon}>
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span className={styles.addCategoryLabel}>Add Category</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Confirm delete category modal ── */}
      {confirmDeleteCategory && (
        <div className={styles.modalOverlay} onClick={() => setConfirmDeleteCategory(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
              </svg>
            </div>
            <h4 className={styles.modalTitle}>Delete Category</h4>
            <p className={styles.modalBody}>
              Are you sure you want to delete{' '}
              <strong>"{confirmDeleteCategory.name}"</strong>?
              {confirmDeleteCategory.count > 0 && (
                <>
                  {' '}This will permanently delete{' '}
                  <strong>
                    {confirmDeleteCategory.count} skill{confirmDeleteCategory.count !== 1 ? 's' : ''}
                  </strong>{' '}
                  from the database.
                </>
              )}
            </p>
            <p className={styles.modalWarning}>This action cannot be undone.</p>
            <div className={styles.modalActions}>
              <button
                onClick={() => setConfirmDeleteCategory(null)}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCategory}
                className={styles.dangerButton}
                disabled={opLoading}
              >
                {opLoading ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsAndSkills;
