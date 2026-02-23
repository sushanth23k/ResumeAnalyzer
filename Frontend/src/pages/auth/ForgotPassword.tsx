import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { passwordResetApi } from '../../services/authApi';
import styles from './auth.module.css';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await passwordResetApi(email);
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.iconPanel}>
            <div className={styles.bigIcon}>📬</div>
            <h1 className={styles.title}>Check your inbox</h1>
            <p className={styles.bodyText}>
              If <span className={styles.boldEmail}>{email}</span> is registered, you'll receive
              a password reset link shortly.
            </p>
          </div>
          <div className={styles.links}>
            <p className={styles.link}>
              <Link to="/auth/login"><span>Back to sign in</span></Link>
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
        <h1 className={styles.title}>Reset your password</h1>
        <p className={styles.subtitle}>Enter your email and we'll send a reset link</p>

        {error && <div className={`${styles.alert} ${styles.alertError}`}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              className={styles.input}
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading && <span className={styles.spinner} />}
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>

        <div className={styles.links}>
          <p className={styles.link}>
            Remembered it?{' '}
            <Link to="/auth/login"><span>Sign in</span></Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
