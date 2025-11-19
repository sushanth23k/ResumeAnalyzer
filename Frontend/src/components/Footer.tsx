import React from 'react'
import styles from './Footer.module.css'

interface FooterLink {
  url: string
  label: string
}

interface FooterProps {
  className?: string
  copyrightText?: string
}

const Footer: React.FC<FooterProps> = ({ 
  className, 
  copyrightText = '© 2025 Resume Analyzer. All rights reserved.' 
}) => {
  const footerLinks: FooterLink[] = [
    { url: '/privacy', label: 'Privacy Policy' },
    { url: '/terms', label: 'Terms of Service' },
    { url: '/contact', label: 'Contact Us' }
  ]

  return (
    <footer className={`${styles.footer} ${className || ''}`}>
      <div className={styles.container}>
        <div className={styles.content}>
          <p className={styles.copyright}>{copyrightText}</p>
          <div className={styles.links}>
            {footerLinks.map((link, index) => (
              <React.Fragment key={link.url}>
                <a href={link.url} className={styles.link}>
                  {link.label}
                </a>
                {index < footerLinks.length - 1 && (
                  <span className={styles.separator}>|</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

