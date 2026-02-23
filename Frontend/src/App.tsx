import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ResumeProvider } from './context/ResumeContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Footer from './components/Footer';

// App pages
import Dashboard from './pages/Dashboard';
import Applications from './pages/Applications';
import ApplicantInfo from './pages/ApplicantInfo/ApplicantInfo';
import ResumeGenerator from './pages/ResumeGenerator/ResumeGenerator';

// Auth pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import VerifyEmailNotice from './pages/auth/VerifyEmailNotice';
import VerifyEmailConfirm from './pages/auth/VerifyEmailConfirm';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPasswordConfirm from './pages/auth/ResetPasswordConfirm';

import styles from './App.module.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ResumeProvider>
        <Router>
          <Routes>
            {/* ── Public auth routes (no header/footer) ── */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />
            <Route path="/auth/verify-email-notice" element={<VerifyEmailNotice />} />
            <Route path="/auth/verify-email/:key" element={<VerifyEmailConfirm />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
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
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/applications" element={<Applications />} />
                        <Route path="/applicant-info" element={<ApplicantInfo />} />
                        <Route path="/resume-generator" element={<ResumeGenerator />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </main>
                    <Footer />
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </ResumeProvider>
    </AuthProvider>
  );
};

export default App;
