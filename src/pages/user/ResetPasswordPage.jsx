import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from './ResetPasswordPage.module.css';

const LockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const EyeIcon = ({ visible }) => visible ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
) : (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    const result = await updatePassword(newPassword);
    setSubmitting(false);

    if (result.success) {
      setSuccessMessage('Your password has been updated successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } else {
      setErrorMessage(result.error || 'Failed to update password. Please try again.');
    }
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      background: 'linear-gradient(180deg, #EFEAE5 0%, var(--color-sand-50, #FBF8F3) 100%)',
    }}>
      <div className={styles.card}>
        <div style={{ textTransform: 'uppercase', fontSize: '10px', fontWeight: '800', color: '#000000', letterSpacing: '0.08em', marginBottom: '8px' }}>
          BIHAR AI MISSION
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', margin: '0 0 6px 0', letterSpacing: '-0.01em' }}>
          Set New Password
        </h2>
        <p style={{ fontSize: '13.5px', color: '#9CA3AF', margin: '0 0 20px 0', lineHeight: '1.5' }}>
          Please enter and confirm your new password to secure your account.
        </p>

        {errorMessage && (
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FCA5A5',
            color: '#991B1B',
            padding: '9px 12px',
            borderRadius: '8px',
            fontSize: '12.5px',
            fontWeight: '600',
            marginBottom: '16px',
          }}>
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div style={{
            background: '#F0FDF4',
            border: '1px solid #86EFAC',
            color: '#166534',
            padding: '9px 12px',
            borderRadius: '8px',
            fontSize: '12.5px',
            fontWeight: '600',
            marginBottom: '16px',
          }}>
            {successMessage}
          </div>
        )}

        <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              New Password *
            </label>
            <div className={styles.inputContainer}>
              <span className={styles.inputIcon}>
                <LockIcon />
              </span>
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className={styles.input}
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
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              Confirm New Password *
            </label>
            <div className={styles.inputContainer}>
              <span className={styles.inputIcon}>
                <LockIcon />
              </span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={styles.input}
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
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={styles.submitBtn}
          >
            {submitting ? 'Updating Password...' : 'Update Password →'}
          </button>
        </form>

        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => navigate('/')}
            className={styles.textLink}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
