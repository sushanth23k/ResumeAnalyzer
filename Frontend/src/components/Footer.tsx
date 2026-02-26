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
  copyrightText = '© 2025 Job Matrix. All rights reserved.' 
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
          <div className={styles.brand}>
            <span className={styles.brandName}>Job Matrix</span>
            <p className={styles.copyright}>{copyrightText}</p>
          </div>
          <div className={styles.links}>
            {footerLinks.map((link) => (
              <a key={link.url} href={link.url} className={styles.link}>
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

