import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ResumeProvider } from './context/ResumeContext'
import Header from './components/Header'
import Footer from './components/Footer'
import Dashboard from './pages/Dashboard'
import Applications from './pages/Applications'
import ApplicantInfo from './pages/ApplicantInfo/ApplicantInfo'
import ResumeGenerator from './pages/ResumeGenerator/ResumeGenerator'
import styles from './App.module.css'
  
// Backend URL - used by api.ts service
export const BackendURL = "http://127.0.0.1:8000/"

const App: React.FC = () => {
  return (
    <ResumeProvider>
      <Router>
        <div className={styles.app}>
          <Header />
          <main className={styles.mainContent}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/applications" element={<Applications />} />
              <Route path="/applicant-info" element={<ApplicantInfo />} />
              <Route path="/resume-generator" element={<ResumeGenerator />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ResumeProvider>
  )
}

export default App

