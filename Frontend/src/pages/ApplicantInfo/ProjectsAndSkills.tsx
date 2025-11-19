import React, { useState, useEffect } from 'react';
import { projectsApi, skillsApi, ProjectData, SkillData } from '../../services/api';
import styles from './ProjectsAndSkills.module.css';

const ProjectsAndSkills: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Projects state
  const [projects, setProjects] = useState<ProjectData[]>([]);
  
  // Skills state
  const [userSkills, setUserSkills] = useState<SkillData[]>([]);
  const [allSkills, setAllSkills] = useState<SkillData[]>([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('');
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load projects
      const projectsData = await projectsApi.getAll();
      setProjects(projectsData);
      
      // Load user skills
      const userSkillsData = await skillsApi.getUserSkills();
      setUserSkills(userSkillsData);
      
      // Load all available skills
      const allSkillsData = await skillsApi.getAll();
      setAllSkills(allSkillsData);
      
      // Extract unique categories from all skills
      const categories = [...new Set(allSkillsData.map(s => s.category))].sort();
      setAvailableCategories(categories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

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
      {
        id: '',
        projectName: '',
        projectInfo: '',
        skills: [],
        displayOrder: prev.length,
      },
    ]);
  };

  const removeProject = (index: number) => {
    setProjects(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddUserSkill = async (skillId: string) => {
    try {
      setError(null);
      await skillsApi.addUserSkills([skillId]);
      await loadAllData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add skill');
      console.error('Error adding skill:', err);
    }
  };

  const handleRemoveUserSkill = async (skillId: string) => {
    try {
      setError(null);
      await skillsApi.removeUserSkills([skillId]);
      await loadAllData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove skill');
      console.error('Error removing skill:', err);
    }
  };

  const handleCreateNewSkill = async () => {
    if (!newSkillName.trim() || !newSkillCategory.trim()) {
      setError('Skill name and category are required');
      return;
    }
    
    try {
      setError(null);
      const created = await skillsApi.create(newSkillName.trim(), newSkillCategory.trim());
      await skillsApi.addUserSkills([created.id]);
      await loadAllData();
      setNewSkillName('');
      setNewSkillCategory('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create skill');
      console.error('Error creating skill:', err);
    }
  };

  const handleSave = async () => {
    try {
      setError(null);
      setLoading(true);
      
      // Save projects - delete removed ones, update existing, create new
      const existingProjectIds = projects.filter(p => p.id).map(p => p.id);
      
      // Delete projects that were removed
      const originalProjects = await projectsApi.getAll();
      for (const original of originalProjects) {
        if (original.id && !existingProjectIds.includes(original.id)) {
          await projectsApi.delete(original.id);
        }
      }
      
      // Create or update projects
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
      <div className={styles.projectsAndSkills}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  // Get available skills that are not in user's skill list
  const availableSkills = allSkills.filter(
    skill => !userSkills.some(us => us.id === skill.id)
  );

  return (
    <div className={styles.projectsAndSkills}>
      {error && (
        <div className={styles.error}>
          <p>⚠️ {error}</p>
          <button onClick={loadAllData} className={styles.retryButton}>
            Retry
          </button>
        </div>
      )}
      
      <div className={styles.header}>
        <h2>Projects and Skills</h2>
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
          <h3>Projects</h3>
          {isEditing && (
            <button onClick={addProject} className={styles.addButton}>
              + Add Project
            </button>
          )}
        </div>

        {projects.length === 0 ? (
          <p className={styles.empty}>No projects added yet</p>
        ) : (
          projects.map((project, index) => (
            <div key={project.id || index} className={styles.projectCard}>
              <div className={styles.field}>
                <label>Project Name *</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={project.projectName}
                    onChange={e => handleProjectChange(index, 'projectName', e.target.value)}
                    required
                  />
                ) : (
                  <h4>{project.projectName}</h4>
                )}
              </div>

              <div className={styles.field}>
                <label>Skills</label>
                {isEditing ? (
                  <div>
                    <select
                      onChange={e => {
                        if (e.target.value) {
                          addProjectSkill(index, e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className={styles.select}
                    >
                      <option value="">Select a skill to add...</option>
                      {allSkills
                        .filter(skill => !project.skills.some(s => s.id === skill.id))
                        .map(skill => (
                          <option key={skill.id} value={skill.id}>
                            {skill.skillName} ({skill.category})
                          </option>
                        ))}
                    </select>
                    <div className={styles.tags}>
                      {project.skills.map(skill => (
                        <span key={skill.id} className={styles.tag}>
                          {skill.skillName}
                          <button
                            onClick={() => removeProjectSkill(index, skill.id)}
                            className={styles.tagRemove}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className={styles.tags}>
                    {project.skills.length === 0 ? (
                      <span className={styles.empty}>No skills added</span>
                    ) : (
                      project.skills.map(skill => (
                        <span key={skill.id} className={styles.tag}>
                          {skill.skillName}
                        </span>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className={styles.field}>
                <label>Project Info *</label>
                {isEditing ? (
                  <textarea
                    value={project.projectInfo}
                    onChange={e => handleProjectChange(index, 'projectInfo', e.target.value)}
                    rows={8}
                    required
                  />
                ) : (
                  <p>{project.projectInfo || '-'}</p>
                )}
              </div>

              {isEditing && (
                <button onClick={() => removeProject(index)} className={styles.removeButton}>
                  Remove Project
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>Your Skills</h3>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className={styles.editButton}>
              ✏️ Manage Skills
            </button>
          )}
        </div>

        {isEditing && (
          <div className={styles.skillsManagement}>
            <div className={styles.skillSelection}>
              <select
                onChange={e => {
                  if (e.target.value) {
                    handleAddUserSkill(e.target.value);
                  }
                }}
                className={styles.select}
              >
                <option value="">Add existing skill...</option>
                {availableSkills.map(skill => (
                  <option key={skill.id} value={skill.id}>
                    {skill.skillName} ({skill.category})
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.newSkillForm}>
              <input
                type="text"
                placeholder="Skill name"
                value={newSkillName}
                onChange={e => setNewSkillName(e.target.value)}
                className={styles.input}
              />
              <select
                value={newSkillCategory}
                onChange={e => setNewSkillCategory(e.target.value)}
                className={styles.select}
              >
                <option value="">Select or type new category...</option>
                {availableCategories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Or type new category"
                value={newSkillCategory && !availableCategories.includes(newSkillCategory) ? newSkillCategory : ''}
                onChange={e => setNewSkillCategory(e.target.value)}
                className={styles.input}
              />
              <button onClick={handleCreateNewSkill} className={styles.saveButton}>
                + Add Skill
              </button>
            </div>
          </div>
        )}

        {userSkills.length === 0 ? (
          <p className={styles.empty}>No skills added yet</p>
        ) : (
          <div className={styles.skillsGrid}>
            {Object.entries(
              userSkills.reduce((acc, skill) => {
                if (!acc[skill.category]) {
                  acc[skill.category] = [];
                }
                acc[skill.category].push(skill);
                return acc;
              }, {} as Record<string, typeof userSkills>)
            ).map(([category, categorySkills]) => (
              <div key={category} className={styles.skillsGridRow}>
                <div className={styles.skillsGridCategory}>
                  <h4>{category}</h4>
                </div>
                <div className={styles.skillsGridSkills}>
                  <div className={styles.tags}>
                    {categorySkills.map(skill => (
                      <span key={skill.id} className={styles.tag}>
                        {skill.skillName}
                        {isEditing && (
                          <button
                            onClick={() => handleRemoveUserSkill(skill.id)}
                            className={styles.tagRemove}
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsAndSkills;
