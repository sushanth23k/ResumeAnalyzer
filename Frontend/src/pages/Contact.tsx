import React, { useState } from 'react'
import styles from './Contact.module.css'

interface ContactProps {
  className?: string
}

interface FormData {
  name: string
  email: string
  subject: string
  message: string
}

interface ContactInfo {
  id: number
  type: string
  value: string
  icon: string
}

const Contact: React.FC<ContactProps> = ({ className }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const contactInfo: ContactInfo[] = [
    {
      id: 1,
      type: 'Email',
      value: 'support@resumeanalyzer.com',
      icon: '📧'
    },
    {
      id: 2,
      type: 'Phone',
      value: '+1 (555) 123-4567',
      icon: '📞'
    },
    {
      id: 3,
      type: 'Address',
      value: '123 Tech Street, San Francisco, CA 94105',
      icon: '📍'
    }
  ]

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    // Add your form submission logic here
    alert('Thank you for your message! We will get back to you soon.')
    setFormData({ name: '', email: '', subject: '', message: '' })
  }

  return (
    <div className={`${styles.contact} ${className || ''}`}>
      <section className={styles.header}>
        <h1 className={styles.title}>Contact Us</h1>
        <p className={styles.subtitle}>
          Have questions? We'd love to hear from you. Send us a message and we'll 
          respond as soon as possible.
        </p>
      </section>

      <div className={styles.content}>
        <section className={styles.formSection}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="subject" className={styles.label}>Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="message" className={styles.label}>Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                className={styles.textarea}
                rows={5}
                required
              />
            </div>

            <button type="submit" className={styles.submitButton}>
              Send Message
            </button>
          </form>
        </section>

        <section className={styles.infoSection}>
          <h2 className={styles.infoTitle}>Get In Touch</h2>
          <div className={styles.infoList}>
            {contactInfo.map((info) => (
              <div key={info.id} className={styles.infoItem}>
                <span className={styles.infoIcon}>{info.icon}</span>
                <div className={styles.infoDetails}>
                  <h3 className={styles.infoType}>{info.type}</h3>
                  <p className={styles.infoValue}>{info.value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default Contact

