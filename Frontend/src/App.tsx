import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ResumeProvider } from './context/ResumeContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import styles from './App.module.css';

// ── Eagerly loaded (part of the initial auth flow) ───────
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

// ── Lazily loaded (split into separate chunks) ───────────
const Dashboard           = lazy(() => import('./pages/Dashboard'));
const Applications        = lazy(() => import('./pages/Applications'));
const ApplicantInfo       = lazy(() => import('./pages/ApplicantInfo/ApplicantInfo'));
const ResumeGenerator     = lazy(() => import('./pages/ResumeGenerator/ResumeGenerator'));
const VerifyEmailNotice   = lazy(() => import('./pages/auth/VerifyEmailNotice'));
const VerifyEmailConfirm  = lazy(() => import('./pages/auth/VerifyEmailConfirm'));
const ForgotPassword      = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPasswordConfirm = lazy(() => import('./pages/auth/ResetPasswordConfirm'));

const PageFallback: React.FC = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '0.75rem',
    color: 'var(--text-muted)',
    fontSize: 'var(--text-sm)',
  }}>
    <span style={{
      width: 20, height: 20,
      border: '2px solid var(--border-default)',
      borderTopColor: 'var(--color-primary)',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
      display: 'inline-block',
    }} />
    Loading…
  </div>
);

const App: React.FC = () => {
  return (
    <ThemeProvider>
    <AuthProvider>
      <ResumeProvider>
        <Router>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              {/* ── Public auth routes (no header/footer) ── */}
              <Route path="/auth/login"                element={<Login />} />
              <Route path="/auth/signup"               element={<Signup />} />
              <Route path="/auth/verify-email-notice"  element={<VerifyEmailNotice />} />
              <Route path="/auth/verify-email/:key"    element={<VerifyEmailConfirm />} />
              <Route path="/auth/forgot-password"      element={<ForgotPassword />} />
              <Route path="/auth/reset-password-confirm" element={<ResetPasswordConfirm />} />

              {/* ── Protected app routes (with header/footer) ── */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <div className={styles.app}>
                      <Header />
                      <main className={styles.mainContent}>
                        <Routes>
                          <Route path="/"                  element={<Dashboard />} />
                          <Route path="/applications"      element={<Applications />} />
                          <Route path="/applicant-info"    element={<ApplicantInfo />} />
                          <Route path="/resume-generator"  element={<ResumeGenerator />} />
                          <Route path="*"                  element={<Navigate to="/" replace />} />
                        </Routes>
                      </main>
                      <Footer />
                    </div>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </Router>
      </ResumeProvider>
    </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
