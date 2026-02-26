import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationStatsApi, completeInfoApi, ApplicationStatsData, CompleteApplicantInfoData } from '../services/api';
import styles from './Dashboard.module.css';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appStats, setAppStats] = useState<ApplicationStatsData | null>(null);
  const [applicantInfo, setApplicantInfo] = useState<CompleteApplicantInfoData | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load application statistics and applicant info
      const [statsData, infoData] = await Promise.all([
        applicationStatsApi.get(),
        completeInfoApi.get(),
      ]);
      
      setAppStats(statsData);
      setApplicantInfo(infoData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loading}>Loading dashboard...</div>
      </div>
    );
  }

  if (error || !appStats || !applicantInfo) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.error}>
          <p>⚠️ {error || 'Failed to load dashboard data'}</p>
          <button onClick={loadDashboardData} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = {
    totalApplications: appStats.total,
    applied: appStats.byStatus.Applied || 0,
    interview: appStats.byStatus.Interview || 0,
    accepted: appStats.byStatus.Accepted || 0,
    rejected: appStats.byStatus.Rejected || 0,
    totalProjects: applicantInfo.projects.length,
    totalExperiences: applicantInfo.experiences.length,
    totalSkills: applicantInfo.skills.length,
  };

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>Dashboard</h1>
      <p className={styles.subtitle}>Welcome to Job Matrix</p>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📋</div>
          <div className={styles.statContent}>
            <h3>{stats.totalApplications}</h3>
            <p>Total Applications</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>✅</div>
          <div className={styles.statContent}>
            <h3>{stats.applied}</h3>
            <p>Applied</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>🎤</div>
          <div className={styles.statContent}>
            <h3>{stats.interview}</h3>
            <p>Interviews</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>🎉</div>
          <div className={styles.statContent}>
            <h3>{stats.accepted}</h3>
            <p>Accepted</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>❌</div>
          <div className={styles.statContent}>
            <h3>{stats.rejected}</h3>
            <p>Rejected</p>
          </div>
        </div>
      </div>

      <div className={styles.profileSection}>
        <h2>Profile Summary</h2>
        <div className={styles.profileGrid}>
          <div className={styles.profileCard}>
            <div className={styles.profileIcon}>💼</div>
            <h3>{stats.totalProjects}</h3>
            <p>Projects</p>
            <Link to="/applicant-info" className={styles.profileLink}>View Details</Link>
          </div>

          <div className={styles.profileCard}>
            <div className={styles.profileIcon}>🎯</div>
            <h3>{stats.totalExperiences}</h3>
            <p>Experiences</p>
            <Link to="/applicant-info" className={styles.profileLink}>View Details</Link>
          </div>

          <div className={styles.profileCard}>
            <div className={styles.profileIcon}>⚡</div>
            <h3>{stats.totalSkills}</h3>
            <p>Skills</p>
            <Link to="/applicant-info" className={styles.profileLink}>View Details</Link>
          </div>
        </div>
      </div>

      <div className={styles.quickActions}>
        <h2>Quick Actions</h2>
        <div className={styles.actionsGrid}>
          <Link to="/applications" className={styles.actionCard}>
            <div className={styles.actionIcon}>📝</div>
            <h3>Manage Applications</h3>
            <p>Add, edit, or view your job applications</p>
          </Link>

          <Link to="/applicant-info" className={styles.actionCard}>
            <div className={styles.actionIcon}>👤</div>
            <h3>Update Profile</h3>
            <p>Edit your personal information and experiences</p>
          </Link>

          <Link to="/resume-generator" className={styles.actionCard}>
            <div className={styles.actionIcon}>🚀</div>
            <h3>Generate Resume</h3>
            <p>Create tailored resume content for job applications</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

