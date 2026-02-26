import React from 'react'
import styles from './About.module.css'

interface AboutProps {
  className?: string
}

interface TeamMember {
  id: number
  name: string
  role: string
  bio: string
}

const About: React.FC<AboutProps> = ({ className }) => {
  const teamMembers: TeamMember[] = [
    {
      id: 1,
      name: 'John Doe',
      role: 'Founder & CEO',
      bio: 'Passionate about helping job seekers succeed with cutting-edge technology.'
    },
    {
      id: 2,
      name: 'Jane Smith',
      role: 'Lead Developer',
      bio: 'Expert in AI and machine learning with 10+ years of experience.'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      role: 'UX Designer',
      bio: 'Creating intuitive and beautiful user experiences for everyone.'
    }
  ]

  return (
    <div className={`${styles.about} ${className || ''}`}>
      <section className={styles.intro}>
        <h1 className={styles.title}>About Job Matrix</h1>
        <p className={styles.description}>
          We are a team of passionate professionals dedicated to helping job seekers 
          create outstanding resumes that get noticed. Our AI-powered platform analyzes 
          resumes in real-time, providing actionable feedback to improve your chances 
          of landing interviews.
        </p>
      </section>

      <section className={styles.mission}>
        <h2 className={styles.sectionTitle}>Our Mission</h2>
        <p className={styles.missionText}>
          To empower every job seeker with the tools and insights they need to create 
          professional, ATS-friendly resumes that showcase their unique strengths and 
          qualifications.
        </p>
      </section>

      <section className={styles.team}>
        <h2 className={styles.sectionTitle}>Meet Our Team</h2>
        <div className={styles.teamGrid}>
          {teamMembers.map((member) => (
            <div key={member.id} className={styles.teamCard}>
              <div className={styles.avatar}>
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h3 className={styles.memberName}>{member.name}</h3>
              <p className={styles.memberRole}>{member.role}</p>
              <p className={styles.memberBio}>{member.bio}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default About

