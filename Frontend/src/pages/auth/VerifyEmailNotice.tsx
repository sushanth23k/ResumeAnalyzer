import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { resendVerificationApi } from '../../services/authApi';
import styles from './auth.module.css';

const VerifyEmailNotice: React.FC = () => {
  const location = useLocation();
  const email = (location.state as { email?: string })?.email ?? '';

  const [resent, setResent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleResend = async () => {
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      await resendVerificationApi(email);
      setResent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to resend');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.iconPanel}>
          <div className={styles.bigIcon}>✉️</div>
          <h1 className={styles.title}>Check your inbox</h1>
          <p className={styles.bodyText}>
            We sent a verification link to{' '}
            {email && <span className={styles.boldEmail}>{email}</span>}.
            {!email && 'your email address.'}
            {' '}Click the link to activate your account.
          </p>

          {error && (
            <div className={`${styles.alert} ${styles.alertError}`} style={{ marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          {resent && (
            <div className={`${styles.alert} ${styles.alertSuccess}`} style={{ marginBottom: '1rem' }}>
              Verification email resent successfully.
            </div>
          )}

          <div className={`${styles.alert} ${styles.alertInfo}`}>
            Didn't receive it? Check your spam folder, or{' '}
            <button
              onClick={handleResend}
              disabled={loading || resent}
              style={{
                background: 'none',
                border: 'none',
                color: '#646cff',
                fontWeight: 600,
                cursor: loading || resent ? 'not-allowed' : 'pointer',
                padding: 0,
                font: 'inherit',
                textDecoration: 'underline',
              }}
            >
              {loading ? 'Sending…' : 'resend the email'}
            </button>
            .
          </div>
        </div>

        <div className={styles.links}>
          <p className={styles.link}>
            Already verified?{' '}
            <Link to="/auth/login"><span>Sign in</span></Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailNotice;
