import React, { useState, useEffect } from 'react';
import { useResume } from '../../context/ResumeContext';
import { skillsApi, SkillData, skillsGeneratorApi } from '../../services/api';
import { SkillsByCategory } from '../../types/resume';
import styles from './Generator.module.css';

interface SharedGeneratorData {
  jobRole: string;
  jobRequirements: string;
}

interface SkillsGeneratorProps {
  onComplete: () => void;
  sharedData: SharedGeneratorData;
  onUpdateSharedData: (data: SharedGeneratorData) => void;
}

const SkillsGenerator: React.FC<SkillsGeneratorProps> = ({ onComplete, sharedData, onUpdateSharedData }) => {
  const { generatorOutput, setGeneratorOutput, rawExperienceData, rawProjectData } = useResume();
  const [skills, setSkills] = useState<SkillData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobRole, setJobRole] = useState(sharedData.jobRole);
  const [jobRequirements, setJobRequirements] = useState(sharedData.jobRequirements);
  const [sidePrompt, setSidePrompt] = useState('');
  const [includeWebResearch, setIncludeWebResearch] = useState(false);
  const [generatedSkills, setGeneratedSkills] = useState<SkillsByCategory>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string>('');
  const [editingSkills, setEditingSkills] = useState<string[]>([]);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await skillsApi.getUserSkills();
      setSkills(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load skills');
      console.error('Error loading skills:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Use original skills organized by category
    const skippedSkills: SkillsByCategory = {
      'Programming Languages': skills.slice(0, 5).map(s => s.skillName),
      'Frameworks & Tools': skills.slice(5).map(s => s.skillName),
    };
    
    setGeneratedSkills(skippedSkills);
    setGeneratorOutput(prev => ({ ...prev, skills: skippedSkills }));
    setHasGenerated(true);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // Call the real Skills Generator API
      const response = await skillsGeneratorApi.generate({
        job_role: jobRole,
        job_description: jobRequirements,
        additional_instruction: sidePrompt,
        include_web_research: includeWebResearch,
        experience_data: rawExperienceData,
        project_data: rawProjectData,
      });

      // Transform the API response to the frontend format (category-based object)
      const transformedSkills: SkillsByCategory = {};
      response.output.forEach(category => {
        transformedSkills[category.skill_category] = category.skills;
      });

      setGeneratedSkills(transformedSkills);
      setGeneratorOutput(prev => ({ ...prev, skills: transformedSkills }));
      setHasGenerated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate skills');
      console.error('Error generating skills:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = (category: string, categorySkills: string[]) => {
    setEditingCategory(category);
    setEditingSkills([...categorySkills]);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editingCategory && editingSkills.length > 0) {
      const updatedSkills = { ...generatedSkills };
      updatedSkills[editingCategory] = editingSkills.filter(s => s.trim() !== '');
      setGeneratedSkills(updatedSkills);
      setGeneratorOutput(prev => ({ ...prev, skills: updatedSkills }));
    }
    setIsEditing(false);
    setEditingCategory('');
    setEditingSkills([]);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingCategory('');
    setEditingSkills([]);
  };

  const handleAddCategory = () => {
    const newCategory = prompt('Enter category name:');
    if (newCategory && newCategory.trim()) {
      const updatedSkills = { ...generatedSkills };
      updatedSkills[newCategory.trim()] = [];
      setGeneratedSkills(updatedSkills);
      setGeneratorOutput(prev => ({ ...prev, skills: updatedSkills }));
    }
  };

  const handleDeleteCategory = (category: string) => {
    if (window.confirm(`Delete category "${category}"?`)) {
      const updatedSkills = { ...generatedSkills };
      delete updatedSkills[category];
      setGeneratedSkills(updatedSkills);
      setGeneratorOutput(prev => ({ ...prev, skills: updatedSkills }));
    }
  };

  const handleAddSkillToCategory = (category: string) => {
    const newSkill = prompt('Enter skill name:');
    if (newSkill && newSkill.trim()) {
      const updatedSkills = { ...generatedSkills };
      if (!updatedSkills[category]) {
        updatedSkills[category] = [];
      }
      updatedSkills[category].push(newSkill.trim());
      setGeneratedSkills(updatedSkills);
      setGeneratorOutput(prev => ({ ...prev, skills: updatedSkills }));
    }
  };

  const handleRemoveSkill = (category: string, skillIndex: number) => {
    const updatedSkills = { ...generatedSkills };
    updatedSkills[category].splice(skillIndex, 1);
    setGeneratedSkills(updatedSkills);
    setGeneratorOutput(prev => ({ ...prev, skills: updatedSkills }));
  };

  const handleNext = () => {
    onComplete();
  };

  if (loading) {
    return (
      <div className={styles.generator}>
        <div className={styles.loadingState}>
          <span className={styles.loadSpinner} />
          Loading your skills…
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
        <p className={styles.stepEyebrow}>Step 3 of 4</p>
        <h2>⚡ Skills Generator</h2>
        <p>AI will select and reorder the most relevant skills from your profile for the target role. You can also skip.</p>
      </div>

      <div className={styles.section}>
        <h3>Current Skills</h3>
        <div className={styles.skillsDisplay}>
          {skills.length === 0 ? (
            <p className={styles.empty}>No skills added yet. Add them in Applicant Info.</p>
          ) : (
            <div className={styles.skills}>
              {skills.map((skill) => (
                <span key={skill.id} className={styles.skillTag}>
                  {skill.skillName}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <h3>Generated Experiences (Preview)</h3>
        <div className={styles.readOnlyBox}>
          {generatorOutput.experiences.length === 0 ? (
            <p className={styles.empty}>No experiences generated yet</p>
          ) : (
            <div>
              {generatorOutput.experiences.slice(0, 2).map((exp, index) => (
                <div key={index}>
                  <strong>{exp.companyName}</strong>
                  <p>{exp.newExperience[0]}...</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <h3>Generated Projects (Preview)</h3>
        <div className={styles.readOnlyBox}>
          {generatorOutput.projects.length === 0 ? (
            <p className={styles.empty}>No projects generated yet</p>
          ) : (
            <div>
              {generatorOutput.projects.slice(0, 2).map((project, index) => (
                <div key={index}>
                  <strong>{project.projectName}</strong>
                  <p>
                    {project.projectPoints && project.projectPoints.length > 0 
                      ? project.projectPoints[0].substring(0, 100) + '...'
                      : project.newProjectInfo 
                        ? project.newProjectInfo.substring(0, 100) + '...'
                        : 'No content available'
                    }
                  </p>
                </div>
              ))}
            </div>
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

      <div className={styles.section}>
        <h3>Web Search</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={includeWebResearch}
              onChange={e => setIncludeWebResearch(e.target.checked)}
              style={{ 
                width: '18px', 
                height: '18px', 
                cursor: 'pointer',
                accentColor: '#667eea'
              }}
            />
            <span style={{ fontSize: '1rem', color: '#475569' }}>
              Include web research to enhance skills generation
            </span>
          </label>
        </div>
        <p style={{ 
          margin: '0.5rem 0 0 0', 
          fontSize: '0.9rem', 
          color: '#64748b', 
          fontStyle: 'italic' 
        }}>
          When enabled, the generator will use web research to find relevant skills for your target role.
        </p>
      </div>

      <div className={styles.buttonGroup}>
        <button
          onClick={handleSkip}
          disabled={skills.length === 0 || isGenerating}
          className={styles.skipButton}
        >
          ⏭️ Skip
        </button>
        <button
          onClick={handleGenerate}
          disabled={isGenerating || skills.length === 0}
          className={styles.generateButton}
        >
          {isGenerating ? '⏳ Generating...' : '✨ Generate'}
        </button>
      </div>

      {hasGenerated && (
        <>
          <div className={styles.output}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>Generated Skills</h3>
              <button
                onClick={handleAddCategory}
                className={styles.editButton}
                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
              >
                + Add Category
              </button>
            </div>
            {isEditing ? (
              <div className={styles.editContainer}>
                <h4>Editing: {editingCategory}</h4>
                <div className={styles.editSkillsList}>
                  {editingSkills.map((skill, index) => (
                    <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={skill}
                        onChange={(e) => {
                          const updated = [...editingSkills];
                          updated[index] = e.target.value;
                          setEditingSkills(updated);
                        }}
                        className={styles.input}
                        style={{ flex: 1 }}
                      />
                      <button
                        onClick={() => {
                          const updated = editingSkills.filter((_, i) => i !== index);
                          setEditingSkills(updated);
                        }}
                        className={styles.deleteButton}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setEditingSkills([...editingSkills, ''])}
                    className={styles.addButton}
                    style={{ marginTop: '0.5rem' }}
                  >
                    + Add Skill
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
              <div className={styles.skillsByCategory}>
                {Object.entries(generatedSkills).map(([category, categorySkills]) => (
                  <div key={category} className={styles.categorySection}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <h4 style={{ margin: 0, color: '#1e293b' }}>{category}</h4>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleEdit(category, categorySkills)}
                          className={styles.editButton}
                          style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category)}
                          className={styles.deleteButton}
                          style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}
                        >
                          🗑️ Delete
                        </button>
                        <button
                          onClick={() => handleAddSkillToCategory(category)}
                          className={styles.addButton}
                          style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}
                        >
                          + Add Skill
                        </button>
                      </div>
                    </div>
                    <div className={styles.skills}>
                      {categorySkills.map((skill, index) => (
                        <span key={index} className={styles.skillTag}>
                          {skill}
                          <button
                            onClick={() => handleRemoveSkill(category, index)}
                            className={styles.removeSkillButton}
                            style={{ marginLeft: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {!isEditing && (
            <button onClick={handleNext} className={styles.nextButton}>
              Continue to Resume Output →
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default SkillsGenerator;
