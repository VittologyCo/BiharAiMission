import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Button.module.css';

/**
 * Luxury Interactive Button Component — Bihar AI Mission Design System
 * Features:
 * - Multi-stop depth gradients with inner specular highlights
 * - Animated shimmer sheen on hover
 * - "Button-in-Button" trailing badge / arrow physics
 * - Haptic spring click dynamics
 */
const Button = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'ghost' | 'glass'
  size = 'md',        // 'sm' | 'md' | 'lg'
  to,                 // React Router link target
  href,               // External link target
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  icon,
  iconPosition = 'left',
  showArrow = false,
  fullWidth = false,
  ...props
}) => {
  const classNames = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    disabled ? styles.disabled : '',
    className
  ].filter(Boolean).join(' ');

  const content = (
    <>
      <span className={styles.shimmer} aria-hidden="true" />
      
      {icon && iconPosition === 'left' && (
        <span className={styles.iconLeft}>{icon}</span>
      )}
      
      <span className={styles.label}>{children}</span>

      {icon && iconPosition === 'right' && (
        <span className={styles.iconRight}>{icon}</span>
      )}

      {showArrow && (
        <span className={styles.arrowBadge}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="M12 5l7 7-7 7" />
          </svg>
        </span>
      )}

      {variant === 'ghost' && <span className={styles.ghostLine} />}
    </>
  );

  if (to && !disabled) {
    return (
      <Link to={to} className={classNames} onClick={onClick} {...props}>
        {content}
      </Link>
    );
  }

  if (href && !disabled) {
    return (
      <a href={href} className={classNames} onClick={onClick} target={props.target || '_blank'} rel={props.rel || 'noreferrer'} {...props}>
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={classNames}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {content}
    </button>
  );
};

export default Button;
