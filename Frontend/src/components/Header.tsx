import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Header.module.css';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/applications', label: 'Applications' },
    { path: '/applicant-info', label: 'Applicant Info' },
    { path: '/resume-generator', label: 'Resume Generator' },
  ];

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    navigate('/auth/login', { replace: true });
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link to="/">Resume Analyzer</Link>
        </div>

        <nav className={styles.nav}>
          <ul className={styles.navList}>
            {navItems.map(item => (
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

        <div className={styles.userArea}>
          {user && (
            <span className={styles.userEmail} title={user.email}>
              {user.email}
            </span>
          )}
          <button
            className={styles.logoutBtn}
            onClick={handleLogout}
            disabled={loggingOut}
            aria-label="Logout"
          >
            {loggingOut ? '…' : 'Logout'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
