import React, { useState } from 'react';
import SEO from '../../components/SEO/SEO';
import { useLanguage } from '../../hooks/useLanguage';
import CTA from '../../components/CTA/CTA';
import styles from './ContactPage.module.css';

const ContactPage = ({ onOpenContact, onOpenRegistration }) => {
  const { lang } = useLanguage();
  const isHi = lang === 'hi';

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    district: '',
    role: 'Student / Citizen',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  const contactSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact Bihar AI Mission',
    description: 'Official contact desk for Bihar AI Mission civic initiatives, masterclass certifications, officer training programs, and district partnerships.',
    url: 'https://biharaimission.org/contact',
    mainEntity: {
      '@type': 'Organization',
      name: 'Bihar AI Mission',
      telephone: '+91-612-2215000',
      email: 'contact@biharaimission.org',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Bailey Road, Technology Corridor',
        addressLocality: 'Patna',
        addressRegion: 'Bihar',
        postalCode: '800001',
        addressCountry: 'IN'
      }
    }
  };

  return (
    <div className={styles.pageContainer}>
      <SEO
        title={isHi ? "संपर्क करें — बिहार AI मिशन | आधिकारिक सहायता केंद्र" : "Contact Us — Bihar AI Mission | Official Helpdesk & Inquiries"}
        description={isHi ? "बिहार AI मिशन आधिकारिक सहायता केंद्र। प्रमाणन पूछताछ, सरकारी प्रशिक्षण, और जिला AI कार्यक्रमों के लिए संपर्क करें।" : "Official contact desk for Bihar AI Mission. Connect with our team for masterclass verification, government officer training, district analytics labs, and civic partnerships."}
        canonical="https://biharaimission.org/contact"
        keywords="Contact Bihar AI Mission, Bihar AI Helpdesk, AI Certification Support Bihar, Patna AI Office, Officer AI Program Inquiries"
        schema={contactSchema}
      />

      <div className={styles.innerWrap}>
        {/* HEADER BADGE & TITLE */}
        <div className={styles.headerWrap}>
          <div className={styles.badgePill}>
            <span>📍</span>
            <span>{isHi ? 'आधिकारिक संपर्क केंद्र' : 'Official Helpdesk & Inquiries'}</span>
          </div>

          <h1 className={styles.pageTitle}>
            {isHi ? 'बिहार AI मिशन से संपर्क करें' : 'Get in Touch with Bihar AI Mission'}
          </h1>

          <p className={styles.pageSubtitle}>
            {isHi
              ? 'चाहे आप AI प्रमाणन के संबंध में जानकारी चाहते हों, अपने विभाग में अधिकारी प्रशिक्षण कार्यक्रम आयोजित करना चाहते हों, या अपनी संस्था के साथ साझेदारी करना चाहते हों — हमारी टीम आपकी सहायता के लिए सदैव उपलब्ध है।'
              : 'Whether you are inquiring about Level 1 Masterclass certifications, scheduling executive officer cohorts for your department, or seeking civic technology partnerships across Bihar’s 38 districts — we are here to support you.'}
          </p>
        </div>

        {/* 3 CORE TRUST CARDS */}
        <div className={styles.cardsGrid}>
          {/* Card 1: Official Email & Communications */}
          <div className={styles.trustCard}>
            <div className={styles.cardIcon}>✉️</div>
            <h3 className={styles.cardTitle}>
              {isHi ? 'ईमेल संचार' : 'Official Electronic Mail'}
            </h3>
            <p className={styles.cardText}>
              {isHi ? 'सामान्य पूछताछ, प्रमाणन सत्यापन और साझेदारी प्रस्तावों के लिए:' : 'For general inquiries, credential verification assistance, and institutional tie-ups:'}
            </p>
            <div className={styles.emailPill}>
              <a href="mailto:contact@biharaimission.org" style={{ color: 'inherit', textDecoration: 'none' }}>
                contact@biharaimission.org
              </a>
            </div>
            <div className={styles.cardNote}>
              ⚡ Typical response time: Under 24 business hours
            </div>
          </div>

          {/* Card 2: Physical Headquarters */}
          <div className={styles.trustCard}>
            <div className={styles.cardIcon}>🏛️</div>
            <h3 className={styles.cardTitle}>
              {isHi ? 'मुख्यालय एवं प्रशासनिक कार्यालय' : 'Secretariat & Liaison Office'}
            </h3>
            <p className={styles.cardText}>
              {isHi ? 'पटना में स्थित प्रशासनिक व नागरिक समन्वय केंद्र:' : 'Central administration and civic coordination desk in the state capital:'}
            </p>
            <div style={{ fontSize: '14px', color: 'var(--color-ink, #181512)', lineHeight: 1.5, fontWeight: '600' }}>
              Technology Innovation Corridor<br />
              Bailey Road, Patna, Bihar — 800001, India
            </div>
            <div className={styles.cardNote}>
              🕒 Working Hours: Monday – Saturday, 9:30 AM – 6:00 PM IST
            </div>
          </div>

          {/* Card 3: District Network & Helplines */}
          <div className={styles.trustCard}>
            <div className={styles.cardIcon}>🌐</div>
            <h3 className={styles.cardTitle}>
              {isHi ? '38 जिला समन्वयक नेटवर्क' : '38-District Outreach Network'}
            </h3>
            <p className={styles.cardText}>
              {isHi ? 'बिहार के सभी 38 जिलों में फैले डिजिटल स्वयंसेवक और AI मेंटर्स:' : 'Supporting state-wide AI literacy across Patna, Gaya, Muzaffarpur, Bhagalpur, Darbhanga and beyond:'}
            </p>
            <div style={{ fontSize: '14px', color: '#10B981', fontWeight: '800', fontFamily: "var(--font-mono, 'Space Mono', monospace)" }}>
              ✓ All 38 Districts Covered
            </div>
            <div className={styles.cardNote}>
              District Analytics Labs active for governance automation
            </div>
          </div>
        </div>

        {/* DIRECT INQUIRY FORM */}
        <div className={styles.formContainer}>
          <h2 className={styles.formTitle}>
            {isHi ? 'त्वरित संदेश भेजें' : 'Send an Official Inquiry'}
          </h2>
          <p className={styles.formSubtitle}>
            {isHi
              ? 'प्रमाणन सहायता, कॉलेज भागीदारी या सरकारी कार्यशालाओं के लिए नीचे विवरण भरें।'
              : 'Fill in your details below for exam support, educational tie-ups, or departmental executive briefings.'}
          </p>

          {formSubmitted ? (
            <div className={styles.successBox}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>✅</div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '6px' }}>Inquiry Dispatched Successfully</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-ink-muted, #5E554D)', margin: 0 }}>
                Thank you for connecting with Bihar AI Mission. Our coordination officer will review your request and reach out within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.formGrid}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rameshwar Kumar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={styles.fieldInput}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  Official / Personal Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@domain.gov.in or personal"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={styles.fieldInput}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  Phone / WhatsApp
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={styles.fieldInput}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  Your Category / Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className={styles.fieldSelect}
                >
                  <option value="Government Officer / Administrative Staff">Government Officer / Administrative Staff</option>
                  <option value="Student / University Researcher">Student / University Researcher</option>
                  <option value="Educator / College Faculty">Educator / College Faculty</option>
                  <option value="Startup Founder / Entrepreneur">Startup Founder / Entrepreneur</option>
                  <option value="General Citizen / AI Aspirant">General Citizen / AI Aspirant</option>
                </select>
              </div>

              <div className={`${styles.fieldGroup} ${styles.fullWidthField}`}>
                <label className={styles.fieldLabel}>
                  Inquiry Message / Requirement Details *
                </label>
                <textarea
                  rows="4"
                  required
                  placeholder="Describe your query, certification assistance need, or partnership proposal..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className={styles.fieldTextarea}
                />
              </div>

              <div className={styles.fullWidthField} style={{ marginTop: '8px' }}>
                <button
                  type="submit"
                  className={styles.submitBtn}
                >
                  {isHi ? 'संदेश सबमिट करें →' : 'Submit Official Inquiry →'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* FREQUENTLY ANSWERED CONTACT QUESTIONS */}
        <div className={styles.faqSection}>
          <h2 className={styles.faqTitle}>
            Frequently Asked Queries
          </h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <div className={styles.faqQuestion}>
                How do I verify a certificate issued by Bihar AI Mission?
              </div>
              <div className={styles.faqAnswer}>
                All official certificates have a unique Credential ID (e.g. BAIM-CERT-xxxxxx) and QR code. You can verify any certificate immediately on our public Learning Hub at <a href="/learning" style={{ color: 'var(--color-terracotta-500, #C1552C)', textDecoration: 'underline' }}>biharaimission.org/learning</a>.
              </div>
            </div>

            <div className={styles.faqItem}>
              <div className={styles.faqQuestion}>
                Are the Level 1 certifications free for Bihar students and officers?
              </div>
              <div className={styles.faqAnswer}>
                Yes. The Level 1 Masterclass examinations, AI prompt libraries, and foundational digital credentials are provided free of cost as part of Bihar’s civic technology literacy roadmap.
              </div>
            </div>

            <div className={styles.faqItem}>
              <div className={styles.faqQuestion}>
                How can educational institutions or government departments arrange a cohort?
              </div>
              <div className={styles.faqAnswer}>
                Institutions can send an email directly to <a href="mailto:contact@biharaimission.org" style={{ color: 'var(--color-terracotta-500, #C1552C)', textDecoration: 'underline' }}>contact@biharaimission.org</a> with expected participant counts and preferred dates.
              </div>
            </div>
          </div>
        </div>
      </div>

      <CTA onOpenContact={onOpenContact} onOpenRegistration={onOpenRegistration} />
    </div>
  );
};

export default ContactPage;
