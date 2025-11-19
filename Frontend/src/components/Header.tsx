import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import styles from './Header.module.css'

interface NavItem {
  path: string
  label: string
}

interface HeaderProps {
  className?: string
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  const navItems: NavItem[] = [
    { path: '/', label: 'Dashboard' },
    { path: '/applications', label: 'Applications' },
    { path: '/applicant-info', label: 'Applicant Info' },
    { path: '/resume-generator', label: 'Resume Generator' }
  ]

  return (
    <header className={`${styles.header} ${className || ''}`}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link to="/">Resume Analyzer</Link>
        </div>
        <nav className={styles.nav}>
          <ul className={styles.navList}>
            {navItems.map((item) => (
              <li key={item.path} className={styles.navItem}>
                <NavLink 
                  to={item.path} 
                  className={({ isActive }) => 
                    `${styles.navLink} ${isActive ? styles.active : ''}`
                  }
                  end={item.path === '/'}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header

