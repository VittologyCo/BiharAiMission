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
      try {
        // 1. Check if an active admin session was authenticated via AdminLogin
        let cachedAdmin = null;
        try {
          const raw = localStorage.getItem('bihar_ai_admin_session');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed?.email && (Date.now() - (parsed.authenticatedAt || 0)) < 86400000) {
              cachedAdmin = parsed;
            }
          }
        } catch (e) {}

        // 2. Check active Supabase Auth Session
        let session = null;
        if (supabase && supabase.auth) {
          try {
            const sessionResult = await withAuthRetry(() => supabase.auth.getSession()).catch(() => null);
            session = sessionResult?.data?.session;
          } catch (e) {}
        }

        const sessionEmail = (session?.user?.email || '').toLowerCase().trim();
        const cachedEmail = (cachedAdmin?.email || '').toLowerCase().trim();
        const checkEmail = cachedEmail || sessionEmail;

        if (!checkEmail) {
          if (mounted) {
            localStorage.removeItem('bihar_ai_admin_session');
            setIsAdmin(false);
            setLoading(false);
          }
          return;
        }

        // 3. Known Admin Whitelist & app_metadata checks
        const appMeta = session?.user?.app_metadata || {};
        const isWhitelistedAdmin = 
          checkEmail === 'admin@biharaimission.org' || 
          checkEmail === 'director@biharaimission.org' ||
          checkEmail === 'praveer@biharaimission.org';
        const hasAdminRoleMeta = appMeta.role === 'admin' || appMeta.is_admin === true;

        if (isWhitelistedAdmin || hasAdminRoleMeta) {
          if (mounted) {
            localStorage.setItem('bihar_ai_admin_session', JSON.stringify({ email: checkEmail, authenticatedAt: Date.now() }));
            setIsAdmin(true);
            setLoading(false);
          }
          return;
        }

        // 4. Check user_details table for admin role_type or designation
        if (supabase) {
          try {
            const detailRes = await withAuthRetry(() =>
              supabase
                .from('user_details')
                .select('id, role_type, designation')
                .ilike('email', checkEmail)
                .maybeSingle()
            ).catch(() => null);
            const detailData = detailRes?.data;

            if (detailData) {
              const roleType = (detailData.role_type || '').toLowerCase().trim();
              const designation = (detailData.designation || '').toLowerCase().trim();
              if (
                ['admin', 'superadmin', 'director'].includes(roleType) ||
                designation.includes('admin') ||
                designation.includes('director')
              ) {
                if (mounted) {
                  localStorage.setItem('bihar_ai_admin_session', JSON.stringify({ email: checkEmail, authenticatedAt: Date.now() }));
                  setIsAdmin(true);
                  setLoading(false);
                }
                return;
              }
            }
          } catch (e) {}

          // 5. Check admin_users table
          try {
            const adminRes = await withAuthRetry(() =>
              supabase
                .from('admin_users')
                .select('id, email, role')
                .ilike('email', checkEmail)
                .maybeSingle()
            ).catch(() => null);
            const adminRecord = adminRes?.data;

            if (adminRecord) {
              const role = (adminRecord.role || '').toLowerCase().trim();
              if (['admin', 'superadmin', 'director'].includes(role) || !role) {
                if (mounted) {
                  localStorage.setItem('bihar_ai_admin_session', JSON.stringify({ email: checkEmail, authenticatedAt: Date.now() }));
                  setIsAdmin(true);
                  setLoading(false);
                }
                return;
              }
            }
          } catch (e) {}
        }

        // 6. If user authenticated via AdminLogin form recently (within 24 hrs), grant access
        if (cachedAdmin && (Date.now() - (cachedAdmin.authenticatedAt || 0)) < 86400000) {
          if (mounted) {
            setIsAdmin(true);
            setLoading(false);
          }
          return;
        }

        // Non-admin session -> reject access
        if (mounted) {
          localStorage.removeItem('bihar_ai_admin_session');
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

    // Safety timeout: max 2.5 seconds loading to prevent hanging UI
    const timer = setTimeout(() => {
      if (mounted && loading) {
        setLoading(false);
        setIsAdmin((prev) => (prev === null ? false : prev));
      }
    }, 2500);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', width: '100%', background: 'var(--color-charcoal-900, #181512)', color: 'var(--color-sand-100, #F3ECE0)', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid rgba(193, 85, 44, 0.2)', borderTop: '3px solid #C1552C', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ margin: 0, fontWeight: 600, fontSize: '15px' }}>Verifying admin authorization...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAdmin) {
    // Append ?unauthorized=true to break any redirect ping-pong loop
    return <Navigate to="/admin?unauthorized=true" replace />;
  }

  return children;
};

export default ProtectedRoute;
