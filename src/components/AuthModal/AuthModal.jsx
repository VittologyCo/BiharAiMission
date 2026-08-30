import React, { useState, useEffect } from 'react';
import styles from './AuthModal.module.css';
import { useAuth } from '../../hooks/useAuth';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';

export default function AuthModal({ isOpen, onClose, defaultTab = 'login', onOpenRegistration }) {
  const { user, login, resetPassword } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Reset state on open/close
  useEffect(() => {
    if (isOpen) {
      setMode(defaultTab === 'forgot' ? 'forgot' : 'login');
      setEmail('');
      setPassword('');
      setShowPassword(false);
      setErrorMessage('');
      setSuccessMessage('');
      setSubmitting(false);
    }
  }, [isOpen, defaultTab]);

  // Close modal when user is authenticated
  useEffect(() => {
    if (user && isOpen) {
      if (onClose) onClose();
    }
  }, [user, isOpen, onClose]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setSubmitting(true);
    const result = await login(email.trim(), password);
    setSubmitting(false);

    if (!result.success) {
      const err = result.error || '';
      if (err.toLowerCase().includes('invalid') || err.toLowerCase().includes('credentials') || err.toLowerCase().includes('user not found')) {
        setErrorMessage('Invalid email or password. If you registered earlier without creating a password, please click "Forgot password?" below to set your password and access your profile.');
      } else {
        setErrorMessage(err || 'Unable to sign in. Please try again.');
      }
    } else {
      if (onClose) onClose();
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }

    setSubmitting(true);
    const result = await resetPassword(email.trim());
    setSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Unable to send password reset email. Please verify your email.');
    } else {
      setSuccessMessage(result.message || 'Password reset link has been sent to your email address.');
    }
  };

  const handleSwitchToRegister = () => {
    if (onClose) onClose();
    if (onOpenRegistration) {
      setTimeout(() => {
        onOpenRegistration();
      }, 120);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className={styles.header}>
        <div className={styles.badge}>BIHAR AI MISSION</div>
        <h2 className={styles.title}>
          {mode === 'login' ? 'Sign In to Your Account' : 'Reset Your Password'}
        </h2>
        <p className={styles.subtitle}>
          {mode === 'login'
            ? 'Enter your credentials to access your AI workspace, tools, and certifications.'
            : 'Enter your registered email address to receive password reset instructions.'}
        </p>
      </div>

      {errorMessage && <div className={styles.errorAlert}>{errorMessage}</div>}
      {successMessage && <div className={styles.successAlert}>{successMessage}</div>}

      {mode === 'login' ? (
        <form onSubmit={handleLoginSubmit} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Email Address</label>
            <div className={styles.inputContainer}>
              <span className={styles.inputIcon}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </span>
              <input
                type="email"
                className={styles.input}
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputContainer}>
              <span className={styles.inputIcon}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                className={`${styles.input} ${styles.inputWithEye}`}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className={styles.eyeToggleBtn}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
            <div className={styles.forgotContainer}>
              <button
                type="button"
                className={styles.forgotLink}
                onClick={() => {
                  setErrorMessage('');
                  setSuccessMessage('');
                  setMode('forgot');
                }}
              >
                Forgot password?
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={submitting}
          >
            {submitting ? 'Signing in…' : 'Sign In →'}
          </Button>

          <p className={styles.switchPrompt}>
            Don't have an account?{' '}
            <button
              type="button"
              className={styles.textLink}
              onClick={handleSwitchToRegister}
            >
              Register with us →
            </button>
          </p>
        </form>
      ) : (
        <form onSubmit={handleForgotSubmit} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Registered Email Address</label>
            <div className={styles.inputContainer}>
              <span className={styles.inputIcon}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </span>
              <input
                type="email"
                className={styles.input}
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={submitting}
          >
            {submitting ? 'Sending link…' : 'Send Reset Link →'}
          </Button>

          <p className={styles.switchPrompt}>
            <button
              type="button"
              className={styles.textLink}
              onClick={() => {
                setErrorMessage('');
                setSuccessMessage('');
                setMode('login');
              }}
            >
              ← Back to Sign In
            </button>
          </p>
        </form>
      )}

      <div className={styles.trustBadge}>
        🔒 Secure Authentication <span className={styles.trustDot}>•</span> Privacy Protected <span className={styles.trustDot}>•</span> Official Bihar AI Portal
      </div>
    </Modal>
  );
}
