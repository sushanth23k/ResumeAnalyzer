import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import { applicationsApi, ApplicationData } from '../services/api';
import styles from './Applications.module.css';

const Applications: React.FC = () => {
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load applications on component mount
  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await applicationsApi.getAll();
      setApplications(response.applications);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load applications');
      console.error('Error loading applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (newApplication: Omit<ApplicationData, 'id' | 'resumeFilePath'>): Promise<ApplicationData> => {
    try {
      setError(null);
      const created = await applicationsApi.create(newApplication);
      setApplications(prev => [...prev, created]);
      return created;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create application');
      console.error('Error creating application:', err);
      throw err; // Re-throw to let DataTable handle it
    }
  };

  const handleEdit = async (updatedApplication: ApplicationData) => {
    try {
      setError(null);
      const updated = await applicationsApi.update(updatedApplication.id, {
        jobName: updatedApplication.jobName,
        companyName: updatedApplication.companyName,
        jobLink: updatedApplication.jobLink,
        status: updatedApplication.status,
        notes: updatedApplication.notes,
      });
      
      setApplications(prev =>
        prev.map(app => (app.id === updated.id ? updated : app))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update application');
      console.error('Error updating application:', err);
      throw err; // Re-throw to let DataTable handle it
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this application? The resume file will also be deleted.')) {
      try {
        setError(null);
        await applicationsApi.delete(id);
        setApplications(prev => prev.filter(app => app.id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete application');
        console.error('Error deleting application:', err);
        throw err; // Re-throw to let DataTable handle it
      }
    }
  };

  if (loading) {
    return (
      <div className={styles.applications}>
        <div className={styles.loading}>Loading applications...</div>
      </div>
    );
  }

  return (
    <div className={styles.applications}>
      {error && (
        <div className={styles.error}>
          <p>⚠️ {error}</p>
          <button onClick={loadApplications} className={styles.retryButton}>
            Retry
          </button>
        </div>
      )}
      <DataTable
        applications={applications}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default Applications;
