import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { passwordResetConfirmApi } from '../../services/authApi';
import styles from './auth.module.css';

const ResetPasswordConfirm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const uid = searchParams.get('uid') ?? '';
  const token = searchParams.get('token') ?? '';

  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (password1.length < 8) errs.password1 = 'Password must be at least 8 characters';
    if (password1 !== password2) errs.password2 = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError('');
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await passwordResetConfirmApi(uid, token, password1, password2);
      navigate('/auth/login', { state: { message: 'Password reset successful. Please sign in.' } });
    } catch (err: unknown) {
      setGlobalError(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  if (!uid || !token) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.iconPanel}>
            <div className={styles.bigIcon}>❌</div>
            <h1 className={styles.title}>Invalid link</h1>
            <p className={styles.bodyText}>
              This password reset link is invalid or has expired.
            </p>
          </div>
          <div className={styles.links}>
            <p className={styles.link}>
              <Link to="/auth/forgot-password"><span>Request a new link</span></Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>📄</span>
          <span className={styles.logoText}>ResumeAnalyzer</span>
        </div>
        <h1 className={styles.title}>Set new password</h1>
        <p className={styles.subtitle}>Choose a strong password for your account</p>

        {globalError && (
          <div className={`${styles.alert} ${styles.alertError}`}>{globalError}</div>
        )}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="password1">New password</label>
            <input
              id="password1"
              type="password"
              className={`${styles.input} ${errors.password1 ? styles.inputError : ''}`}
              placeholder="Min. 8 characters"
              value={password1}
              onChange={e => setPassword1(e.target.value)}
              required
              autoComplete="new-password"
              autoFocus
            />
            {errors.password1 && <span className={styles.fieldError}>{errors.password1}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password2">Confirm new password</label>
            <input
              id="password2"
              type="password"
              className={`${styles.input} ${errors.password2 ? styles.inputError : ''}`}
              placeholder="Repeat your password"
              value={password2}
              onChange={e => setPassword2(e.target.value)}
              required
              autoComplete="new-password"
            />
            {errors.password2 && <span className={styles.fieldError}>{errors.password2}</span>}
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading && <span className={styles.spinner} />}
            {loading ? 'Resetting…' : 'Reset password'}
          </button>
        </form>

        <div className={styles.links}>
          <p className={styles.link}>
            <Link to="/auth/login"><span>Back to sign in</span></Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordConfirm;
