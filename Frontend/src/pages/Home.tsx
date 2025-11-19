import React from 'react'
import styles from './Home.module.css'

interface HomeProps {
  className?: string
}

interface Feature {
  id: number
  title: string
  description: string
  icon: string
}

const Home: React.FC<HomeProps> = ({ className }) => {
  const features: Feature[] = [
    {
      id: 1,
      title: 'Smart Analysis',
      description: 'Advanced AI-powered resume analysis to identify key skills and qualifications.',
      icon: '🔍'
    },
    {
      id: 2,
      title: 'Instant Feedback',
      description: 'Get immediate insights and recommendations to improve your resume.',
      icon: '⚡'
    },
    {
      id: 3,
      title: 'ATS Optimization',
      description: 'Ensure your resume passes Applicant Tracking Systems with our optimization tools.',
      icon: '✨'
    }
  ]

  return (
    <div className={`${styles.home} ${className || ''}`}>
      <section className={styles.hero}>
        <h1 className={styles.title}>Welcome to Resume Analyzer</h1>
        <p className={styles.subtitle}>
          Transform your resume with AI-powered insights and land your dream job
        </p>
        <button className={styles.ctaButton}>Get Started</button>
      </section>

      <section className={styles.features}>
        <h2 className={styles.featuresTitle}>Why Choose Us?</h2>
        <div className={styles.featuresGrid}>
          {features.map((feature) => (
            <div key={feature.id} className={styles.featureCard}>
              <div className={styles.featureIcon}>{feature.icon}</div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home

