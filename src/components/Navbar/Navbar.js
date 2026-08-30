import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import UserAvatar from '../UserAvatar/UserAvatar';

export default function Navbar({ onOpenAuth, onOpenRegistration }) {
  const { t, i18n } = useTranslation(['navbar', 'common']);
  const { user, logout } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  const handleNavClick = () => {
    setMobileOpen(false);
  };

  const handleLockedSignIn = () => {
    toast?.info(
      isHi 
        ? '🔒 सदस्य पोर्टल साइन-इन जल्द शुरू होगा। कृपया नए सदस्य के रूप में पंजीकरण करें।' 
        : '🔒 Member Portal Sign-In is launching soon. Please click Register to join.'
    );
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
              <span className="nav-lock-badge" title="Under Construction">🔒</span>
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
                    <div className="user-role">{user.designation}</div>
                  </div>
                  <Link
                    to="/profile"
                    onClick={handleNavClick}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      width: '100%',
                      textAlign: 'center',
                      background: 'var(--color-terracotta-500, #C1552C)',
                      color: 'var(--color-sand-50, #FBF8F3)',
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-sm, 10px)',
                      fontSize: '12.5px',
                      fontWeight: '700',
                      textDecoration: 'none',
                      margin: '6px 0',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 4px 12px rgba(193, 85, 44, 0.25)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {t('auth.dashboard', { defaultValue: '🎓 My Dashboard' })} →
                  </Link>
                  <button className="user-logout-btn" onClick={() => { logout(); handleNavClick(); }}>
                    {t('auth.logout', { defaultValue: 'Logout' })}
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
                      handleLockedSignIn();
                    }}
                    title={isHi ? 'साइन-इन जल्द शुरू होगा' : 'Sign-In Coming Soon'}
                    style={{ opacity: 0.9, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                  >
                    <span>{t('auth.signIn', { defaultValue: 'Sign In' })}</span>
                    <span className="nav-lock-badge" title="Coming Soon" style={{ fontSize: '11px' }}>🔒</span>
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
                        <div className="dh-name">{user.fullName}</div>
                        <div className="dh-email">{user.email}</div>
                      </div>
                    </div>

                    <div style={{ margin: '8px 0', borderTop: '1px solid var(--color-line, #E2D7C3)', borderBottom: '1px solid var(--color-line, #E2D7C3)', padding: '8px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          background: 'linear-gradient(135deg, var(--color-terracotta-500, #C1552C) 0%, var(--color-terracotta-600, #A3411B) 100%)',
                          color: 'var(--color-sand-50, #FBF8F3)',
                          padding: '8px 14px',
                          borderRadius: 'var(--radius-sm, 10px)',
                          fontSize: '12.5px',
                          fontWeight: '700',
                          textDecoration: 'none',
                          whiteSpace: 'nowrap',
                          boxShadow: '0 4px 12px rgba(193, 85, 44, 0.25)',
                          boxSizing: 'border-box',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>🎓</span>
                          <span>{t('auth.dashboard', { defaultValue: '🎓 My Dashboard' })}</span>
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: '900' }}>→</span>
                      </Link>

                      {(user.role === 'admin' || user.email?.includes('admin')) && (
                        <Link
                          to="/admin"
                          onClick={() => setProfileDropdownOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            background: 'rgba(24, 21, 18, 0.05)',
                            color: 'var(--color-charcoal-900, #181512)',
                            padding: '8px 14px',
                            borderRadius: 'var(--radius-sm, 10px)',
                            fontSize: '12px',
                            fontWeight: '600',
                            textDecoration: 'none',
                            whiteSpace: 'nowrap',
                            boxSizing: 'border-box',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>🛡️</span>
                            <span>{t('auth.admin', { defaultValue: 'Admin Portal' })}</span>
                          </span>
                          <span style={{ fontSize: '11px', fontWeight: '900' }}>→</span>
                        </Link>
                      )}
                    </div>

                    <div className="dropdown-footer">
                      <button className="dropdown-logout-btn" onClick={() => { logout(); setProfileDropdownOpen(false); }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                          <polyline points="16 17 21 12 16 7"></polyline>
                          <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        <span>{t('auth.logout', { defaultValue: 'Logout' })}</span>
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
                  onClick={handleLockedSignIn}
                  title={isHi ? 'साइन-इन जल्द शुरू होगा' : 'Sign-In Coming Soon'}
                  style={{ opacity: 0.9, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                >
                  <span>{t('auth.signIn', { defaultValue: 'Sign In' })}</span>
                  <span className="nav-lock-badge" title="Coming Soon" style={{ fontSize: '11px' }}>🔒</span>
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
