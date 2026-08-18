import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';

const ProtectedRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null); // null = loading, true/false = verified
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const verifyAdminStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || !session.user || !session.user.email) {
          if (mounted) {
            setIsAdmin(false);
            setLoading(false);
          }
          return;
        }

        const userEmail = session.user.email.toLowerCase().trim();

        // Check admin_users table in Supabase
        const { data: adminRecord, error } = await supabase
          .from('admin_users')
          .select('id, email, role')
          .eq('email', userEmail)
          .maybeSingle();

        if (!error && adminRecord && adminRecord.role === 'admin') {
          if (mounted) {
            setIsAdmin(true);
            setLoading(false);
          }
          return;
        }

        // Non-admin user -> reject access
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      verifyAdminStatus();
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
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
