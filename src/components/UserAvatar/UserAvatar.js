import React, { useState, useEffect } from 'react';

/**
 * UserAvatar component
 * Renders user's profile image if available and successfully loaded.
 * If image is missing or fails to load (onError), falls back to displaying
 * the first letter of the user's name/email.
 */
export default function UserAvatar({ user, className = '', style = {}, textStyle = {} }) {
  const [imgError, setImgError] = useState(false);

  const avatarUrl = user?.avatar_url || user?.picture || user?.photoURL || user?.avatar || '';

  useEffect(() => {
    setImgError(false);
  }, [avatarUrl]);

  const rawName = user?.fullName || user?.full_name || user?.name || user?.displayName || user?.email || '';
  const firstLetter = rawName.trim().charAt(0).toUpperCase() || 'U';

  if (avatarUrl && !imgError) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className={className}
        style={{ objectFit: 'cover', ...style }}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <span style={textStyle}>
      {firstLetter}
    </span>
  );
}
