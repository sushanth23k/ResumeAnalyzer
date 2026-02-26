import React, { useState, useEffect } from 'react';
import { useResume } from '../../context/ResumeContext';
import { projectsApi, ProjectData, projectGeneratorApi } from '../../services/api';
import { GeneratedProject } from '../../types/resume';
import styles from './Generator.module.css';

interface SharedGeneratorData {
  jobRole: string;
  jobRequirements: string;
}

interface ProjectGeneratorProps {
  onComplete: () => void;
  sharedData: SharedGeneratorData;
  onUpdateSharedData: (data: SharedGeneratorData) => void;
}

const ProjectGenerator: React.FC<ProjectGeneratorProps> = ({ onComplete, sharedData, onUpdateSharedData }) => {
  const { setGeneratorOutput, setRawProjectData } = useResume();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobRole, setJobRole] = useState(sharedData.jobRole);
  const [jobRequirements, setJobRequirements] = useState(sharedData.jobRequirements);
  const [sidePrompt, setSidePrompt] = useState('');
  const [lineCounts, setLineCounts] = useState<number[]>([]);
  const [generatedProjects, setGeneratedProjects] = useState<GeneratedProject[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [editingProject, setEditingProject] = useState<GeneratedProject | null>(null);
  const [editingProjectPoints, setEditingProjectPoints] = useState<string[]>([]);
  const [editingProjectSkills, setEditingProjectSkills] = useState<string[]>([]);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectsApi.getAll();
      setProjects(data);
      // Initialize line counts with default value of 3 for each project
      setLineCounts(data.map(() => 3));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Use original projects as the new version
    const skippedProjects: GeneratedProject[] = projects.map(project => ({
      projectName: project.projectName,
      projectPoints: [project.projectInfo], // Convert single info to array
      projectSkills: project.skills.map(s => s.skillName)
    }));
    
    setGeneratedProjects(skippedProjects);
    setGeneratorOutput(prev => ({ ...prev, projects: skippedProjects }));
    setHasGenerated(true);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // Call the real Project Generator API
      const response = await projectGeneratorApi.generate({
        job_role: jobRole,
        job_description: jobRequirements,
        points_count: lineCounts,
        additional_instruction: sidePrompt,
      });

      // Store the raw API response for the Skills Generator
      setRawProjectData(response.output);

      // Transform the API response to the frontend format
      const transformedProjects: GeneratedProject[] = response.output.map(item => ({
        projectName: item.project_name,
        projectPoints: item.project_points,
        projectSkills: item.project_skills
      }));

      setGeneratedProjects(transformedProjects);
      setGeneratorOutput(prev => ({ ...prev, projects: transformedProjects }));
      setHasGenerated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate projects');
      console.error('Error generating projects:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNext = () => {
    onComplete();
  };

  const handleEdit = (index: number) => {
    const project = generatedProjects[index];
    setEditingIndex(index);
    setEditingProject({ ...project });
    setEditingProjectPoints([...(project.projectPoints || [])]);
    setEditingProjectSkills([...(project.projectSkills || [])]);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editingProject && editingIndex >= 0) {
      const updated = [...generatedProjects];
      updated[editingIndex] = {
        ...editingProject,
        projectPoints: editingProjectPoints,
        projectSkills: editingProjectSkills
      };
      setGeneratedProjects(updated);
      setGeneratorOutput(prev => ({ ...prev, projects: updated }));
    }
    setIsEditing(false);
    setEditingIndex(-1);
    setEditingProject(null);
    setEditingProjectPoints([]);
    setEditingProjectSkills([]);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingIndex(-1);
    setEditingProject(null);
    setEditingProjectPoints([]);
    setEditingProjectSkills([]);
  };

  const handleUpdateProjectPoint = (pointIndex: number, value: string) => {
    const updated = [...editingProjectPoints];
    updated[pointIndex] = value;
    setEditingProjectPoints(updated);
  };

  const handleAddProjectPoint = () => {
    setEditingProjectPoints([...editingProjectPoints, '']);
  };

  const handleRemoveProjectPoint = (pointIndex: number) => {
    const updated = editingProjectPoints.filter((_, index) => index !== pointIndex);
    setEditingProjectPoints(updated);
  };

  const handleUpdateProjectSkill = (skillIndex: number, value: string) => {
    const updated = [...editingProjectSkills];
    updated[skillIndex] = value;
    setEditingProjectSkills(updated);
  };

  const handleAddProjectSkill = () => {
    setEditingProjectSkills([...editingProjectSkills, '']);
  };

  const handleRemoveProjectSkill = (skillIndex: number) => {
    const updated = editingProjectSkills.filter((_, index) => index !== skillIndex);
    setEditingProjectSkills(updated);
  };

  if (loading) {
    return (
      <div className={styles.generator}>
        <div className={styles.loadingState}>
          <span className={styles.loadSpinner} />
          Loading your projects…
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
        <p className={styles.stepEyebrow}>Step 2 of 4</p>
        <h2>💼 Project Generator</h2>
        <p>AI will craft compelling project descriptions optimised for the target role. You can also skip this step.</p>
      </div>

      <div className={styles.section}>
        <h3>Current Projects</h3>
        <div className={styles.projectList}>
          {projects.length === 0 ? (
            <p className={styles.empty}>No projects added yet. Add them in Applicant Info.</p>
          ) : (
            projects.map((project, index) => (
              <div key={project.id} className={styles.projectItem}>
                <h4>{project.projectName}</h4>
                <div className={styles.skills}>
                  {project.skills.map((skill) => (
                    <span key={skill.id} className={styles.skillTag}>
                      {skill.skillName}
                    </span>
                  ))}
                </div>
                <p className={styles.description}>{project.projectInfo}</p>
                <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                    Lines to generate:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={lineCounts[index] || 3}
                    onChange={(e) => {
                      const newCounts = [...lineCounts];
                      newCounts[index] = parseInt(e.target.value) || 3;
                      setLineCounts(newCounts);
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
          disabled={projects.length === 0 || isGenerating}
          className={styles.skipButton}
        >
          ⏭️ Skip
        </button>
        <button
          onClick={handleGenerate}
          disabled={isGenerating || projects.length === 0}
          className={styles.generateButton}
        >
          {isGenerating ? '⏳ Generating...' : '✨ Generate'}
        </button>
      </div>

      {hasGenerated && (
        <>
          <div className={styles.output}>
            <h3>Generated Projects</h3>
            {isEditing && editingProject ? (
              <div className={styles.editContainer}>
                <h4>Editing: {editingProject.projectName}</h4>
                <div className={styles.section} style={{ marginTop: '1rem' }}>
                  <label className={styles.pointsLabel}>Project Name:</label>
                  <input
                    type="text"
                    value={editingProject.projectName}
                    onChange={(e) => setEditingProject({
                      ...editingProject,
                      projectName: e.target.value
                    })}
                    className={styles.input}
                  />
                </div>
                <div className={styles.section} style={{ marginTop: '1rem' }}>
                  <label className={styles.pointsLabel}>Project Points:</label>
                  {editingProjectPoints.map((point, pointIndex) => (
                    <div key={pointIndex} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'flex-start' }}>
                      <textarea
                        value={point}
                        onChange={(e) => handleUpdateProjectPoint(pointIndex, e.target.value)}
                        className={styles.textarea}
                        rows={2}
                        style={{ flex: 1 }}
                      />
                      <button
                        onClick={() => handleRemoveProjectPoint(pointIndex)}
                        className={styles.deleteButton}
                        style={{ padding: '0.5rem', marginTop: '0.25rem' }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={handleAddProjectPoint}
                    className={styles.addButton}
                    style={{ marginTop: '0.5rem' }}
                  >
                    + Add Project Point
                  </button>
                </div>
                <div className={styles.section} style={{ marginTop: '1rem' }}>
                  <label className={styles.pointsLabel}>Project Skills:</label>
                  {editingProjectSkills.map((skill, skillIndex) => (
                    <div key={skillIndex} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={skill}
                        onChange={(e) => handleUpdateProjectSkill(skillIndex, e.target.value)}
                        className={styles.input}
                        style={{ flex: 1 }}
                        placeholder="Enter skill name"
                      />
                      <button
                        onClick={() => handleRemoveProjectSkill(skillIndex)}
                        className={styles.deleteButton}
                        style={{ padding: '0.5rem' }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={handleAddProjectSkill}
                    className={styles.addButton}
                    style={{ marginTop: '0.5rem' }}
                  >
                    + Add Project Skill
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
              generatedProjects.map((project, index) => (
                <div key={index} className={styles.projectSection}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h4 className={styles.projectName}>Project: {project.projectName}</h4>
                    <button
                      onClick={() => handleEdit(index)}
                      className={styles.editButton}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                    >
                      ✏️ Edit
                    </button>
                  </div>
                  {project.projectPoints && project.projectPoints.length > 0 ? (
                    <div className={styles.projectPoints}>
                      <p className={styles.pointsLabel}>Project Points:</p>
                      <ul className={styles.bulletList}>
                        {project.projectPoints.map((point, pointIndex) => (
                          <li key={pointIndex}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  ) : project.newProjectInfo ? (
                    <div className={styles.projectInfo}>
                      <p className={styles.infoLabel}>Project Info:</p>
                      <p className={styles.infoText}>{project.newProjectInfo}</p>
                    </div>
                  ) : null}
                  {project.projectSkills && project.projectSkills.length > 0 && (
                    <div className={styles.projectSkills} style={{ marginTop: '0.75rem' }}>
                      <p className={styles.pointsLabel}>Project Skills:</p>
                      <div className={styles.skills}>
                        {project.projectSkills.map((skill, skillIndex) => (
                          <span key={skillIndex} className={styles.skillTag}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
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

export default ProjectGenerator;
