import React, { useState, useEffect, useRef, useCallback } from 'react';
import { applicationsApi, resumeFileApi, ApplicationData } from '../services/api';
import styles from './Applications.module.css';

// ─── Types ──────────────────────────────────────────────────────────────────

type AppStatus = ApplicationData['status'];

interface FormState {
  jobName: string;
  companyName: string;
  jobLink: string;
  status: AppStatus;
  notes: string;
}

// ─── Status config ───────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<AppStatus, { label: string; colorClass: string; icon: string }> = {
  Applied:     { label: 'Applied',     colorClass: styles.statusApplied,   icon: '📤' },
  Interview:   { label: 'Interview',   colorClass: styles.statusInterview, icon: '🎤' },
  Accepted:    { label: 'Accepted',    colorClass: styles.statusAccepted,  icon: '✅' },
  Rejected:    { label: 'Rejected',    colorClass: styles.statusRejected,  icon: '✕' },
  'Timed out': { label: 'Timed out',   colorClass: styles.statusTimedout,  icon: '⏰' },
  Processed:   { label: 'Processed',   colorClass: styles.statusProcessed, icon: '⚙️' },
};

const STATUS_OPTIONS = Object.keys(STATUS_CONFIG) as AppStatus[];

const STAT_CARDS: Array<{
  key: AppStatus | 'total';
  label: string;
  gradientClass: string;
  icon: string;
}> = [
  { key: 'total',     label: 'Total',     gradientClass: styles.statTotal,     icon: '🗂️'  },
  { key: 'Applied',   label: 'Applied',   gradientClass: styles.statApplied,   icon: '📤' },
  { key: 'Interview', label: 'Interview', gradientClass: styles.statInterview, icon: '🎤' },
  { key: 'Accepted',  label: 'Accepted',  gradientClass: styles.statAccepted,  icon: '✅' },
  { key: 'Rejected',  label: 'Rejected',  gradientClass: styles.statRejected,  icon: '✕'  },
  { key: 'Processed', label: 'Processed', gradientClass: styles.statProcessed, icon: '⚙️' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');

const hasResume = (app: ApplicationData) =>
  !!app.resumeFilePath && !app.resumeFilePath.includes('placeholder_');

const BLANK_FORM: FormState = {
  jobName: '',
  companyName: '',
  jobLink: '',
  status: 'Applied',
  notes: '',
};

// ─── Sub-components ──────────────────────────────────────────────────────────

interface ModalProps {
  open: boolean;
  editing: ApplicationData | null;
  onClose: () => void;
  onSave: (form: FormState) => Promise<void>;
  saving: boolean;
  error: string | null;
}

const ApplicationModal: React.FC<ModalProps> = ({ open, editing, onClose, onSave, saving, error }) => {
  const [form, setForm] = useState<FormState>(BLANK_FORM);

  useEffect(() => {
    if (open) {
      setForm(editing
        ? { jobName: editing.jobName, companyName: editing.companyName, jobLink: editing.jobLink, status: editing.status, notes: editing.notes ?? '' }
        : BLANK_FORM
      );
    }
  }, [open, editing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form);
  };

  if (!open) return null;

  return (
    <div className={styles.modalOverlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className={styles.modalHeader}>
          <div>
            <h2 id="modal-title" className={styles.modalTitle}>
              {editing ? 'Edit Application' : 'New Application'}
            </h2>
            <p className={styles.modalSubtitle}>
              {editing ? 'Update the job application details.' : 'Track a new job opportunity.'}
            </p>
          </div>
          <button className={styles.modalClose} onClick={onClose} aria-label="Close">✕</button>
        </div>

        {error && <div className={styles.modalError}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formRow2}>
            <div className={styles.field}>
              <label htmlFor="jobName">Job Title *</label>
              <input id="jobName" name="jobName" type="text" placeholder="e.g. Frontend Engineer"
                value={form.jobName} onChange={handleChange} required autoFocus />
            </div>
            <div className={styles.field}>
              <label htmlFor="companyName">Company *</label>
              <input id="companyName" name="companyName" type="text" placeholder="e.g. Airbnb"
                value={form.companyName} onChange={handleChange} required />
            </div>
          </div>

          <div className={styles.formRow2}>
            <div className={styles.field}>
              <label htmlFor="jobLink">Job Link *</label>
              <input id="jobLink" name="jobLink" type="url" placeholder="https://..."
                value={form.jobLink} onChange={handleChange} required />
            </div>
            <div className={styles.field}>
              <label htmlFor="status">Status</label>
              <select id="status" name="status" value={form.status} onChange={handleChange}>
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{STATUS_CONFIG[s].icon} {s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="notes">Notes</label>
            <textarea id="notes" name="notes" rows={3} placeholder="Any notes about this role, recruiter name, next steps…"
              value={form.notes} onChange={handleChange} />
          </div>

          <div className={styles.modalActions}>
            <button type="button" className={styles.btnGhost} onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={saving}>
              {saving ? <><span className={styles.btnSpinner} />Saving…</> : (editing ? 'Update Application' : 'Add Application')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── File upload cell ─────────────────────────────────────────────────────────

interface UploadCellProps {
  app: ApplicationData;
  uploading: boolean;
  onUpload: (app: ApplicationData, file: File) => Promise<void>;
  onDownload: (app: ApplicationData) => Promise<void>;
  onDeleteResume: (app: ApplicationData) => Promise<void>;
}

const ResumeCell: React.FC<UploadCellProps> = ({ app, uploading, onUpload, onDownload, onDeleteResume }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) { setFileError('PDF / DOC / DOCX only'); return; }
    if (file.size > 10 * 1024 * 1024)  { setFileError('Max 10 MB'); return; }
    setFileError(null);
    await onUpload(app, file);
    if (inputRef.current) inputRef.current.value = '';
  };

  if (hasResume(app)) {
    return (
      <div className={styles.resumeCell}>
        <button className={styles.resumeDownload} onClick={() => onDownload(app)} title="Download resume">
          📄 Resume
        </button>
        <button className={styles.resumeDelete} onClick={() => onDeleteResume(app)} title="Remove resume">
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className={styles.resumeCell}>
      <input ref={inputRef} type="file" id={`upload-${app.id}`} accept=".pdf,.doc,.docx"
        onChange={handleFile} className={styles.hiddenFileInput} />
      <label htmlFor={`upload-${app.id}`} className={`${styles.resumeUploadBtn} ${uploading ? styles.uploading : ''}`}>
        {uploading ? <><span className={styles.btnSpinner} />Uploading</> : '⬆ Upload'}
      </label>
      {fileError && <span className={styles.fileError}>{fileError}</span>}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const Applications: React.FC = () => {
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen]   = useState(false);
  const [editingApp, setEditingApp] = useState<ApplicationData | null>(null);
  const [savingModal, setSavingModal] = useState(false);
  const [modalError, setModalError]  = useState<string | null>(null);

  // Filters
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState<AppStatus | 'All'>('All');

  // Per-row states
  const [uploadingId, setUploadingId]     = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId]       = useState<string | null>(null);

  // Load
  const loadApplications = useCallback(async () => {
    try {
      setLoading(true);
      setPageError(null);
      const res = await applicationsApi.getAll();
      setApplications(res.applications);
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadApplications(); }, [loadApplications]);

  // ── Computed ──────────────────────────────────────────────────────────────

  const filtered = applications.filter(app => {
    const q = search.toLowerCase();
    const matchQ = !q || app.jobName.toLowerCase().includes(q) || app.companyName.toLowerCase().includes(q);
    const matchS = statusFilter === 'All' || app.status === statusFilter;
    return matchQ && matchS;
  });

  const counts: Record<AppStatus | 'total', number> = {
    total:       applications.length,
    Applied:     applications.filter(a => a.status === 'Applied').length,
    Interview:   applications.filter(a => a.status === 'Interview').length,
    Accepted:    applications.filter(a => a.status === 'Accepted').length,
    Rejected:    applications.filter(a => a.status === 'Rejected').length,
    'Timed out': applications.filter(a => a.status === 'Timed out').length,
    Processed:   applications.filter(a => a.status === 'Processed').length,
  };

  // ── CRUD handlers ─────────────────────────────────────────────────────────

  const openAdd = () => { setEditingApp(null); setModalError(null); setModalOpen(true); };
  const openEdit = (app: ApplicationData) => { setEditingApp(app); setModalError(null); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingApp(null); };

  const handleSave = async (form: FormState) => {
    setSavingModal(true);
    setModalError(null);
    try {
      if (editingApp) {
        const updated = await applicationsApi.update(editingApp.id, form);
        setApplications(prev => prev.map(a => a.id === updated.id ? updated : a));
      } else {
        const created = await applicationsApi.create(form);
        setApplications(prev => [...prev, created]);
      }
      closeModal();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSavingModal(false);
    }
  };

  const handleDeleteRequest = (id: string) => setConfirmDeleteId(id);
  const handleDeleteCancel  = () => setConfirmDeleteId(null);

  const handleDeleteConfirm = async (id: string) => {
    setDeletingId(id);
    setConfirmDeleteId(null);
    try {
      await applicationsApi.delete(id);
      setApplications(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpload = async (app: ApplicationData, file: File) => {
    setUploadingId(app.id);
    try {
      const result = await resumeFileApi.upload(app.id, file);
      setApplications(prev => prev.map(a => a.id === app.id ? { ...a, resumeFilePath: result.resumeFilePath } : a));
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingId(null);
    }
  };

  const handleDownload = async (app: ApplicationData) => {
    try {
      const blob = await resumeFileApi.download(app.id);
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `${app.companyName}_${app.jobName}_resume.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Download failed');
    }
  };

  const handleDeleteResume = async (app: ApplicationData) => {
    try {
      await resumeFileApi.delete(app.id);
      setApplications(prev => prev.map(a => a.id === app.id ? { ...a, resumeFilePath: undefined } : a));
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Resume delete failed');
    }
  };

  // ── Status filter helper ──────────────────────────────────────────────────

  const setStatusAndClear = (s: AppStatus | 'All') => {
    setStatusFilter(s);
    setSearch('');
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={styles.page}>
      {/* ─── Page Header ─── */}
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageEyebrow}>Tracking</p>
          <h1 className={styles.pageTitle}>Job Applications</h1>
          <p className={styles.pageSubtitle}>
            {applications.length === 0
              ? 'Start tracking your job search journey.'
              : `${applications.length} application${applications.length === 1 ? '' : 's'} tracked`}
          </p>
        </div>
        <button className={styles.btnAddPrimary} onClick={openAdd}>
          <span>＋</span> New Application
        </button>
      </div>

      {/* ─── Error Banner ─── */}
      {pageError && (
        <div className={styles.errorBanner}>
          <span>⚠️ {pageError}</span>
          <button onClick={() => setPageError(null)} className={styles.errorDismiss} aria-label="Dismiss">✕</button>
        </div>
      )}

      {/* ─── Stats Strip ─── */}
      {!loading && applications.length > 0 && (
        <div className={styles.statsStrip}>
          {STAT_CARDS.map(card => (
            <button
              key={card.key}
              className={`${styles.statCard} ${card.gradientClass} ${statusFilter === card.key ? styles.statCardActive : ''}`}
              onClick={() => setStatusAndClear(card.key === 'total' ? 'All' : card.key as AppStatus)}
            >
              <span className={styles.statIcon}>{card.icon}</span>
              <span className={styles.statValue}>{counts[card.key]}</span>
              <span className={styles.statLabel}>{card.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* ─── Filter Bar ─── */}
      {!loading && applications.length > 0 && (
        <div className={styles.filterBar}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="search"
              placeholder="Search by job title or company…"
              className={styles.searchInput}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className={styles.searchClear} onClick={() => setSearch('')} aria-label="Clear search">✕</button>
            )}
          </div>

          <div className={styles.filterPills}>
            <button
              className={`${styles.filterPill} ${statusFilter === 'All' ? styles.filterPillActive : ''}`}
              onClick={() => setStatusFilter('All')}
            >
              All
            </button>
            {STATUS_OPTIONS.map(s => (
              <button
                key={s}
                className={`${styles.filterPill} ${statusFilter === s ? styles.filterPillActive : ''} ${STATUS_CONFIG[s].colorClass}`}
                onClick={() => setStatusFilter(s)}
              >
                {STATUS_CONFIG[s].icon} {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── Content ─── */}
      {loading ? (
        <div className={styles.loadingState}>
          <span className={styles.loadSpinner} />
          Loading applications…
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIllustration}>
            {applications.length === 0 ? '🗂️' : '🔍'}
          </div>
          <h3 className={styles.emptyTitle}>
            {applications.length === 0 ? 'No applications yet' : 'No results found'}
          </h3>
          <p className={styles.emptyText}>
            {applications.length === 0
              ? 'Click "New Application" to start tracking your job search.'
              : 'Try adjusting your search or filter.'}
          </p>
          {applications.length === 0 && (
            <button className={styles.btnPrimary} onClick={openAdd}>＋ New Application</button>
          )}
          {applications.length > 0 && (
            <button className={styles.btnGhost} onClick={() => { setSearch(''); setStatusFilter('All'); }}>
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          {/* ── Table Head ── */}
          <div className={styles.tableHead}>
            <div className={styles.colCompany}>Company / Role</div>
            <div className={styles.colStatus}>Status</div>
            <div className={styles.colResume}>Resume</div>
            <div className={styles.colLink}>Link</div>
            <div className={styles.colNotes}>Notes</div>
            <div className={styles.colActions}>Actions</div>
          </div>

          {/* ── Rows ── */}
          <div className={styles.tableBody}>
            {filtered.map(app => (
              <div
                key={app.id}
                className={`${styles.tableRow} ${deletingId === app.id ? styles.rowDeleting : ''}`}
              >
                {/* Company + Role */}
                <div className={`${styles.colCompany} ${styles.companyCell}`}>
                  <div className={`${styles.companyAvatar} ${styles[`avatar${app.companyName[0]?.toUpperCase() || 'A'}`] ?? styles.avatarDefault}`}>
                    {initials(app.companyName)}
                  </div>
                  <div className={styles.companyInfo}>
                    <span className={styles.jobTitle}>{app.jobName}</span>
                    <span className={styles.companyName}>{app.companyName}</span>
                  </div>
                </div>

                {/* Status */}
                <div className={styles.colStatus}>
                  <span className={`${styles.statusBadge} ${STATUS_CONFIG[app.status]?.colorClass ?? ''}`}>
                    {STATUS_CONFIG[app.status]?.icon} {app.status}
                  </span>
                </div>

                {/* Resume */}
                <div className={styles.colResume}>
                  <ResumeCell
                    app={app}
                    uploading={uploadingId === app.id}
                    onUpload={handleUpload}
                    onDownload={handleDownload}
                    onDeleteResume={handleDeleteResume}
                  />
                </div>

                {/* Link */}
                <div className={styles.colLink}>
                  <a href={app.jobLink} target="_blank" rel="noopener noreferrer"
                    className={styles.jobLinkBtn} title="View job posting">
                    🔗 View
                  </a>
                </div>

                {/* Notes */}
                <div className={styles.colNotes}>
                  <span className={styles.notesText} title={app.notes || ''}>
                    {app.notes || <span className={styles.noNotes}>—</span>}
                  </span>
                </div>

                {/* Actions */}
                <div className={styles.colActions}>
                  {confirmDeleteId === app.id ? (
                    <div className={styles.confirmDelete}>
                      <span className={styles.confirmText}>Delete?</span>
                      <button className={styles.confirmYes} onClick={() => handleDeleteConfirm(app.id)}>Yes</button>
                      <button className={styles.confirmNo} onClick={handleDeleteCancel}>No</button>
                    </div>
                  ) : (
                    <>
                      <button className={styles.actionEdit} onClick={() => openEdit(app)} title="Edit">✏️</button>
                      <button className={styles.actionDelete} onClick={() => handleDeleteRequest(app.id)} title="Delete">🗑️</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ── Footer count ── */}
          <div className={styles.tableFooter}>
            Showing {filtered.length} of {applications.length} application{applications.length !== 1 ? 's' : ''}
            {statusFilter !== 'All' && <> · Filtered by <strong>{statusFilter}</strong></>}
          </div>
        </div>
      )}

      {/* ─── Add/Edit Modal ─── */}
      <ApplicationModal
        open={modalOpen}
        editing={editingApp}
        onClose={closeModal}
        onSave={handleSave}
        saving={savingModal}
        error={modalError}
      />
    </div>
  );
};

export default Applications;
