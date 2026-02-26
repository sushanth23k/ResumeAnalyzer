import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import styles from './Header.module.css';
import logo from '../static/icons/image.png';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '⊞' },
    { path: '/applications', label: 'Applications', icon: '📋' },
    { path: '/applicant-info', label: 'Profile', icon: '👤' },
    { path: '/resume-generator', label: 'Generator', icon: '✦' },
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
          <Link to="/">
            <img src={logo} alt="Resume Analyzer" className={styles.logoMark} />
          </Link>
        </div>

        <nav className={styles.nav} aria-label="Main navigation">
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

        <div className={styles.controls}>
          <button
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            <span className={styles.themeTrack}>
              <span className={styles.themeThumb}>
                {isDark ? '🌙' : '☀️'}
              </span>
            </span>
          </button>

          {user && (
            <div className={styles.userAvatar} title={user.email} aria-hidden="true">
              {user.email.charAt(0).toUpperCase()}
            </div>
          )}

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
            {loggingOut ? '…' : 'Sign out'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
