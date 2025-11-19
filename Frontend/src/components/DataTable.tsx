import React, { useState } from 'react';
import { ApplicationData } from '../services/api';
import { resumeFileApi } from '../services/api';
import styles from './DataTable.module.css';

interface DataTableProps {
  applications: ApplicationData[];
  onAdd: (application: Omit<ApplicationData, 'id' | 'resumeFilePath'>) => Promise<ApplicationData>;
  onEdit: (application: ApplicationData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

type ApplicationStatus = 'Applied' | 'Rejected' | 'Timed out' | 'Processed' | 'Accepted' | 'Interview';

const DataTable: React.FC<DataTableProps> = ({ applications, onAdd, onEdit, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<ApplicationData, 'id' | 'resumeFilePath'>>({
    jobName: '',
    companyName: '',
    jobLink: '',
    status: 'Applied',
    notes: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newApplicationId, setNewApplicationId] = useState<string | null>(null);

  const statusOptions: ApplicationStatus[] = [
    'Applied',
    'Rejected',
    'Timed out',
    'Processed',
    'Accepted',
    'Interview',
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only PDF, DOC, and DOCX files are allowed');
        return;
      }
      
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      if (editingId) {
        await onEdit({ ...formData, id: editingId, resumeFilePath: applications.find(a => a.id === editingId)?.resumeFilePath });
        setEditingId(null);
        resetForm();
      } else {
        const newApp = await onAdd(formData);
        // If we have a selected file and the new application was created, keep form open for upload
        if (selectedFile && newApp?.id) {
          setNewApplicationId(newApp.id);
          setEditingId(newApp.id);
          // Keep form open - user can upload resume now
        } else {
          resetForm();
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    }
  };

  const resetForm = () => {
    setFormData({
      jobName: '',
      companyName: '',
      jobLink: '',
      status: 'Applied',
      notes: '',
    });
    setSelectedFile(null);
    setIsAdding(false);
    setEditingId(null);
    setNewApplicationId(null);
  };

  const handleEdit = (application: ApplicationData) => {
    setFormData({
      jobName: application.jobName,
      companyName: application.companyName,
      jobLink: application.jobLink,
      status: application.status,
      notes: application.notes || '',
    });
    setSelectedFile(null);
    setEditingId(application.id);
    setIsAdding(true);
  };

  const handleUploadResume = async (applicationId: string, file: File) => {
    try {
      setUploadingId(applicationId);
      setError(null);
      await resumeFileApi.upload(applicationId, file);
      setSelectedFile(null);
      setNewApplicationId(null);
      // Refresh the page or update the application in state
      window.location.reload(); // Simple solution - you could make this more elegant
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload resume');
    } finally {
      setUploadingId(null);
    }
  };

  const handleDownloadResume = async (applicationId: string, fileName: string) => {
    try {
      setError(null);
      const blob = await resumeFileApi.download(applicationId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'resume.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download resume');
    }
  };

  const handleDeleteResume = async (applicationId: string) => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      try {
        setError(null);
        await resumeFileApi.delete(applicationId);
        // Refresh the page or update the application in state
        window.location.reload(); // Simple solution - you could make this more elegant
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete resume');
      }
    }
  };

  const hasResume = (app: ApplicationData) => {
    return app.resumeFilePath && !app.resumeFilePath.includes('placeholder_');
  };

  const getStatusColor = (status: ApplicationStatus) => {
    const colors: Record<ApplicationStatus, string> = {
      'Applied': '#3b82f6',
      'Rejected': '#ef4444',
      'Timed out': '#f59e0b',
      'Processed': '#8b5cf6',
      'Accepted': '#10b981',
      'Interview': '#06b6d4',
    };
    return colors[status];
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Job Applications</h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className={styles.addButton}
          >
            + Add Application
          </button>
        )}
      </div>

      {error && (
        <div className={styles.errorBanner}>
          ⚠️ {error}
        </div>
      )}

      {isAdding && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <input
              type="text"
              name="jobName"
              placeholder="Job Name *"
              value={formData.jobName}
              onChange={handleInputChange}
              required
              className={styles.input}
            />
            <input
              type="text"
              name="companyName"
              placeholder="Company Name *"
              value={formData.companyName}
              onChange={handleInputChange}
              required
              className={styles.input}
            />
            <input
              type="url"
              name="jobLink"
              placeholder="Job Link (https://...) *"
              value={formData.jobLink}
              onChange={handleInputChange}
              required
              className={styles.input}
            />
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className={styles.select}
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          
          <div className={styles.resumeSection}>
            <label className={styles.resumeSectionLabel}>Resume Management</label>
            {(() => {
              const currentAppId = editingId || newApplicationId;
              const currentApp = currentAppId ? applications.find(a => a.id === currentAppId) : null;
              const hasResumeFile = currentApp && hasResume(currentApp);
              
              return (
                <div className={styles.resumeUploadArea}>
                  {hasResumeFile && currentAppId ? (
                    <div className={styles.resumeStatus}>
                      <span className={styles.resumeStatusText}>✓ Resume uploaded</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteResume(currentAppId)}
                        className={styles.deleteResumeButton}
                      >
                        🗑️ Delete Resume
                      </button>
                    </div>
                  ) : (
                    <div className={styles.resumeUploadControls}>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className={styles.fileInput}
                        id="resume-file-input"
                      />
                      <label htmlFor="resume-file-input" className={styles.fileLabel}>
                        📄 Choose File
                      </label>
                      {selectedFile && currentAppId && (
                        <>
                          <span className={styles.fileName}>{selectedFile.name}</span>
                          <button
                            type="button"
                            onClick={() => handleUploadResume(currentAppId, selectedFile)}
                            className={styles.uploadButton}
                            disabled={uploadingId === currentAppId}
                          >
                            {uploadingId === currentAppId ? '⏳ Uploading...' : '📤 Upload'}
                          </button>
                        </>
                      )}
                      {selectedFile && !currentAppId && (
                        <span className={styles.fileName}>{selectedFile.name} (Upload after saving)</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
          
          <div className={styles.formRow}>
            <textarea
              name="notes"
              placeholder="Notes (optional)"
              value={formData.notes}
              onChange={handleInputChange}
              className={styles.textarea}
              rows={3}
            />
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={styles.saveButton}>
              {editingId ? 'Update' : 'Add'} Application
            </button>
            <button
              type="button"
              onClick={resetForm}
              className={styles.cancelButton}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Job Name</th>
              <th>Company Name</th>
              <th>Link</th>
              <th>Resume</th>
              <th>Status</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.emptyState}>
                  No applications yet. Click "Add Application" to get started.
                </td>
              </tr>
            ) : (
              applications.map(application => (
                <tr key={application.id}>
                  <td>{application.jobName}</td>
                  <td>{application.companyName}</td>
                  <td>
                    <a
                      href={application.jobLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.link}
                    >
                      View Job
                    </a>
                  </td>
                  <td>
                    {hasResume(application) ? (
                      <button
                        onClick={() => handleDownloadResume(application.id, `${application.companyName}_${application.jobName}_resume.pdf`)}
                        className={styles.downloadButton}
                        title="Download Resume"
                      >
                        📥 Download
                      </button>
                    ) : (
                      <span className={styles.noResume}>No resume</span>
                    )}
                  </td>
                  <td>
                    <span
                      className={styles.statusBadge}
                      style={{ backgroundColor: getStatusColor(application.status) }}
                    >
                      {application.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.notes} title={application.notes || 'No notes'}>
                      {application.notes || '-'}
                    </div>
                  </td>
                  <td className={styles.actions}>
                    <button
                      onClick={() => handleEdit(application)}
                      className={styles.editButton}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(application.id)}
                      className={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
