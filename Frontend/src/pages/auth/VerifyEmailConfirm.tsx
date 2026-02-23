import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { verifyEmailApi } from '../../services/authApi';
import styles from './auth.module.css';

const VerifyEmailConfirm: React.FC = () => {
  const { key } = useParams<{ key: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!key) {
      setStatus('error');
      setMessage('Invalid verification link.');
      return;
    }
    verifyEmailApi(key)
      .then(() => setStatus('success'))
      .catch((err: unknown) => {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Verification failed.');
      });
  }, [key]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.iconPanel}>
          {status === 'loading' && (
            <>
              <div className={styles.bigIcon}>⏳</div>
              <h1 className={styles.title}>Verifying…</h1>
              <p className={styles.bodyText}>Please wait while we verify your email.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className={styles.bigIcon}>✅</div>
              <h1 className={styles.title}>Email verified!</h1>
              <p className={styles.bodyText}>
                Your account is now active. You can sign in.
              </p>
              <Link to="/auth/login">
                <button className={styles.submitBtn}>Go to sign in</button>
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className={styles.bigIcon}>❌</div>
              <h1 className={styles.title}>Verification failed</h1>
              <div className={`${styles.alert} ${styles.alertError}`} style={{ marginBottom: '1.5rem' }}>
                {message || 'The verification link is invalid or has expired.'}
              </div>
              <div className={styles.links}>
                <p className={styles.link}>
                  <Link to="/auth/verify-email-notice"><span>Request a new link</span></Link>
                </p>
                <p className={styles.link}>
                  <Link to="/auth/login"><span>Back to sign in</span></Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailConfirm;
