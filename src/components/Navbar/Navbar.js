import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import UserAvatar from '../UserAvatar/UserAvatar';

export default function Navbar({ onOpenAuth, onOpenRegistration }) {
  const { t, i18n } = useTranslation(['navbar', 'common']);
  const { user, logout } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    setMobileOpen(false);
    navigate('/');
  };

  const currentLang = i18n.language || 'en';
  const isHi = currentLang === 'hi';

  const isActive = (path) => location.pathname === path;

  // Automatically close mobile navbar whenever route/location changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search, location.hash]);

  // Automatically close mobile navbar on screen resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1180) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const isLocalhost = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' || 
    window.location.port === '3000'
  );

  const handleNavClick = () => {
    setMobileOpen(false);
  };

  const handleSignInClick = () => {
    if (isLocalhost) {
      if (onOpenAuth) onOpenAuth('login');
    } else {
      toast?.info(
        isHi 
          ? '🔒 सदस्य पोर्टल साइन-इन जल्द शुरू होगा। कृपया नए सदस्य के रूप में पंजीकरण करें।' 
          : '🔒 Member Portal Sign-In is launching soon. Please click Register to join.'
      );
    }
  };

  const handleLanguageChange = (newLang) => {
    i18n.changeLanguage(newLang);
    try {
      localStorage.setItem('bihar_ai_lang', newLang);
      document.documentElement.lang = newLang;
    } catch (e) {}
  };

  return (
    <>
      <nav className="topnav notranslate" translate="no">
        <div className="nav-i">
          <Link to="/" className="logo" onClick={handleNavClick}>
            <div className="logo-box">
              <img src="/bi_logo.png" alt="Bihar AI Mission Logo" />
            </div>
            <div className="logo-text">
              <div className="logo-name">Bihar AI Mission</div>
              <div className="logo-sub">बिहार AI मिशन · A civic AI initiative</div>
            </div>
          </Link>

          <div className={`nav-links ${mobileOpen ? 'open' : ''}`}>
            <Link to="/" className={isActive('/') ? 'act' : ''} onClick={handleNavClick}>
              {t('links.home', { defaultValue: 'Home' })}
            </Link>
            <Link to="/learning" className={isActive('/learning') ? 'act' : ''} onClick={handleNavClick}>
              <span>{t('links.learning', { defaultValue: 'Learning Hub' })}</span>
              <span className="nav-lock-badge" title="Under Construction">🔒</span>
            </Link>
            <Link to="/tools" className={isActive('/tools') ? 'act' : ''} onClick={handleNavClick}>
              {t('links.tools', { defaultValue: 'AI Tools' })}
            </Link>
            <Link to="/blog" className={isActive('/blog') ? 'act' : ''} onClick={handleNavClick}>
              <span>{t('links.blog', { defaultValue: 'Blog' })}</span>
            </Link>
            <Link to="/startups" className={isActive('/startups') ? 'act' : ''} onClick={handleNavClick}>
              {t('links.startups', { defaultValue: 'Startups' })}
            </Link>
            <Link to="/about" className={isActive('/about') ? 'act' : ''} onClick={handleNavClick}>
              {t('links.about', { defaultValue: 'About' })}
            </Link>

            <div className="mobile-nav-actions">
              <div className="mobile-lang-toggle" role="group" aria-label="Language selection">
                <span 
                  className={`lang-slider ${isHi ? 'pos-hi' : 'pos-en'}`} 
                  aria-hidden="true"
                />
                <button 
                  type="button"
                  className={`lang-btn ${!isHi ? 'active' : ''}`} 
                  onClick={() => handleLanguageChange('en')}
                  aria-pressed={!isHi}
                >
                  <span className="lang-btn-text">English</span>
                  <span className="lang-btn-badge">EN</span>
                </button>
                <button 
                  type="button"
                  className={`lang-btn ${isHi ? 'active' : ''}`} 
                  onClick={() => handleLanguageChange('hi')}
                  aria-pressed={isHi}
                >
                  <span className="lang-btn-text">हिन्दी</span>
                  <span className="lang-btn-badge">HI</span>
                </button>
              </div>

              {user ? (
                <div className="mobile-user-card">
                  <div className="user-avatar">
                    <UserAvatar user={user} className="dh-avatar-img" />
                  </div>
                  <div className="user-info">
                    <div className="user-name">{user.fullName}</div>
                    <div className="user-role">{user.email}</div>
                  </div>
                  <Link
                    to="/profile"
                    onClick={handleNavClick}
                    className="mobile-dashboard-link"
                  >
                    <span>🎓 {isHi ? 'मेरा डैशबोर्ड' : 'Candidate Dashboard'}</span>
                    <span style={{ fontSize: '11px', fontWeight: '900' }}>→</span>
                  </Link>
                  <button className="user-logout-btn" onClick={handleLogout}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    <span>{t('auth.logout', { defaultValue: 'Sign Out' })}</span>
                  </button>
                </div>
              ) : (
                <div className="mobile-auth-actions">
                  <button 
                    type="button"
                    className="mobile-menu-register-btn" 
                    onClick={() => {
                      handleNavClick();
                      if (onOpenRegistration) onOpenRegistration();
                    }}
                  >
                    <span>{t('auth.register', { defaultValue: 'Register' })}</span>
                  </button>
                  <button 
                    type="button"
                    className="mobile-menu-signin-btn" 
                    onClick={() => {
                      handleNavClick();
                      if (onOpenAuth) onOpenAuth('login');
                    }}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                  >
                    <span>{t('auth.signIn', { defaultValue: 'Sign In' })}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="nav-r">
            <div className="nav-lang-toggle desktop-only" role="group" aria-label="Language selection">
              <span 
                className={`lang-slider ${isHi ? 'pos-hi' : 'pos-en'}`} 
                aria-hidden="true"
              />
              <button 
                type="button"
                className={`lang-btn ${!isHi ? 'active' : ''}`}
                onClick={() => handleLanguageChange('en')}
                aria-pressed={!isHi}
                title="Switch to English"
              >
                EN
              </button>
              <button 
                type="button"
                className={`lang-btn ${isHi ? 'active' : ''}`}
                onClick={() => handleLanguageChange('hi')}
                aria-pressed={isHi}
                title="हिंदी में बदलें"
              >
                हिं
              </button>
            </div>

            {/* AUTH / PROFILE SECTION (VISIBLE ON ALL DEVICES) */}
            {user ? (
              <div className="nav-profile-wrapper" ref={dropdownRef}>
                <button 
                  className="nav-profile-badge" 
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  aria-label="User profile menu"
                >
                  <div className="profile-avatar">
                    <UserAvatar user={user} className="profile-avatar-img" />
                  </div>
                  <div className="profile-text">
                    <span className="profile-name">{user.fullName}</span>
                    <span className="profile-email-sub">{user.email}</span>
                  </div>
                  <span className="profile-chevron">▾</span>
                </button>

                {profileDropdownOpen && (
                  <div className="profile-dropdown-card">
                    <div className="dropdown-header">
                      <div className="dh-avatar">
                        <UserAvatar user={user} className="dh-avatar-img" />
                      </div>
                      <div className="dh-details">
                        <div className="dh-name-row">
                          <span className="dh-name">{user.fullName}</span>
                          <span className="dh-status-dot" title="Active Account" />
                        </div>
                        <div className="dh-email">{user.email}</div>
                      </div>
                    </div>

                    <div className="dropdown-menu-links">
                      <Link
                        to="/profile"
                        className="dropdown-link-primary"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <div className="dropdown-link-left">
                          <span className="dropdown-link-icon">🎓</span>
                          <div className="dropdown-link-text">
                            <span className="dropdown-link-title">{isHi ? 'उम्मीदवार डैशबोर्ड' : 'Candidate Dashboard'}</span>
                            <span className="dropdown-link-desc">{isHi ? 'प्रमाणपत्र एवं प्रगति' : 'Courses, scores & certs'}</span>
                          </div>
                        </div>
                        <span className="dropdown-link-arrow">→</span>
                      </Link>

                      {(user.role === 'admin' || user.email?.includes('admin')) && (
                        <Link
                          to="/admin"
                          className="dropdown-link-admin"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <div className="dropdown-link-left">
                            <span className="dropdown-link-icon">🛡️</span>
                            <div className="dropdown-link-text">
                              <span className="dropdown-link-title">{isHi ? 'व्यवस्थापक पोर्टल' : 'Admin Portal'}</span>
                              <span className="dropdown-link-desc">{isHi ? 'सिस्टम प्रबंधन' : 'Mission governance'}</span>
                            </div>
                          </div>
                          <span className="dropdown-link-arrow">→</span>
                        </Link>
                      )}
                    </div>

                    <div className="dropdown-footer">
                      <button className="dropdown-logout-btn" onClick={handleLogout}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                          <polyline points="16 17 21 12 16 7"></polyline>
                          <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        <span>{t('auth.logout', { defaultValue: 'Sign Out' })}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="nav-auth-actions desktop-only">
                <button 
                  type="button" 
                  className="nav-signin-btn" 
                  onClick={() => onOpenAuth && onOpenAuth('login')}
                  style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                >
                  <span>{t('auth.signIn', { defaultValue: 'Sign In' })}</span>
                </button>
                <button 
                  type="button" 
                  className="nav-register-btn" 
                  onClick={() => onOpenRegistration && onOpenRegistration()}
                >
                  {t('auth.register', { defaultValue: 'Register' })}
                </button>
              </div>
            )}

            <button 
              className="mobile-toggle" 
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
            >
              <svg viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div 
          className="nav-backdrop open" 
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
