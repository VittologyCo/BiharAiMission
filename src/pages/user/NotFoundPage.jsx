import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import styles from './NotFoundPage.module.css';

const NotFoundPage = ({ onOpenAuth, onOpenRegistration }) => {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const isHi = lang === 'hi';

  return (
    <div className={styles.pageWrapper}>
      {/* Background ambient lighting */}
      <div className={styles.bgOrb1}></div>
      <div className={styles.bgOrb2}></div>

      <div className={styles.card}>
        <div className={styles.accentBar}></div>

        <div className={styles.badge}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#EF4444', display: 'inline-block' }}></span>
          {isHi ? '404 · पृष्ठ नहीं मिला' : '404 · Page Not Found'}
        </div>

        <div className={styles.errorCode}>404</div>

        <h1 className={styles.title}>
          {isHi ? (
            <>अनुरोधित पृष्ठ <span style={{ color: '#E28B5C', fontStyle: 'italic' }}>उपलब्ध नहीं है</span></>
          ) : (
            <>This Page <span style={{ color: '#E28B5C', fontStyle: 'italic' }}>Could Not Be Found</span></>
          )}
        </h1>

        <p className={styles.subtitle}>
          {isHi
            ? 'आप जिस पृष्ठ या संसाधन को देख रहे हैं वह मौजूद नहीं है, हटा दिया गया है, या गलत URL दर्ज किया गया है।'
            : 'The page or resource you are looking for does not exist, has been relocated, or is temporarily unavailable in the Bihar AI portal.'}
        </p>

        <div className={styles.buttonGroup}>
          <button
            type="button"
            onClick={() => navigate('/')}
            className={styles.primaryBtn}
          >
            ← {isHi ? 'मुख्य पृष्ठ पर वापस जाएं' : 'Return to Home'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/learning')}
            className={styles.secondaryBtn}
          >
            📚 {isHi ? 'AI शिक्षा एवं कोर्सेज' : 'Explore Learning'}
          </button>

          {onOpenAuth && (
            <button
              type="button"
              onClick={() => onOpenAuth('login')}
              className={styles.secondaryBtn}
            >
              🔐 {isHi ? 'सदस्य लॉगिन' : 'Member Sign In'}
            </button>
          )}
        </div>

        <hr className={styles.divider} />

        <div className={styles.quickLinksTitle}>
          {isHi ? 'महत्वपूर्ण अनुभाग' : 'Quick Navigation'}
        </div>

        <div className={styles.quickLinks}>
          <Link to="/" className={styles.quickLink}>{isHi ? 'होम' : 'Home'}</Link>
          <Link to="/learning" className={styles.quickLink}>{isHi ? 'शिक्षा' : 'Learning'}</Link>
          <Link to="/tools" className={styles.quickLink}>{isHi ? 'उपकरण' : 'AI Tools'}</Link>
          <Link to="/policy" className={styles.quickLink}>{isHi ? 'नीति' : 'AI Policy'}</Link>
          <Link to="/startups" className={styles.quickLink}>{isHi ? 'स्टार्टअप्स' : 'Startups'}</Link>
          <Link to="/about" className={styles.quickLink}>{isHi ? 'हमारे बारे में' : 'About'}</Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
