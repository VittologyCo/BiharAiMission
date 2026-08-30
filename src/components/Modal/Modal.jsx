import React, { useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import styles from './Modal.module.css';

/**
 * Shared Modal Shell Component — Bihar AI Mission Design System (§4.4)
 * Features:
 * - React Portal (document.body)
 * - Body scroll lock
 * - Keyboard focus trap & restore focus on close
 * - Escape key listener
 * - Multi-size responsive container (sm, md, lg, xl)
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  maxWidth,
  closeOnBackdrop = true,
  className = '',
  contentClassName = ''
}) => {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  // Handle Escape Keypress
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }

    // Focus trap inside modal
    if (e.key === 'Tab' && modalRef.current) {
      const focusables = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;

      const firstElement = focusables[0];
      const lastElement = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  }, [onClose]);

  // Lock body scroll and set up focus management
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);

      // Focus first focusable element inside modal
      setTimeout(() => {
        if (modalRef.current) {
          const focusable = modalRef.current.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusable) focusable.focus();
        }
      }, 50);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
      if (previousActiveElement.current && previousActiveElement.current.focus) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const sizeClass = styles[size] || styles.md;

  const modalContent = (
    <div className={styles.backdrop} onClick={closeOnBackdrop ? onClose : undefined}>
      <div
        className={`${styles.container} ${sizeClass} ${className}`}
        style={maxWidth ? { maxWidth } : undefined}
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* CLOSE BUTTON */}
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close modal"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* HEADER */}
        {(title || subtitle) && (
          <div className={styles.header}>
            {title && <h3 id="modal-title" className={styles.title}>{title}</h3>}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
        )}

        {/* BODY CONTENT */}
        <div className={`${styles.body} ${contentClassName}`}>
          {children}
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default Modal;
