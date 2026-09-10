import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import styles from './Admin.module.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isUnauthorized = params.get('unauthorized') === 'true';
    const isLogout = params.get('logout') === 'true';

    if (isUnauthorized) {
      try {
        localStorage.removeItem('bihar_ai_admin_session');
      } catch (e) {}
      setError('Access restricted. Please sign in with an authorized Administrator account.');
      return;
    }

    if (isLogout) {
      try {
        localStorage.removeItem('bihar_ai_admin_session');
      } catch (e) {}
      return;
    }

    // Only auto-redirect if an active admin session (< 24h old) exists
    try {
      const raw = localStorage.getItem('bihar_ai_admin_session');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.email && (Date.now() - (parsed.authenticatedAt || 0)) < 86400000) {
          navigate('/admin/dashboard');
          return;
        } else {
          localStorage.removeItem('bihar_ai_admin_session');
        }
      }
    } catch (e) {}

    // Check active Supabase Auth session, strictly whitelisted to known admin emails
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && session.user && session.user.email) {
        const emailLower = session.user.email.toLowerCase().trim();
        const WHITELISTED_ADMINS = [
          'admin@biharaimission.org',
          'director@biharaimission.org',
          'praveer@biharaimission.org'
        ];
        if (WHITELISTED_ADMINS.includes(emailLower) || session.user.app_metadata?.role === 'admin') {
          localStorage.setItem('bihar_ai_admin_session', JSON.stringify({ email: emailLower, authenticatedAt: Date.now() }));
          navigate('/admin/dashboard');
        }
      }
    });
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const cleanEmail = email.toLowerCase().trim();

    try {
      let authOk = false;

      // 1. Supabase standard auth sign in
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (!authError && authData && authData.user) {
        authOk = true;
      }

      // 2. Fallback: verify_user_password RPC
      if (!authOk) {
        try {
          const { data: verifyResult, error: rpcErr } = await supabase.rpc('verify_user_password', {
            email_input: cleanEmail,
            password_input: password,
          });
          if (!rpcErr && verifyResult && verifyResult.success) {
            authOk = true;
          }
        } catch (rpcE) {}
      }

      if (authOk) {
        // Authorize admin email before granting dashboard access
        const WHITELISTED_ADMINS = [
          'admin@biharaimission.org',
          'director@biharaimission.org',
          'praveer@biharaimission.org'
        ];
        let isAuthorized = WHITELISTED_ADMINS.includes(cleanEmail);

        if (!isAuthorized) {
          try {
            const { data: ud } = await supabase
              .from('user_details')
              .select('role_type, designation')
              .ilike('email', cleanEmail)
              .maybeSingle();
            if (ud) {
              const roleType = (ud.role_type || '').toLowerCase().trim();
              const designation = (ud.designation || '').toLowerCase().trim();
              if (
                ['admin', 'superadmin', 'director'].includes(roleType) ||
                designation.includes('admin') ||
                designation.includes('director')
              ) {
                isAuthorized = true;
              }
            }
          } catch (e) {}
        }

        if (!isAuthorized) {
          try {
            const { data: au } = await supabase
              .from('admin_users')
              .select('id, role')
              .ilike('email', cleanEmail)
              .maybeSingle();
            if (au) {
              isAuthorized = true;
            }
          } catch (e) {}
        }

        if (!isAuthorized) {
          setError('Access restricted. This account does not have administrator privileges.');
          return;
        }

        localStorage.setItem('bihar_ai_admin_session', JSON.stringify({
          email: cleanEmail,
          authenticatedAt: Date.now()
        }));
        navigate('/admin/dashboard');
        return;
      }

      setError('Invalid admin credentials. Please verify your email and password.');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.adminContainer}>
      <div className={styles.loginBackgroundDecor} />
      <div className={styles.glowOrb1} />
      <div className={styles.glowOrb2} />

      <div className={styles.loginOverlay}>
        <div className={styles.loginCard}>
          <div className={styles.loginCardTopBar} />

          <div className={styles.loginCardHeader}>
            <div className={styles.logoBadge}>
              <img src="/bi_logo.png" alt="Bihar AI Mission Logo" />
            </div>

            <br />
            <div className={styles.portalBadge}>
              <span className={styles.portalBadgeDot} />
              <span>Official Admin Portal</span>
            </div>

            <h1>Admin Portal</h1>
            <p>Bihar AI Mission Management System</p>
          </div>

          <form onSubmit={handleLogin} autoComplete="off">
            <div className={styles.formFieldGroup}>
              <div className={styles.formFieldLabelRow}>
                <label className={styles.formLabel}>Email Address</label>
              </div>
              <div className={styles.inputWrapper}>
                <div className={styles.inputIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <input
                  type="email"
                  name="admin_login_email"
                  id="admin_login_email"
                  className={`${styles.loginInput} ${styles.loginInputWithoutRightIcon}`}
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck="false"
                  required
                />
              </div>
            </div>

            <div className={styles.formFieldGroup}>
              <div className={styles.formFieldLabelRow}>
                <label className={styles.formLabel}>Password</label>
              </div>
              <div className={styles.inputWrapper}>
                <div className={styles.inputIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="admin_login_password"
                  id="admin_login_password"
                  className={styles.loginInput}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck="false"
                  required
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className={`${styles.alertBox} ${styles.alertError}`}>
                <svg className={styles.alertIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className={styles.loginSubmitBtn}
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className={styles.spinner} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" />
                  </svg>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <button
              onClick={() => navigate('/')}
              className={styles.backLinkBtn}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>Back to Main Website</span>
            </button>
          </div>

          <div className={styles.securityFooter}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>256-Bit SSL Encrypted Admin Gateway</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

