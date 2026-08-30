import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { sendWelcomeEmailViaResend } from '../utils/resendEmail';

const AuthContext = createContext();

export const getIstTimestamp = () => {
  try {
    const now = new Date();
    const options = { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    const formatter = new Intl.DateTimeFormat('en-CA', options);
    const parts = formatter.formatToParts(now);
    const map = {};
    parts.forEach(p => map[p.type] = p.value);
    const ms = String(now.getMilliseconds()).padStart(3, '0');
    return `${map.year}-${map.month}-${map.day}T${map.hour}:${map.minute}:${map.second}.${ms}+05:30`;
  } catch (e) {
    return new Date().toISOString();
  }
};

const syncUserToDetails = async (fullName, email, designation = 'Member', phone = '', district = '') => {
  if (!email || !supabase) return;
  try {
    const cleanEmail = email.toLowerCase().trim();
    const nowIso = getIstTimestamp();
    const detailData = {
      full_name: fullName || cleanEmail.split('@')[0],
      email: cleanEmail,
      mobile: phone || 'N/A',
      role_type: 'Registered User',
      designation: designation || 'Member',
      district: district || null,
      state: 'Bihar',
      intent: 'AI Learning & Skills Certification',
      created_at: nowIso
    };

    // Check if record exists in user_details table by email
    const { data } = await supabase.from('user_details').select('id').eq('email', cleanEmail).maybeSingle();
    if (data && data.id) {
      const { error: updateErr } = await supabase.from('user_details').update({
        full_name: detailData.full_name,
        designation: detailData.designation,
        district: detailData.district
      }).eq('id', data.id);
      if (updateErr) console.warn('user_details update warning:', updateErr);
    } else {
      const { error: insertErr } = await supabase.from('user_details').insert([detailData]);
      if (insertErr) {
        console.warn('user_details insert warning:', insertErr);
      }
    }
  } catch (err) {
    console.warn('Sync user_details info:', err);
  }
};

const triggerWelcomeEmail = (fullName, email, force = false) => {
  if (!email) return;
  const cleanEmail = email.toLowerCase().trim();
  const welcomeKey = 'bihar_ai_welcome_sent_' + cleanEmail;
  if (force || !localStorage.getItem(welcomeKey)) {
    localStorage.setItem(welcomeKey, 'true');
    sendWelcomeEmailViaResend({ fullName: fullName || cleanEmail.split('@')[0], email: cleanEmail })
      .then((res) => console.log('🎉 Welcome email sent successfully:', res))
      .catch((e) => console.warn('Welcome email error:', e));
  }
};

export const AuthProvider = ({ children }) => {
  // Initialize state directly from localStorage for instant persistent login
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('bihar_ai_user');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (parsed && parsed.email && parsed.email.toLowerCase().includes('admin@biharaimission.org')) {
        localStorage.removeItem('bihar_ai_user');
        return null;
      }
      if (parsed && parsed.fullName && parsed.fullName.toLowerCase() === 'admin') {
        const parts = parsed.email.split('@')[0].split('.');
        parsed.fullName = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
      }
      return parsed;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  // Helper to extract clean user metadata (excludes admin@biharaimission.org)
  const formatUserData = (sbUser, customMeta = {}) => {
    if (!sbUser || !sbUser.email) return null;
    if (sbUser.email.toLowerCase().includes('admin@biharaimission.org')) {
      return null;
    }

    const meta = sbUser.user_metadata || sbUser.raw_user_meta_data || {};
    let rawName = customMeta.fullName || meta.full_name || meta.fullName;

    if (!rawName || rawName.toLowerCase() === 'admin') {
      const parts = sbUser.email.split('@')[0].split('.');
      rawName = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
    }

    const formattedUser = {
      id: sbUser.id || 'usr-' + Date.now(),
      email: sbUser.email,
      fullName: rawName,
      designation: customMeta.designation || meta.designation || 'Officer / Citizen',
    };
    if (customMeta.phone || meta.phone) formattedUser.phone = customMeta.phone || meta.phone;
    if (customMeta.district || meta.district) formattedUser.district = customMeta.district || meta.district;
    return formattedUser;
  };

  useEffect(() => {
    let mounted = true;

    // 1. Check active Supabase session and verify DB record existence
    const initAuth = async () => {
      try {
        const savedUserStr = localStorage.getItem('bihar_ai_user');
        let currentEmail = null;
        let formatted = null;

        if (supabase && supabase.auth) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session && session.user) {
            formatted = formatUserData(session.user);
            if (formatted && formatted.email) {
              currentEmail = formatted.email.toLowerCase().trim();
            }
          }
        }

        if (!currentEmail && savedUserStr) {
          try {
            const parsed = JSON.parse(savedUserStr);
            if (parsed && parsed.email) {
              currentEmail = parsed.email.toLowerCase().trim();
              formatted = parsed;
            }
          } catch (e) {}
        }

        if (currentEmail) {
          if (mounted && formatted) {
            setUser(formatted);
            localStorage.setItem('bihar_ai_user', JSON.stringify(formatted));

            // Sync to user_details table and trigger welcome email
            syncUserToDetails(formatted.fullName, formatted.email, formatted.designation, formatted.phone, formatted.district);
            triggerWelcomeEmail(formatted.fullName, formatted.email);
          }
        } else if (mounted) {
          setUser(null);
        }
      } catch (err) {
        console.warn('Supabase auth session fetch info:', err);
      }
    };

    initAuth();

    // 2. Listen to Supabase auth state changes
    let subscription = null;
    if (supabase && supabase.auth && supabase.auth.onAuthStateChange) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (mounted && session && session.user) {
          const formatted = formatUserData(session.user);
          if (formatted && formatted.email) {
            setUser(formatted);
            localStorage.setItem('bihar_ai_user', JSON.stringify(formatted));

            // Sync session user metadata into user_details table
            syncUserToDetails(formatted.fullName, formatted.email, formatted.designation, formatted.phone, formatted.district);
            triggerWelcomeEmail(formatted.fullName, formatted.email);
          }
        }
      });
      subscription = data ? data.subscription : null;
    }

    return () => {
      mounted = false;
      if (subscription && subscription.unsubscribe) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Login handler - Pure Supabase Authentication without local password bypasses
  const login = async (email, password) => {
    const cleanEmail = email.toLowerCase().trim();

    try {
      if (!supabase || !supabase.auth) {
        return { success: false, error: 'Authentication service is unavailable' };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        return { success: false, error: error.message || 'Invalid email or password' };
      }

      if (data && data.user) {
        // Verify user account exists in user_details
        const { data: dbUser } = await supabase
          .from('user_details')
          .select('id')
          .eq('email', cleanEmail)
          .maybeSingle();

        const formatted = formatUserData(data.user);
        if (formatted) {
          setUser(formatted);
          localStorage.setItem('bihar_ai_user', JSON.stringify(formatted));
          return { success: true, user: formatted };
        }
      }

      return { success: false, error: 'Could not retrieve user session' };
    } catch (err) {
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  // Signup handler
  const signup = async ({ fullName, email, password, designation, phone = '', district = '' }) => {
    const cleanEmail = email.toLowerCase().trim();
    let supabaseResult = null;

    localStorage.removeItem('bihar_ai_welcome_sent_' + cleanEmail);
    localStorage.removeItem('bihar_ai_user');

    try {
      if (!supabase || !supabase.auth) {
        return { success: false, error: 'Authentication service is unavailable' };
      }

      const metadata = {
        full_name: fullName,
        designation: designation,
      };
      if (phone) metadata.phone = phone;
      if (district) metadata.district = district;

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        if (error.message && (error.message.includes('already registered') || error.message.includes('User already exists'))) {
          const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
          if (signInErr) {
            return { success: false, error: error.message };
          }
          supabaseResult = signInData;
          await supabase.auth.updateUser({ data: metadata }).catch(() => {});
        } else {
          return { success: false, error: error.message };
        }
      } else {
        supabaseResult = data;
      }

      // Format new user profile
      const newUser = {
        id: supabaseResult?.user?.id || 'usr-' + Date.now(),
        email: cleanEmail,
        fullName,
        designation: designation || 'Officer / Citizen',
      };
      if (phone) newUser.phone = phone;
      if (district) newUser.district = district;

      // Save to user_details table
      await syncUserToDetails(fullName, cleanEmail, designation, phone, district);

      setUser(newUser);
      localStorage.setItem('bihar_ai_user', JSON.stringify(newUser));

      // Send official welcome email
      triggerWelcomeEmail(fullName, cleanEmail, true);

      return { success: true, user: newUser };
    } catch (err) {
      return { success: false, error: err.message || 'Signup failed' };
    }
  };

  // Helper to dynamically load Google Identity Services SDK
  const loadGoogleSdk = () => {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.accounts) {
        resolve(window.google);
        return;
      }
      const existing = document.getElementById('google-gsi-sdk');
      if (existing) {
        existing.addEventListener('load', () => resolve(window.google));
        return;
      }
      const script = document.createElement('script');
      script.id = 'google-gsi-sdk';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(window.google);
      script.onerror = (err) => reject(err);
      document.head.appendChild(script);
    });
  };

  // 1-Click Google OAuth & In-Page Token Client login/signup handler
  const loginWithGoogle = async () => {
    try {
      if (!supabase || !supabase.auth) {
        return { success: false, error: 'Supabase client is not initialized' };
      }

      const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '940188247500-012ore51vpirncj1bvl31dtau38s8o5u.apps.googleusercontent.com';
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

      if (isMobileDevice) {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        return { success: true, data };
      }

      if (googleClientId) {
        try {
          await loadGoogleSdk();
          const popupResult = await new Promise((resolve) => {
            const client = window.google.accounts.oauth2.initTokenClient({
              client_id: googleClientId,
              scope: 'email profile openid',
              callback: async (tokenResponse) => {
                if (tokenResponse.error) {
                  resolve({ success: false, error: tokenResponse.error });
                  return;
                }
                try {
                  const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                  });
                  const googleUser = await userRes.json();

                  if (googleUser && googleUser.email) {
                    const formatted = {
                      id: 'g-' + (googleUser.sub || Date.now()),
                      email: googleUser.email,
                      fullName: googleUser.name || googleUser.given_name || googleUser.email.split('@')[0],
                      avatar_url: googleUser.picture || '',
                      designation: 'Member',
                      provider: 'google'
                    };

                    setUser(formatted);
                    localStorage.setItem('bihar_ai_user', JSON.stringify(formatted));

                    let isNewUser = false;
                    try {
                      const { data: existing } = await supabase.from('user_details').select('id').eq('email', formatted.email).maybeSingle();
                      if (!existing) isNewUser = true;
                    } catch (e) {}

                    await syncUserToDetails(formatted.fullName, formatted.email, formatted.designation);
                    triggerWelcomeEmail(formatted.fullName, formatted.email, isNewUser);

                    resolve({ success: true, user: formatted });
                  } else {
                    resolve({ success: false, error: 'Could not retrieve Google profile data.' });
                  }
                } catch (err) {
                  resolve({ success: false, error: err.message });
                }
              }
            });

            client.requestAccessToken();
          });

          if (popupResult && popupResult.success) {
            return popupResult;
          }
        } catch (sdkErr) {
          console.warn('Google SDK load error, falling back to OAuth redirect:', sdkErr);
        }
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message || 'Google sign in failed' };
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      if (supabase && supabase.auth) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Sign out warning:', err);
    } finally {
      setUser(null);
      localStorage.removeItem('bihar_ai_user');
    }
  };

  // Reset Password request handler
  const resetPassword = async (email) => {
    const cleanEmail = email.toLowerCase().trim();
    localStorage.setItem('bihar_ai_reset_email', cleanEmail);

    const redirectUrl = `${window.location.origin}/reset-password`;

    try {
      if (supabase && supabase.auth) {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: redirectUrl,
        });
        if (error) {
          if (error.status === 429 || error.message?.includes('rate limit') || error.message?.includes('Email rate limit exceeded')) {
            return { 
              success: false, 
              error: 'Email request limit reached. Please wait a few minutes before trying again.' 
            };
          }
          if (error.status === 500) {
            return {
              success: false,
              error: 'Authentication email service temporarily busy. Please wait 2 minutes and retry, or contact support.'
            };
          }
          return { success: false, error: error.message };
        }
        return {
          success: true,
          message: `Password reset link has been sent to ${cleanEmail}. Please check your inbox.`,
        };
      }
      return { success: false, error: 'Auth client unavailable' };
    } catch (err) {
      return { success: false, error: err.message || 'Failed to send password reset email' };
    }
  };

  // Update Password handler
  const updatePassword = async (newPassword) => {
    try {
      if (!supabase || !supabase.auth) {
        return { success: false, error: 'Authentication service is unavailable' };
      }

      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data && data.user) {
        const formatted = formatUserData(data.user);
        setUser(formatted);
        localStorage.setItem('bihar_ai_user', JSON.stringify(formatted));
        return { success: true, message: 'Password updated successfully!' };
      }

      return { success: false, error: 'Could not update password' };
    } catch (err) {
      return { success: false, error: err.message || 'Failed to update password' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, resetPassword, updatePassword, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
