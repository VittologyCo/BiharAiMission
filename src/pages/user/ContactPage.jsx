import React, { useState } from 'react';
import SEO from '../../components/SEO/SEO';
import { useLanguage } from '../../hooks/useLanguage';
import CTA from '../../components/CTA/CTA';

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
    <div style={{ background: 'var(--color-charcoal-900, #14110F)', color: '#FFFFFF', minHeight: '100vh', paddingTop: '110px' }}>
      <SEO
        title={isHi ? "संपर्क करें — बिहार AI मिशन | आधिकारिक सहायता केंद्र" : "Contact Us — Bihar AI Mission | Official Helpdesk & Inquiries"}
        description={isHi ? "बिहार AI मिशन आधिकारिक सहायता केंद्र। प्रमाणन पूछताछ, सरकारी प्रशिक्षण, और जिला AI कार्यक्रमों के लिए संपर्क करें।" : "Official contact desk for Bihar AI Mission. Connect with our team for masterclass verification, government officer training, district analytics labs, and civic partnerships."}
        canonical="https://biharaimission.org/contact"
        keywords="Contact Bihar AI Mission, Bihar AI Helpdesk, AI Certification Support Bihar, Patna AI Office, Officer AI Program Inquiries"
        schema={contactSchema}
      />

      <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '0 24px 60px' }}>
        {/* HEADER BADGE & TITLE */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '9999px',
            background: 'rgba(193, 85, 44, 0.15)',
            border: '1px solid rgba(226, 139, 92, 0.35)',
            color: '#F5AF87',
            fontSize: '13px',
            fontWeight: '700',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: '16px'
          }}>
            <span>📍</span>
            <span>{isHi ? 'आधिकारिक संपर्क केंद्र' : 'Official Helpdesk & Inquiries'}</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: '900',
            fontFamily: "var(--font-display, 'Fraunces', serif)",
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            color: '#FFFFFF',
            margin: '0 0 16px 0'
          }}>
            {isHi ? 'बिहार AI मिशन से संपर्क करें' : 'Get in Touch with Bihar AI Mission'}
          </h1>

          <p style={{
            fontSize: '17px',
            lineHeight: 1.6,
            color: 'var(--color-sand-200, #C2B7A3)',
            maxWidth: '720px',
            margin: '0 auto'
          }}>
            {isHi
              ? 'चाहे आप AI प्रमाणन के संबंध में जानकारी चाहते हों, अपने विभाग में अधिकारी प्रशिक्षण कार्यक्रम आयोजित करना चाहते हों, या अपनी संस्था के साथ साझेदारी करना चाहते हों — हमारी टीम आपकी सहायता के लिए सदैव उपलब्ध है।'
              : 'Whether you are inquiring about Level 1 Masterclass certifications, scheduling executive officer cohorts for your department, or seeking civic technology partnerships across Bihar’s 38 districts — we are here to support you.'}
          </p>
        </div>

        {/* 3 CORE TRUST CARDS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginBottom: '56px'
        }}>
          {/* Card 1: Official Email & Communications */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(32, 28, 24, 0.85) 0%, rgba(20, 17, 15, 0.95) 100%)',
            border: '1px solid rgba(226, 139, 92, 0.22)',
            borderRadius: '20px',
            padding: '32px 28px',
            boxShadow: '0 16px 36px -12px rgba(0, 0, 0, 0.45)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>✉️</div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#FFFFFF', marginBottom: '8px' }}>
              {isHi ? 'ईमेल संचार' : 'Official Electronic Mail'}
            </h3>
            <p style={{ fontSize: '14px', color: '#A89E8C', lineHeight: 1.6, marginBottom: '16px' }}>
              {isHi ? 'सामान्य पूछताछ, प्रमाणन सत्यापन और साझेदारी प्रस्तावों के लिए:' : 'For general inquiries, credential verification assistance, and institutional tie-ups:'}
            </p>
            <div style={{
              background: 'rgba(193, 85, 44, 0.12)',
              border: '1px solid rgba(226, 139, 92, 0.3)',
              borderRadius: '10px',
              padding: '10px 14px',
              fontSize: '14.5px',
              fontWeight: '700',
              color: '#F5AF87',
              display: 'inline-block'
            }}>
              <a href="mailto:contact@biharaimission.org" style={{ color: 'inherit', textDecoration: 'none' }}>
                contact@biharaimission.org
              </a>
            </div>
            <div style={{ marginTop: '12px', fontSize: '12px', color: '#887E6E' }}>
              ⚡ Typical response time: Under 24 business hours
            </div>
          </div>

          {/* Card 2: Physical Headquarters */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(32, 28, 24, 0.85) 0%, rgba(20, 17, 15, 0.95) 100%)',
            border: '1px solid rgba(226, 139, 92, 0.22)',
            borderRadius: '20px',
            padding: '32px 28px',
            boxShadow: '0 16px 36px -12px rgba(0, 0, 0, 0.45)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>🏛️</div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#FFFFFF', marginBottom: '8px' }}>
              {isHi ? 'मुख्यालय एवं प्रशासनिक कार्यालय' : 'Secretariat & Liaison Office'}
            </h3>
            <p style={{ fontSize: '14px', color: '#A89E8C', lineHeight: 1.6, marginBottom: '16px' }}>
              {isHi ? 'पटना में स्थित प्रशासनिक व नागरिक समन्वय केंद्र:' : 'Central administration and civic coordination desk in the state capital:'}
            </p>
            <div style={{ fontSize: '14px', color: '#E2D7C3', lineHeight: 1.5, fontWeight: '600' }}>
              Technology Innovation Corridor<br />
              Bailey Road, Patna, Bihar — 800001, India
            </div>
            <div style={{ marginTop: '12px', fontSize: '12px', color: '#887E6E' }}>
              🕒 Working Hours: Monday – Saturday, 9:30 AM – 6:00 PM IST
            </div>
          </div>

          {/* Card 3: District Network & Helplines */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(32, 28, 24, 0.85) 0%, rgba(20, 17, 15, 0.95) 100%)',
            border: '1px solid rgba(226, 139, 92, 0.22)',
            borderRadius: '20px',
            padding: '32px 28px',
            boxShadow: '0 16px 36px -12px rgba(0, 0, 0, 0.45)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>🌐</div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#FFFFFF', marginBottom: '8px' }}>
              {isHi ? '38 जिला समन्वयक नेटवर्क' : '38-District Outreach Network'}
            </h3>
            <p style={{ fontSize: '14px', color: '#A89E8C', lineHeight: 1.6, marginBottom: '16px' }}>
              {isHi ? 'बिहार के सभी 38 जिलों में फैले डिजिटल स्वयंसेवक और AI मेंटर्स:' : 'Supporting state-wide AI literacy across Patna, Gaya, Muzaffarpur, Bhagalpur, Darbhanga and beyond:'}
            </p>
            <div style={{ fontSize: '14px', color: '#10B981', fontWeight: '700' }}>
              ✓ All 38 Districts Covered
            </div>
            <div style={{ marginTop: '12px', fontSize: '12px', color: '#887E6E' }}>
              District Analytics Labs active for governance automation
            </div>
          </div>
        </div>

        {/* DIRECT INQUIRY FORM */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(28, 24, 21, 0.92) 0%, rgba(18, 15, 13, 0.98) 100%)',
          border: '1px solid rgba(226, 139, 92, 0.28)',
          borderRadius: '24px',
          padding: '40px clamp(20px, 4vw, 48px)',
          maxWidth: '800px',
          margin: '0 auto 60px'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#FFFFFF', marginBottom: '10px' }}>
            {isHi ? 'त्वरित संदेश भेजें' : 'Send an Official Inquiry'}
          </h2>
          <p style={{ fontSize: '14.5px', color: '#A89E8C', marginBottom: '28px', lineHeight: 1.6 }}>
            {isHi
              ? 'प्रमाणन सहायता, कॉलेज भागीदारी या सरकारी कार्यशालाओं के लिए नीचे विवरण भरें।'
              : 'Fill in your details below for exam support, educational tie-ups, or departmental executive briefings.'}
          </p>

          {formSubmitted ? (
            <div style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
              color: '#A7F3D0'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>✅</div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '6px' }}>Inquiry Dispatched Successfully</h3>
              <p style={{ fontSize: '14px', color: '#D1FAE5' }}>
                Thank you for connecting with Bihar AI Mission. Our coordination officer will review your request and reach out within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#C2B7A3', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rameshwar Kumar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: 'rgba(20, 17, 15, 0.85)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#C2B7A3', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Official / Personal Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@domain.gov.in or personal"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: 'rgba(20, 17, 15, 0.85)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#C2B7A3', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Phone / WhatsApp
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: 'rgba(20, 17, 15, 0.85)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#C2B7A3', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Your Category / Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: 'rgba(20, 17, 15, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="Government Officer / Administrative Staff">Government Officer / Administrative Staff</option>
                  <option value="Student / University Researcher">Student / University Researcher</option>
                  <option value="Educator / College Faculty">Educator / College Faculty</option>
                  <option value="Startup Founder / Entrepreneur">Startup Founder / Entrepreneur</option>
                  <option value="General Citizen / AI Aspirant">General Citizen / AI Aspirant</option>
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#C2B7A3', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Inquiry Message / Requirement Details *
                </label>
                <textarea
                  rows="4"
                  required
                  placeholder="Describe your query, certification assistance need, or partnership proposal..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: 'rgba(20, 17, 15, 0.85)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #C1552C 0%, #D99B26 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '14px 28px',
                    fontSize: '15px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    boxShadow: '0 8px 24px -4px rgba(193, 85, 44, 0.4)',
                    transition: 'transform 0.2s ease'
                  }}
                >
                  {isHi ? 'संदेश सबमिट करें →' : 'Submit Official Inquiry →'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* FREQUENTLY ANSWERED CONTACT QUESTIONS */}
        <div style={{ maxWidth: '800px', margin: '0 auto 60px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '20px', color: '#FFFFFF' }}>
            Frequently Asked Queries
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: 'rgba(32, 28, 24, 0.65)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '18px 20px' }}>
              <div style={{ fontSize: '15.5px', fontWeight: '700', color: '#F5AF87', marginBottom: '6px' }}>
                How do I verify a certificate issued by Bihar AI Mission?
              </div>
              <div style={{ fontSize: '14px', color: '#C2B7A3', lineHeight: 1.6 }}>
                All official certificates have a unique Credential ID (e.g. BAIM-CERT-xxxxxx) and QR code. You can verify any certificate immediately on our public Learning Hub at <a href="/learning" style={{ color: '#E28B5C' }}>biharaimission.org/learning</a>.
              </div>
            </div>

            <div style={{ background: 'rgba(32, 28, 24, 0.65)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '18px 20px' }}>
              <div style={{ fontSize: '15.5px', fontWeight: '700', color: '#F5AF87', marginBottom: '6px' }}>
                Are the Level 1 certifications free for Bihar students and officers?
              </div>
              <div style={{ fontSize: '14px', color: '#C2B7A3', lineHeight: 1.6 }}>
                Yes. The Level 1 Masterclass examinations, AI prompt libraries, and foundational digital credentials are provided free of cost as part of Bihar’s civic technology literacy roadmap.
              </div>
            </div>

            <div style={{ background: 'rgba(32, 28, 24, 0.65)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '18px 20px' }}>
              <div style={{ fontSize: '15.5px', fontWeight: '700', color: '#F5AF87', marginBottom: '6px' }}>
                How can educational institutions or government departments arrange a cohort?
              </div>
              <div style={{ fontSize: '14px', color: '#C2B7A3', lineHeight: 1.6 }}>
                Institutions can send an email directly to <a href="mailto:contact@biharaimission.org" style={{ color: '#E28B5C' }}>contact@biharaimission.org</a> with expected participant counts and preferred dates.
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
