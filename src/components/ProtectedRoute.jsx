import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { withAuthRetry } from '../utils/withAuthRetry';

const ProtectedRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null); // null = loading, true/false = verified
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const verifyAdminStatus = async () => {
      // 1. Verify Active Supabase Session Cryptographically (with silent 401 retry)
      try {
        if (!supabase || !supabase.auth) {
          if (mounted) {
            setIsAdmin(false);
            setLoading(false);
          }
          return;
        }

        const sessionResult = await withAuthRetry(() => supabase.auth.getSession()).catch(() => null);
        const session = sessionResult?.data?.session;
        if (!session || !session.user || !session.user.email) {
          localStorage.removeItem('bihar_ai_admin_session');
          if (mounted) {
            setIsAdmin(false);
            setLoading(false);
          }
          return;
        }

        const userEmail = session.user.email.toLowerCase().trim();

        // 2. Strict Whitelist or Verified Role Checks via protected app_metadata (never user_metadata)
        const appMeta = session.user.app_metadata || {};
        const isWhitelistedAdmin = userEmail === 'admin@biharaimission.org';
        const hasAdminRoleMeta = appMeta.role === 'admin' || appMeta.is_admin === true;

        if (isWhitelistedAdmin || hasAdminRoleMeta) {
          if (mounted) {
            localStorage.setItem('bihar_ai_admin_session', JSON.stringify({ email: userEmail, authenticatedAt: Date.now() }));
            setIsAdmin(true);
            setLoading(false);
          }
          return;
        }

        // 4. Check user_details table for admin role_type
        try {
          const detailRes = await withAuthRetry(() =>
            supabase
              .from('user_details')
              .select('id, role_type, designation')
              .eq('email', userEmail)
              .maybeSingle()
          ).catch(() => null);
          const detailData = detailRes?.data;

          if (detailData && (
            (detailData.role_type && ['admin', 'superadmin'].includes(detailData.role_type.toLowerCase().trim()))
          )) {
            if (mounted) {
              localStorage.setItem('bihar_ai_admin_session', JSON.stringify({ email: userEmail, authenticatedAt: Date.now() }));
              setIsAdmin(true);
              setLoading(false);
            }
            return;
          }
        } catch (e) {}

        // 4. Check admin_users table if exists
        try {
          const adminRes = await withAuthRetry(() =>
            supabase
              .from('admin_users')
              .select('id, email, role')
              .eq('email', userEmail)
              .maybeSingle()
          ).catch(() => null);
          const adminRecord = adminRes?.data;

          if (adminRecord && (adminRecord.role === 'admin' || adminRecord.role === 'superadmin')) {
            if (mounted) {
              localStorage.setItem('bihar_ai_admin_session', JSON.stringify({ email: userEmail, authenticatedAt: Date.now() }));
              setIsAdmin(true);
              setLoading(false);
            }
            return;
          }
        } catch (e) {}

        // Non-admin session -> reject access
        if (mounted) {
          setIsAdmin(false);
          setLoading(false);
        }
      } catch (err) {
        console.error('Admin verification error in ProtectedRoute:', err);
        if (mounted) {
          setIsAdmin(false);
          setLoading(false);
        }
      }
    };

    verifyAdminStatus();

    // Safety timeout: max 1.5 seconds loading to prevent hanging UI
    const timer = setTimeout(() => {
      if (mounted && loading) {
        setLoading(false);
        setIsAdmin((prev) => (prev === null ? false : prev));
      }
    }, 1500);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', width: '100%', background: 'var(--color-charcoal-900, #181512)', color: 'var(--color-sand-100, #F3ECE0)' }}>
        <p style={{ margin: 'auto', fontWeight: 600 }}>Verifying admin authorization...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ProtectedRoute;

