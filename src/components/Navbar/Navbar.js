import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import UserAvatar from '../UserAvatar/UserAvatar';

const GoogleIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" style={{ flexShrink: 0, display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
  </svg>
);

export default function Navbar({ onOpenAuth, onOpenRegistration }) {
  const { lang, setLang, t } = useLanguage();
  const { user, logout, loginWithGoogle } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  // Automatically close mobile navbar whenever route/location changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search, location.hash]);

  // Automatically close mobile navbar on screen resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 992) {
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

  // Helper for user initials
  const getInitials = (name = '') => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || 'AI';
  };

  return (
    <>
      <nav className="topnav">
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
              {t.navHome || 'Home'}
            </Link>
            <Link to="/learning" className={isActive('/learning') ? 'act' : ''} onClick={handleNavClick}>
              <span>{t.navLearning || 'Learning Hub'}</span>
              <span className="nav-lock-badge" title="Under Construction">🔒</span>
            </Link>
            <Link to="/tools" className={isActive('/tools') ? 'act' : ''} onClick={handleNavClick}>
              {t.navTools || 'AI Tools'}
            </Link>
            <Link to="/blog" className={isActive('/blog') ? 'act' : ''} onClick={handleNavClick}>
              <span>{t.navBlog || (lang === 'hi' ? 'ब्लॉग' : 'Blog')}</span>
              <span className="nav-lock-badge" title="Under Construction">🔒</span>
            </Link>
            <Link to="/startups" className={isActive('/startups') ? 'act' : ''} onClick={handleNavClick}>
              <span>{t.navStartups || 'Startups'}</span>
              <span className="nav-lock-badge" title="Under Construction">🔒</span>
            </Link>
            <Link to="/about" className={isActive('/about') ? 'act' : ''} onClick={handleNavClick}>
              <span>{t.navAbout || 'About'}</span>
              <span className="nav-lock-badge" title="Under Construction">🔒</span>
            </Link>

            <div className="mobile-nav-actions">
              <div className="mobile-lang-toggle" role="group" aria-label="Language selection">
                <span 
                  className={`lang-slider ${lang === 'hi' ? 'pos-hi' : 'pos-en'}`} 
                  aria-hidden="true"
                />
                <button 
                  type="button"
                  className={`lang-btn ${lang === 'en' ? 'active' : ''}`} 
                  onClick={() => { setLang('en'); handleNavClick(); }}
                  aria-pressed={lang === 'en'}
                >
                  <span className="lang-btn-text">English</span>
                  <span className="lang-btn-badge">EN</span>
                </button>
                <button 
                  type="button"
                  className={`lang-btn ${lang === 'hi' ? 'active' : ''}`} 
                  onClick={() => { setLang('hi'); handleNavClick(); }}
                  aria-pressed={lang === 'hi'}
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
                    🎓 My Dashboard →
                  </Link>
                  <button className="user-logout-btn" onClick={() => { logout(); handleNavClick(); }}>
                    Sign Out
                  </button>
                </div>
              ) : (
                <button 
                  className="mobile-menu-signin-btn" 
                  onClick={() => {
                    handleNavClick();
                    toast?.info(lang === 'hi' ? '🔒 साइन-इन अभी निर्माणाधीन है। कृपया पंजीकरण फ़ॉर्म भरें।' : '🔒 Sign-in is under development. Please use the registration form.');
                    if (onOpenRegistration) onOpenRegistration();
                  }}
                >
                  <span style={{ marginRight: '4px' }}>🔒</span>
                  <span>{lang === 'hi' ? 'पंजीकरण करें' : 'Register'}</span>
                </button>
              )}
            </div>
          </div>

          <div className="nav-r">
            <div className="nav-lang-toggle desktop-only" role="group" aria-label="Language selection">
              <span 
                className={`lang-slider ${lang === 'hi' ? 'pos-hi' : 'pos-en'}`} 
                aria-hidden="true"
              />
              <button 
                type="button"
                className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
                onClick={() => setLang('en')}
                aria-pressed={lang === 'en'}
                title="Switch to English"
              >
                EN
              </button>
              <button 
                type="button"
                className={`lang-btn ${lang === 'hi' ? 'active' : ''}`}
                onClick={() => setLang('hi')}
                aria-pressed={lang === 'hi'}
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

                    <div style={{ margin: '8px 0', borderTop: '1px solid var(--color-line, #E2D7C3)', borderBottom: '1px solid var(--color-line, #E2D7C3)', padding: '8px 0' }}>
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
                          <span>My Dashboard</span>
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: '900' }}>→</span>
                      </Link>
                    </div>

                    <div className="dropdown-footer">
                      <button className="dropdown-logout-btn" onClick={() => { logout(); setProfileDropdownOpen(false); }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                          <polyline points="16 17 21 12 16 7"></polyline>
                          <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button className="nav-google-btn desktop-only" onClick={() => {
                toast?.info(lang === 'hi' ? '🔒 साइन-इन अभी निर्माणाधीन है। कृपया पंजीकरण फ़ॉर्म भरें।' : '🔒 Sign-in is under development. Please use the registration form.');
                if (onOpenRegistration) onOpenRegistration();
              }}>
                <span style={{ fontSize: '14px', marginRight: '4px' }}>🔒</span>
                <span>{lang === 'hi' ? 'पंजीकरण करें' : 'Register'}</span>
              </button>
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
