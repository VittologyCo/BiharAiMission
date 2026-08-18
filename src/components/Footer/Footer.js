import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import styles from './Footer.module.css';

export default function Footer() {
  const { lang, t } = useLanguage();
  const isHi = lang === 'hi';

  const footerColumnsEn = [
    {
      heading: 'AI Learning',
      links: [
        { label: 'Learning Hub', to: '/learning' },
        { label: 'Foundational Masterclass', to: '/learning' },
        { label: 'Prompt Engineering', to: '/learning' },
        { label: 'Certificate Verification', to: '/learning' },
        { label: 'Hindi AI Modules', to: '/learning' },
      ],
    },
    {
      heading: 'Tools & Ecosystem',
      links: [
        { label: 'AI Tools & Prompts', to: '/tools' },
        { label: 'Department Workflows', to: '/tools' },
        { label: 'Civil Service AI Hub', to: '/tools' },
        { label: 'Policy Framework', to: '/policy' },
        { label: 'Startups & Grants', to: '/startups' },
      ],
    },
    {
      heading: 'Mission & Civic',
      links: [
        { label: 'About Bihar AI Mission', to: '/about' },
        { label: 'AI Impact Stories', to: '/#use-cases' },
        { label: 'Bihar AI Summit', to: '/about' },
        { label: 'Articles & Blog', to: '/blog' },
        { label: 'IndiaAI Mission (MeitY) ↗', href: 'https://indiaai.gov.in', target: '_blank' },
      ],
    },
  ];

  const footerColumnsHi = [
    {
      heading: 'AI शिक्षा एवं प्रशिक्षण',
      links: [
        { label: 'लर्निंग हब', to: '/learning' },
        { label: 'फाउंडेशन मास्टरक्लास', to: '/learning' },
        { label: 'प्रॉम्ट इंजीनियरिंग', to: '/learning' },
        { label: 'प्रमाणपत्र सत्यापन', to: '/learning' },
        { label: 'हिंदी AI पाठ्यक्रम', to: '/learning' },
      ],
    },
    {
      heading: 'टूल्स एवं इकोसिस्टम',
      links: [
        { label: 'AI टूल्स व प्रॉम्ट्स', to: '/tools' },
        { label: 'विभागीय वर्कफ़्लो', to: '/tools' },
        { label: 'प्रशासनिक AI हब', to: '/tools' },
        { label: 'नीति एवं ढांचा', to: '/policy' },
        { label: 'स्टार्टअप्स एवं अनुदान', to: '/startups' },
      ],
    },
    {
      heading: 'मिशन एवं नागरिक',
      links: [
        { label: 'मिशन के बारे में', to: '/about' },
        { label: 'वास्तविक AI प्रभाव', to: '/#use-cases' },
        { label: 'बिहार AI शिखर सम्मेलन', to: '/about' },
        { label: 'लेख एवं अंतर्दृष्टि', to: '/blog' },
        { label: 'IndiaAI मिशन (MeitY) ↗', href: 'https://indiaai.gov.in', target: '_blank' },
      ],
    },
  ];

  const cols = isHi ? footerColumnsHi : footerColumnsEn;

  return (
    <footer className={styles.footerSection} role="contentinfo" aria-label="Site Footer">
      <div className={styles.container}>
        {/* Main 4-Column Grid */}
        <div className={styles.grid}>
          {/* Brand Column */}
          <div className={styles.brandCol}>
            <div className={styles.brandHeader}>
              <div className={styles.logoBox}>
                <img
                  src="/bi_logo.png"
                  alt="Bihar AI Mission Official Emblem"
                  className={styles.logoImg}
                />
              </div>
              <div>
                <h3 className={styles.brandTitle}>Bihar AI Mission</h3>
                <span className={styles.brandTagline}>
                  {isHi ? 'बिहार AI मिशन · नागरिक AI साक्षरता' : 'Civic AI & Digital Literacy Initiative'}
                </span>
              </div>
            </div>

            <p className={styles.brandDesc}>
              {t.fBrandDesc || "An independent, citizen-led initiative translating India's national AI vision into local action — empowering Bihar's officers, students, startups, and 38 districts."}
            </p>

            {/* Disclaimer Glass Card */}
            <div className={styles.disclaimerCard}>
              <span className={styles.disclaimerTag}>
                {isHi ? 'स्वतंत्र नागरिक पहल' : 'Independent Civic Initiative'}
              </span>
              <span>
                {t.fDisclaimer || 'Bihar AI Mission is an independent civic effort inspired by the IndiaAI Mission (MeitY, Govt of India). Not affiliated with or endorsed by any government entity.'}
              </span>
            </div>
          </div>

          {/* Nav Columns */}
          {cols.map((col, i) => (
            <div className={styles.navCol} key={i}>
              <h4 className={styles.colHeading}>
                <span className={styles.colDot} />
                <span>{col.heading}</span>
              </h4>
              <ul className={styles.linkList}>
                {col.links.map((link, j) => (
                  <li key={j}>
                    {link.to ? (
                      <Link to={link.to} className={styles.navLink}>
                        <span className={styles.linkArrow}>→</span>
                        <span>{link.label}</span>
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        target={link.target || undefined}
                        rel={link.target ? 'noreferrer' : undefined}
                        className={styles.navLink}
                      >
                        <span className={styles.linkArrow}>→</span>
                        <span>{link.label}</span>
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Telemetry Strip */}
        <div className={styles.telemetryStrip}>
          <div className={styles.telemetryLeft}>
            <span className={styles.telemetryBadge}>
              <span className={styles.pulseDot} />
              <span>{isHi ? '38 जिले कवरेज रोडमैप' : '38/38 Districts Roadmap'}</span>
            </span>
            <span className={styles.telemetryText}>
              {isHi
                ? 'मुफ्त द्विभाषी पाठ्यक्रम · ओपन एक्सेस प्रॉम्ट्स · नागरिक नेतृत्व'
                : 'Free Bilingual Modules · Open Access Prompts · Citizen-Led Innovation'}
            </span>
          </div>

          <a
            href="https://indiaai.gov.in"
            target="_blank"
            rel="noreferrer"
            className={styles.telemetryLink}
          >
            {isHi ? 'IndiaAI.gov.in पोर्टल देखें ↗' : 'Aligned with IndiaAI.gov.in (MeitY) ↗'}
          </a>
        </div>

        {/* Bottom Row */}
        <div className={styles.bottomRow}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} Bihar AI Mission (biharaimission.org) · {isHi ? 'सर्वाधिकार सुरक्षित।' : 'All rights reserved.'}
          </p>

          <div className={styles.bottomChips}>
            <span className={styles.chip}>Open Public Initiative</span>
            <span className={styles.chip}>Bilingual (हिन्दी / English)</span>
            <span className={styles.chip}>Built for Bihar</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
