import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from './ResetPasswordPage.module.css';

/* ============================================================
   SVG Icons (Crisp, High-Precision Line Vectors)
   ============================================================ */
const ShieldIcon = () => (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="url(#shieldWarmGrad)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <defs>
      <linearGradient id="shieldWarmGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F97316" />
        <stop offset="100%" stopColor="#C1552C" />
      </linearGradient>
    </defs>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SuccessShieldIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const KeyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7.5" cy="15.5" r="4.5" />
    <path d="M10.7 12.3L19 4M15 8l2 2M18 5l2 2" />
  </svg>
);

const MailIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M22 7l-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const CheckIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const EyeIcon = ({ visible }) => visible ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <path d="M1 1L23 23" />
  </svg>
) : (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const AlertCircleIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

/* ============================================================
   Component
   ============================================================ */
const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { updatePassword, user } = useAuth();

  const [emailInput, setEmailInput] = useState('');
  const [tokenParam, setTokenParam] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Extract email and token from URL parameters or saved state
    const params = new URLSearchParams(location.search);
    const urlEmail = params.get('email') || '';
    const urlToken = params.get('token') || '';

    const savedEmail = localStorage.getItem('bihar_ai_reset_email') || '';
    const savedStateStr = localStorage.getItem('bihar_ai_reset_state') || '';
    let savedState = null;
    try {
      if (savedStateStr) savedState = JSON.parse(savedStateStr);
    } catch (e) {}

    const resolvedEmail = urlEmail || savedEmail || savedState?.email || user?.email || '';
    const resolvedToken = urlToken || savedState?.token || '';

    setEmailInput(resolvedEmail);
    setTokenParam(resolvedToken);
  }, [location.search, user]);

  // 10-second countdown timer after successful password reset
  useEffect(() => {
    let timer = null;
    if (isSuccess && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isSuccess && countdown === 0) {
      navigate('/');
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isSuccess, countdown, navigate]);

  // Password requirements checklist
  const requirements = {
    length: newPassword.length >= 6,
    hasUpper: /[A-Z]/.test(newPassword),
    hasNumberOrSpecial: /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword),
  };

  // Password strength meter calculation
  const passwordStrength = (() => {
    if (!newPassword) return { level: 0, label: '', color: '' };
    let score = 0;
    if (newPassword.length >= 6) score++;
    if (newPassword.length >= 10) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;

    if (score <= 1) return { level: 1, label: 'Weak', color: '#EF4444' };
    if (score <= 2) return { level: 2, label: 'Fair', color: '#F59E0B' };
    if (score <= 3) return { level: 3, label: 'Good', color: '#EAB308' };
    return { level: 4, label: 'Strong', color: '#22C55E' };
  })();

  const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;
  const isFormValid = newPassword.length >= 6 && passwordsMatch && !submitting;

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your confirm password.');
      return;
    }

    const cleanEmail = (emailInput || localStorage.getItem('bihar_ai_reset_email') || '').trim();
    if (!cleanEmail) {
      setErrorMessage('Please provide your registered email address.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await updatePassword(newPassword, {
        email: cleanEmail,
        token: tokenParam,
      });

      if (result && result.success) {
        setIsSuccess(true);
        setCountdown(10);
      } else {
        setErrorMessage(result?.error || 'Failed to update password. Please request a new reset link.');
      }
    } catch (err) {
      setErrorMessage(err?.message || 'Network error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Ambient background glows */}
      <div className={styles.bgOrb1} />
      <div className={styles.bgOrb2} />
      <div className={styles.bgGridOverlay} />

      {/* Double-Bezel Card Shell */}
      <div className={styles.cardShell}>
        <div className={styles.card}>
          {/* Top shimmering accent bar */}
          <div className={styles.accentBar} />

          {/* ================= SUCCESS VIEW ================= */}
          {isSuccess ? (
            <div className={styles.successWrapper}>
              <div className={styles.successIconPulse}>
                <div className={styles.successIconRing} />
                <div className={styles.successIconCircle}>
                  <SuccessShieldIcon />
                </div>
              </div>

              <div className={styles.successBadge}>
                <CheckIcon size={12} />
                <span>PASSWORD UPDATED</span>
              </div>

              <h1 className={styles.title}>Password Reset Successful!</h1>

              <p className={styles.subtitle}>
                Your account credentials have been securely updated. You can now sign in with your new password.
              </p>

              {emailInput && (
                <div className={styles.successAccountPill}>
                  <MailIcon />
                  <span>Account: <strong>{emailInput}</strong></span>
                </div>
              )}

              <div className={styles.successActions}>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className={styles.successPrimaryBtn}
                >
                  <span>Proceed to Sign In</span>
                  <span className={styles.btnArrowCircle}>
                    <ArrowRightIcon />
                  </span>
                </button>
              </div>

              <div className={styles.autoRedirectNotice}>
                <div className={styles.redirectHeader}>
                  <span>⏱️ Auto-redirecting in <strong>{countdown}s</strong></span>
                </div>
                <div className={styles.redirectTrack}>
                  <div
                    className={styles.redirectFill}
                    style={{ width: `${(countdown / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* ================= FORM VIEW ================= */
            <>
              {/* Card Header */}
              <div className={styles.cardHeader}>
                <div className={styles.iconCircle}>
                  <ShieldIcon />
                </div>
                <div className={styles.badge}>
                  <span className={styles.badgeDot} />
                  <span>BIHAR AI MISSION</span>
                </div>
                <h1 className={styles.title}>Set New Password</h1>
                <p className={styles.subtitle}>
                  Choose a new, secure password for your account.
                </p>
              </div>

              {/* Verified Account Recovery Card (Structured 2-tier layout, never wraps 'VERIFIED LINK') */}
              {emailInput && (
                <div className={styles.verifiedSessionCard}>
                  <div className={styles.sessionHeaderRow}>
                    <div className={styles.sessionLabel}>
                      <span className={styles.pulseDot} />
                      <span>RECOVERY SESSION</span>
                    </div>
                    <div className={styles.verifiedBadge}>
                      <CheckIcon size={11} />
                      <span>Verified Link</span>
                    </div>
                  </div>

                  <div className={styles.sessionEmailRow}>
                    <div className={styles.emailIconWrapper}>
                      <MailIcon />
                    </div>
                    <div className={styles.emailContent}>
                      <span className={styles.emailLabel}>Target Account</span>
                      <span className={styles.emailAddress} title={emailInput}>
                        {emailInput}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Alert */}
              {errorMessage && (
                <div className={styles.errorAlert}>
                  <div className={styles.errorAlertIcon}>
                    <AlertCircleIcon size={16} />
                  </div>
                  <div className={styles.errorAlertText}>{errorMessage}</div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleResetPassword} className={styles.form} autoComplete="off">
                {/* Fallback Email Input if missing */}
                {!emailInput && (
                  <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="bihar_reset_email_input">
                      Registered Email Address
                    </label>
                    <div className={styles.inputContainer}>
                      <span className={styles.inputIcon}>
                        <MailIcon />
                      </span>
                      <input
                        type="email"
                        name="bihar_reset_email_input"
                        id="bihar_reset_email_input"
                        placeholder="Enter your registered email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="none"
                        spellCheck="false"
                        required
                        className={styles.input}
                      />
                    </div>
                  </div>
                )}

                {/* New Password */}
                <div className={styles.fieldGroup}>
                  <div className={styles.fieldLabelRow}>
                    <label className={styles.label} htmlFor="bihar_reset_new_password">
                      New Password
                    </label>
                  </div>

                  <div className={styles.inputContainer}>
                    <span className={styles.inputIcon}>
                      <LockIcon />
                    </span>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="bihar_reset_new_password"
                      id="bihar_reset_new_password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      autoComplete="new-password"
                      autoCorrect="off"
                      autoCapitalize="none"
                      spellCheck="false"
                      required
                      className={styles.input}
                      autoFocus
                    />
                    <button
                      type="button"
                      className={styles.eyeToggleBtn}
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      aria-label={showNewPassword ? "Hide password" : "Show password"}
                    >
                      <EyeIcon visible={showNewPassword} />
                    </button>
                  </div>

                  {/* Password Strength Meter & Live Requirements */}
                  {newPassword && (
                    <div className={styles.strengthWrapper}>
                      <div className={styles.strengthHeader}>
                        <span className={styles.strengthTitle}>Password Strength</span>
                        <span
                          className={styles.strengthBadge}
                          style={{
                            color: passwordStrength.color,
                            borderColor: `${passwordStrength.color}40`,
                            backgroundColor: `${passwordStrength.color}15`,
                          }}
                        >
                          {passwordStrength.label}
                        </span>
                      </div>

                      <div className={styles.strengthTrack}>
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={styles.strengthSegment}
                            style={{
                              backgroundColor: i <= passwordStrength.level ? passwordStrength.color : 'rgba(255, 255, 255, 0.08)',
                              boxShadow: i <= passwordStrength.level ? `0 0 8px ${passwordStrength.color}60` : 'none',
                            }}
                          />
                        ))}
                      </div>

                      {/* Live Requirements Checklist */}
                      <div className={styles.reqList}>
                        <div className={`${styles.reqItem} ${requirements.length ? styles.reqMet : ''}`}>
                          <CheckIcon size={11} />
                          <span>At least 6 characters</span>
                        </div>
                        <div className={`${styles.reqItem} ${requirements.hasUpper ? styles.reqMet : ''}`}>
                          <CheckIcon size={11} />
                          <span>Uppercase letter</span>
                        </div>
                        <div className={`${styles.reqItem} ${requirements.hasNumberOrSpecial ? styles.reqMet : ''}`}>
                          <CheckIcon size={11} />
                          <span>Number or symbol</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className={styles.fieldGroup}>
                  <div className={styles.fieldLabelRow}>
                    <label className={styles.label} htmlFor="bihar_reset_confirm_password">
                      Confirm Password
                    </label>
                  </div>

                  <div className={styles.inputContainer}>
                    <span className={styles.inputIcon}>
                      <KeyIcon />
                    </span>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="bihar_reset_confirm_password"
                      id="bihar_reset_confirm_password"
                      placeholder="Re-enter your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      autoCorrect="off"
                      autoCapitalize="none"
                      spellCheck="false"
                      required
                      className={`${styles.input} ${passwordsMatch ? styles.inputMatch : ''} ${confirmPassword && !passwordsMatch ? styles.inputMismatch : ''}`}
                    />
                    <button
                      type="button"
                      className={styles.eyeToggleBtn}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      <EyeIcon visible={showConfirmPassword} />
                    </button>
                  </div>

                  {/* Dynamic Match Feedback */}
                  {passwordsMatch && (
                    <div className={styles.matchIndicatorSuccess}>
                      <CheckIcon size={13} />
                      <span>Passwords match</span>
                    </div>
                  )}
                  {confirmPassword && !passwordsMatch && (
                    <div className={styles.matchIndicatorMismatch}>
                      <AlertCircleIcon size={13} />
                      <span>Passwords do not match yet</span>
                    </div>
                  )}
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={!isFormValid}
                  className={styles.submitBtn}
                >
                  {submitting ? (
                    <div className={styles.btnContentLoading}>
                      <span className={styles.spinner} />
                      <span>Updating Password…</span>
                    </div>
                  ) : (
                    <div className={styles.btnContent}>
                      <span>Update Password</span>
                      <span className={styles.btnArrowCircle}>
                        <ArrowRightIcon />
                      </span>
                    </div>
                  )}
                </button>
              </form>

              {/* Card Footer */}
              <div className={styles.cardFooter}>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className={styles.backBtn}
                >
                  <ArrowLeftIcon />
                  <span>Back to Home</span>
                </button>
                <div className={styles.securityNote}>
                  <ShieldCheckIcon />
                  <span>Secure · Encrypted · Private</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
