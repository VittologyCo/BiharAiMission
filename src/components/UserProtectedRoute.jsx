import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../utils/supabase';
import { withAuthRetry } from '../utils/withAuthRetry';

const UserProtectedRoute = ({ children, onOpenAuth }) => {
  const { user, loading: authLoading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    const verifyUserSession = async () => {
      // 1. If useAuth already confirmed active verified user
      if (user && user.email) {
        if (mounted) {
          setIsAuthenticated(true);
          setChecking(false);
        }
        return;
      }

      // 2. If useAuth is currently loading/verifying with database, keep checking state true
      if (authLoading) {
        return;
      }

      // 3. useAuth finished verification and user is not authenticated / account was deleted
      if (mounted) {
        setIsAuthenticated(false);
        setChecking(false);
        if (onOpenAuth) {
          onOpenAuth('login');
        }
      }
    };

    verifyUserSession();

    return () => {
      mounted = false;
    };
  }, [user, authLoading, onOpenAuth]);

  if (checking || authLoading) {
    return (
      <div style={{
        display: 'flex',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        background: 'var(--color-charcoal-900, #181512)',
        color: 'var(--color-sand-100, #F3ECE0)',
        fontFamily: "'Space Grotesk', sans-serif"
      }}>
        <p style={{ margin: 'auto', fontWeight: 600, fontSize: '16px' }}>Verifying authorization...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Zero-flash redirect for unauthenticated access
    return <Navigate to="/" replace state={{ from: location, requireLogin: true }} />;
  }

  return children;
};

export default UserProtectedRoute;
