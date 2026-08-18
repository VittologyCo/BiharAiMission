import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Button.module.css';

/**
 * Button Component — Bihar AI Mission Design System (§4.1)
 * Supports primary, secondary, and ghost variants.
 * Can render as a <button>, React Router <Link>, or standard <a> element.
 */
const Button = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'ghost'
  size = 'md',        // 'sm' | 'md' | 'lg'
  to,                 // React Router link target
  href,               // External link target
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  icon,
  iconPosition = 'left',
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
      {icon && iconPosition === 'left' && <span className={styles.iconLeft}>{icon}</span>}
      <span className={styles.label}>{children}</span>
      {variant === 'ghost' && <span className={styles.ghostLine} />}
      {icon && iconPosition === 'right' && <span className={styles.iconRight}>{icon}</span>}
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
