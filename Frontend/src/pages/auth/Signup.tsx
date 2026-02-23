import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './auth.module.css';

const Signup: React.FC = () => {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState('');

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!email) errs.email = 'Email is required';
    if (!password1) errs.password1 = 'Password is required';
    else if (password1.length < 8) errs.password1 = 'Password must be at least 8 characters';
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
    try {
      await register(email, password1, password2);
      navigate('/auth/verify-email-notice', { state: { email } });
    } catch (err: unknown) {
      setGlobalError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>📄</span>
          <span className={styles.logoText}>ResumeAnalyzer</span>
        </div>
        <h1 className={styles.title}>Create an account</h1>
        <p className={styles.subtitle}>Start building your perfect resume</p>

        {globalError && (
          <div className={`${styles.alert} ${styles.alertError}`}>{globalError}</div>
        )}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
            />
            {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password1">Password</label>
            <input
              id="password1"
              type="password"
              className={`${styles.input} ${errors.password1 ? styles.inputError : ''}`}
              placeholder="Min. 8 characters"
              value={password1}
              onChange={e => setPassword1(e.target.value)}
              required
              autoComplete="new-password"
            />
            {errors.password1 && <span className={styles.fieldError}>{errors.password1}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password2">Confirm password</label>
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

          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading && <span className={styles.spinner} />}
            {isLoading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <div className={styles.links}>
          <p className={styles.link}>
            Already have an account?{' '}
            <Link to="/auth/login"><span>Sign in</span></Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
