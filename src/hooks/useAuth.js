import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { sendWelcomeEmailViaResend, sendPasswordResetEmailViaResend } from '../utils/resendEmail';
import { toast } from '../context/ToastContext';
import { withAuthRetry, handleAuthSuccess, handleAuthFailure, isAuthRejection } from '../utils/withAuthRetry';

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

export const purgeAllUserData = (email) => {
  try {
    const clean = (email || '').toLowerCase().trim();
    // 1. Remove user and auth-related keys
    localStorage.removeItem('bihar_ai_user');
    localStorage.removeItem('bihar_ai_reset_email');
    localStorage.removeItem('bihar_ai_reset_state');

    // 2. Remove all Supabase session auth tokens
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        if ((key.startsWith('sb-') && key.endsWith('-auth-token')) || key.startsWith('supabase.auth.')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch (e) {}

    if (clean) {
      localStorage.removeItem('bihar_ai_welcome_sent_' + clean);
      localStorage.removeItem('bihar_ai_profile_saved_' + clean);

      // 3. Scan and remove all email/user-specific keys (enrollments, progress, attempts)
      try {
        const userSpecificKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (!key) continue;
          const lkey = key.toLowerCase();
          if (lkey.includes(clean)) {
            userSpecificKeys.push(key);
          }
        }
        userSpecificKeys.forEach((k) => localStorage.removeItem(k));
      } catch (e) {}

      // 4. Remove from bihar_ai_submissions
      try {
        const rawSubs = localStorage.getItem('bihar_ai_submissions');
        if (rawSubs) {
          const subs = JSON.parse(rawSubs);
          if (Array.isArray(subs)) {
            const filtered = subs.filter((s) => {
              const semail = (s.email || s.user_email || s.candidateEmail || '').toLowerCase().trim();
              return semail !== clean;
            });
            localStorage.setItem('bihar_ai_submissions', JSON.stringify(filtered));
          }
        }
      } catch (e) {}

      // 5. Remove from bihar_ai_local_submissions
      try {
        const rawLocal = localStorage.getItem('bihar_ai_local_submissions');
        if (rawLocal) {
          const locals = JSON.parse(rawLocal);
          if (Array.isArray(locals)) {
            const filtered = locals.filter((s) => {
              const semail = (s.email || '').toLowerCase().trim();
              return semail !== clean;
            });
            localStorage.setItem('bihar_ai_local_submissions', JSON.stringify(filtered));
          }
        }
      } catch (e) {}

      // 6. Remove from bihar_ai_exam_submissions
      try {
        const rawExams = localStorage.getItem('bihar_ai_exam_submissions');
        if (rawExams) {
          const exams = JSON.parse(rawExams);
          if (Array.isArray(exams)) {
            const filtered = exams.filter((s) => {
              const semail = (s.candidateEmail || s.user_email || s.email || '').toLowerCase().trim();
              return semail !== clean;
            });
            localStorage.setItem('bihar_ai_exam_submissions', JSON.stringify(filtered));
          }
        }
      } catch (e) {}
    }

    // 7. Dispatch purge events for all components
    window.dispatchEvent(new Event('bihar_ai_user_purged'));
    window.dispatchEvent(new Event('bihar_ai_exams_updated'));
    window.dispatchEvent(new Event('bihar_ai_courses_updated'));
  } catch (err) {
    console.warn('Error in purgeAllUserData:', err);
  }
};

const syncUserToDetails = async (fullName, email, designation, phone, district, password = null, { allowInsert = false } = {}) => {
  try {
    if (!supabase) return;
    const cleanEmail = (email || '').toLowerCase().trim();
    if (!cleanEmail) return;

    // Check if record exists in user_details table by email withAuthRetry
    const { data } = await withAuthRetry(() => 
      supabase.from('user_details').select('id').eq('email', cleanEmail).maybeSingle()
    ).catch(() => ({ data: null }));

    if (data && data.id) {
      const updateFields = {
        full_name: fullName || cleanEmail.split('@')[0],
        designation: designation || 'Member',
        district: district || null,
        updated_at: new Date().toISOString(),
      };
      if (phone && phone !== 'N/A') updateFields.mobile = phone;
      if (password) updateFields.password = password;

      await withAuthRetry(
        () => supabase.from('user_details').update(updateFields).eq('id', data.id),
        { isWrite: true, idempotent: true }
      ).catch(() => {});
    } else if (allowInsert) {
      // Only insert if allowInsert is explicitly enabled (e.g. registration/google signup).
      // NEVER insert on background sync, to prevent re-creating deleted users!
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
      if (password) {
        detailData.password = password;
      }

      // Try secure RPC first (immune to client RLS restrictions), fallback to direct upsert
      const rpcResult = await supabase.rpc('register_candidate_profile', {
        profile_data: detailData
      }).catch(() => null);

      if (!rpcResult || !rpcResult.data || !rpcResult.data.success) {
        await withAuthRetry(
          () => supabase.from('user_details').upsert([detailData], { onConflict: 'email' }),
          { isWrite: true, idempotent: true }
        ).catch(() => {});
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

  // Force purge user data and terminate session immediately
  const forcePurgeAndLogout = (reason = 'Your session has ended.') => {
    const targetEmail = (user?.email || localStorage.getItem('bihar_ai_reset_email') || '').toLowerCase().trim();
    purgeAllUserData(targetEmail);
    try {
      if (supabase && supabase.auth) {
        supabase.auth.signOut().catch(() => {});
      }
    } catch (e) {}
    setUser(null);
    toast.error(reason);

    // If currently on a protected route, redirect to home immediately
    const protectedPaths = ['/profile', '/admin'];
    const currentPath = window.location.pathname;
    if (protectedPaths.some((p) => currentPath.startsWith(p))) {
      window.location.replace('/');
    }
  };

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
          try {
            const result = await withAuthRetry(() => supabase.auth.getSession());
            const session = result?.data?.session;
            if (session && session.user) {
              handleAuthSuccess();
              formatted = formatUserData(session.user);
              if (formatted && formatted.email) {
                currentEmail = formatted.email.toLowerCase().trim();
              }
            }
          } catch (sessionErr) {
            if (isAuthRejection(sessionErr)) {
              handleAuthFailure(() => {
                purgeAllUserData(currentEmail);
                if (mounted) setUser(null);
              });
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
          // CRUCIAL: Verify that this user actually exists in the database!
          // If the user was deleted by an admin while the client was offline/closed,
          // user_details will NOT contain this email.
          try {
            const { data: dbUser, error: checkErr } = await supabase
              .from('user_details')
              .select('id, full_name, email, designation, district, mobile')
              .eq('email', currentEmail)
              .maybeSingle();

            if (!checkErr && !dbUser) {
              // User was deleted! Clean up everything immediately.
              console.warn('🚨 Account was deleted by admin: user does not exist in user_details.');
              purgeAllUserData(currentEmail);
              if (supabase?.auth) {
                await supabase.auth.signOut().catch(() => {});
              }
              if (mounted) {
                setUser(null);
              }
              return;
            }

            if (dbUser && mounted) {
              const verified = {
                id: dbUser.id,
                email: dbUser.email,
                fullName: dbUser.full_name || formatted?.fullName || dbUser.email.split('@')[0],
                designation: dbUser.designation || formatted?.designation || 'Member',
                district: dbUser.district || formatted?.district || null,
                phone: (dbUser.mobile && dbUser.mobile !== 'N/A') ? dbUser.mobile : (formatted?.phone || null),
              };
              setUser(verified);
              localStorage.setItem('bihar_ai_user', JSON.stringify(verified));
              return;
            }
          } catch (verifyEx) {
            console.warn('User integrity check notice:', verifyEx);
          }

          if (mounted && formatted) {
            setUser(formatted);
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
          }
        }
      });
      subscription = data ? data.subscription : null;
    }

    // 3. Realtime listeners & heartbeat for instant account revocation
    let authEventsChannel = null;
    let userDetailsChannel = null;
    let heartbeatTimer = null;

    if (supabase) {
      // Listen for admin broadcast event 'user_deleted'
      try {
        authEventsChannel = supabase.channel('bihar_ai_auth_events');
        authEventsChannel.on('broadcast', { event: 'user_deleted' }, (payload) => {
          const deletedEmail = payload?.payload?.email?.toLowerCase()?.trim();
          const activeEmail = (user?.email || localStorage.getItem('bihar_ai_reset_email') || '').toLowerCase().trim();
          if (deletedEmail && activeEmail && deletedEmail === activeEmail) {
            console.warn('🚨 Instant revocation: user_deleted event received via Realtime broadcast.');
            forcePurgeAndLogout('Your account has been deleted by an administrator.');
          }
        }).subscribe();
      } catch (e) {
        console.warn('Auth events subscription warning:', e);
      }

      // Listen for postgres_changes DELETE on user_details
      try {
        userDetailsChannel = supabase.channel('user_details_realtime_deletions');
        userDetailsChannel.on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'user_details' },
          (payload) => {
            const deletedEmail = (payload?.old?.email || '').toLowerCase().trim();
            const activeEmail = (user?.email || '').toLowerCase().trim();
            if (deletedEmail && activeEmail && deletedEmail === activeEmail) {
              console.warn('🚨 Instant revocation: user_details row deleted in PostgreSQL.');
              forcePurgeAndLogout('Your account has been deleted by an administrator.');
            }
          }
        ).subscribe();
      } catch (e) {
        console.warn('User details subscription warning:', e);
      }
    }

    // 4. Heartbeat check every 15 seconds to actively verify account integrity
    heartbeatTimer = setInterval(async () => {
      const activeEmail = user?.email?.toLowerCase()?.trim();
      if (!activeEmail || !supabase) return;
      try {
        const { data, error } = await supabase
          .from('user_details')
          .select('id')
          .eq('email', activeEmail)
          .maybeSingle();

        if (!error && !data) {
          console.warn('🚨 Heartbeat check: user_details row is gone. Forcing instant logout.');
          forcePurgeAndLogout('Your account has been deleted by an administrator.');
        }
      } catch (e) {}
    }, 15000);

    // 5. Tab visibility change & window focus check
    const handleFocusCheck = async () => {
      const activeEmail = user?.email?.toLowerCase()?.trim();
      if (!activeEmail || !supabase) return;
      if (document.visibilityState === 'visible') {
        try {
          const { data, error } = await supabase
            .from('user_details')
            .select('id')
            .eq('email', activeEmail)
            .maybeSingle();

          if (!error && !data) {
            forcePurgeAndLogout('Your account has been deleted by an administrator.');
          }
        } catch (e) {}
      }
    };

    document.addEventListener('visibilitychange', handleFocusCheck);
    window.addEventListener('focus', handleFocusCheck);

    return () => {
      mounted = false;
      if (subscription && subscription.unsubscribe) {
        subscription.unsubscribe();
      }
      if (authEventsChannel && supabase) {
        supabase.removeChannel(authEventsChannel);
      }
      if (userDetailsChannel && supabase) {
        supabase.removeChannel(userDetailsChannel);
      }
      if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
      }
      document.removeEventListener('visibilitychange', handleFocusCheck);
      window.removeEventListener('focus', handleFocusCheck);
    };
  }, [user?.email]);

// In-memory rate limiting to prevent brute force and spam attacks
const failedLoginAttempts = new Map();
const resetCooldownMap = new Map();

  // Login handler - Supabase Auth with user_details sync
  const login = async (email, password) => {
    const cleanEmail = email.toLowerCase().trim();

    // 0. Brute Force Protection: Lock after 5 consecutive failed attempts
    const now = Date.now();
    const attempts = failedLoginAttempts.get(cleanEmail) || { count: 0, lockUntil: 0 };
    if (now < attempts.lockUntil) {
      const waitSec = Math.ceil((attempts.lockUntil - now) / 1000);
      return {
        success: false,
        error: `Too many failed login attempts. For security, please wait ${waitSec}s before retrying.`,
      };
    }

    try {
      if (!supabase) {
        return { success: false, error: 'Authentication service is unavailable' };
      }

      let authSuccess = false;
      let authenticatedUser = null;

      // 1. Try standard Supabase Auth
      if (supabase.auth) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (!error && data && data.user) {
          authSuccess = true;
          authenticatedUser = formatUserData(data.user);
        }
      }

      // 2. Fallback: Verify password against user_details hash via secure server-side bcrypt RPC
      if (!authSuccess) {
        try {
          const { data: verifyResult, error: verifyErr } = await supabase.rpc('verify_user_password', {
            email_input: cleanEmail,
            password_input: password,
          });

          if (!verifyErr && verifyResult && verifyResult.success) {
            authenticatedUser = {
              id: verifyResult.user_id || 'usr-' + Date.now(),
              email: verifyResult.email || cleanEmail,
              fullName: verifyResult.full_name || cleanEmail.split('@')[0],
              designation: verifyResult.designation || 'Officer / Citizen',
              mobile: verifyResult.mobile,
              district: verifyResult.district,
            };
            authSuccess = true;

            // Sync Supabase Auth in background so next login uses primary path
            supabase.auth.signUp({
              email: cleanEmail,
              password,
              options: { data: { full_name: authenticatedUser.fullName } },
            }).catch(() => {});
          }
        } catch (rpcEx) {
          console.warn('Password verify RPC notice:', rpcEx);
        }
      }

      if (authSuccess && authenticatedUser) {
        // Reset failed attempts counter on successful authentication
        failedLoginAttempts.delete(cleanEmail);
        setUser(authenticatedUser);
        localStorage.setItem('bihar_ai_user', JSON.stringify(authenticatedUser));
        toast.success(`🎉 Welcome back, ${authenticatedUser.fullName || 'Member'}! Signed in successfully.`);
        return { success: true, user: authenticatedUser };
      }

      // Track failed attempt
      attempts.count += 1;
      if (attempts.count >= 5) {
        attempts.lockUntil = now + 60 * 1000; // 60-second lock
        failedLoginAttempts.set(cleanEmail, attempts);
        return {
          success: false,
          error: 'Too many failed login attempts. Account temporarily locked for 60 seconds.',
        };
      }
      failedLoginAttempts.set(cleanEmail, attempts);

      return { success: false, error: 'Invalid email or password. Please check your credentials.' };
    } catch (err) {
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  // Signup handler — Stores account in Supabase auth AND public.user_details with password
  const signup = async ({ fullName, email, password, designation, phone = '', district = '' }) => {
    const cleanEmail = email.toLowerCase().trim();
    let supabaseResult = null;

    localStorage.removeItem('bihar_ai_welcome_sent_' + cleanEmail);
    localStorage.removeItem('bihar_ai_user');

    try {
      if (!supabase) {
        return { success: false, error: 'Authentication service is unavailable' };
      }

      const metadata = {
        full_name: fullName,
        designation: designation,
      };
      if (phone) metadata.phone = phone;
      if (district) metadata.district = district;

      if (supabase.auth) {
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
            if (!signInErr) {
              supabaseResult = signInData;
              await supabase.auth.updateUser({ data: metadata }).catch(() => {});
            }
          }
        } else {
          supabaseResult = data;
        }
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

      // Save to user_details table with password (explicit account registration)
      await syncUserToDetails(fullName, cleanEmail, designation, phone, district, password, { allowInsert: true });

      setUser(newUser);
      localStorage.setItem('bihar_ai_user', JSON.stringify(newUser));

      // Send official welcome email
      triggerWelcomeEmail(fullName, cleanEmail, true);
      toast.success(`🎉 Account created successfully! Welcome to Bihar AI Mission, ${fullName}.`);

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

      const googleClientId =
        process.env.REACT_APP_GOOGLE_CLIENT_ID ||
        process.env.REACT_APP_GOOGLE_CLIEN ||
        '940188247500-012ore51vpirncj1bvl31dtau38s8o5u.apps.googleusercontent.com';
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

                    await syncUserToDetails(formatted.fullName, formatted.email, formatted.designation, null, null, null, { allowInsert: true });
                    if (isNewUser) {
                      triggerWelcomeEmail(formatted.fullName, formatted.email, true);
                    }
                    toast.success(`🎉 Welcome back, ${formatted.fullName}! Signed in successfully.`);

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

  // Logout handler — Purges all user data completely from browser storage
  const logout = async () => {
    try {
      const targetEmail = (user?.email || '').toLowerCase().trim();
      if (supabase && supabase.auth) {
        await supabase.auth.signOut().catch(() => {});
      }
      purgeAllUserData(targetEmail);
    } catch (err) {
      console.warn('Sign out warning:', err);
    } finally {
      setUser(null);
      toast.info('👋 You have been signed out successfully.');
    }
  };

  // Reset Password request handler — Generates secure 1-click token valid for 5 minutes delivered via Resend
  const resetPassword = async (email) => {
    const cleanEmail = email.toLowerCase().trim();
    
    // Rate limit: Allow max 1 request every 60 seconds per email
    const lastResetTime = resetCooldownMap.get(cleanEmail);
    const now = Date.now();
    if (lastResetTime && (now - lastResetTime) < 60 * 1000) {
      const remainingWait = Math.ceil((60 * 1000 - (now - lastResetTime)) / 1000);
      return {
        success: true,
        message: `Password reset request was recently dispatched. Please check your inbox or wait ${remainingWait} seconds.`,
      };
    }
    resetCooldownMap.set(cleanEmail, now);

    // Generate secure unique reset token valid for 5 minutes
    const token = 'rst_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

    const resetState = {
      email: cleanEmail,
      token,
      expiresAt,
    };

    localStorage.setItem('bihar_ai_reset_state', JSON.stringify(resetState));
    localStorage.setItem('bihar_ai_reset_email', cleanEmail);

    const redirectUrl = `${window.location.origin}/reset-password?email=${encodeURIComponent(cleanEmail)}&token=${token}`;

    try {
      // Store reset token and expiration directly in user_details table
      if (supabase) {
        supabase.from('user_details').update({
          reset_token: token,
          reset_expires_at: new Date(expiresAt).toISOString(),
          updated_at: new Date().toISOString(),
        }).eq('email', cleanEmail).then(() => {}).catch(() => {});
      }

      // Deliver via verified Resend API with 1-click button (5 min validity)
      const resendResult = await sendPasswordResetEmailViaResend({
        email: cleanEmail,
        resetUrl: redirectUrl,
      });

      if (resendResult && resendResult.success) {
        return {
          success: true,
          message: `Password reset instructions have been sent to ${cleanEmail}. Please check your inbox.`,
        };
      }

      return {
        success: false,
        error: resendResult?.reason || 'Failed to dispatch password reset email. Please check server configuration.',
      };
    } catch (err) {
      return {
        success: false,
        error: err?.message || 'Failed to dispatch password reset link. Please try again.',
      };
    }
  };

  // Update Password handler — Hashes password with bcrypt and syncs user_details + auth.users without auto-login
  const updatePassword = async (newPassword, authPayload = {}) => {
    try {
      const targetEmail = (
        authPayload.email ||
        new URLSearchParams(window.location.search).get('email') ||
        localStorage.getItem('bihar_ai_reset_email') ||
        user?.email ||
        ''
      ).toLowerCase().trim();

      if (!targetEmail) {
        return { success: false, error: 'Could not identify account for password reset. Please enter your email.' };
      }

      // Step A: Update and sync hashed password in database via secure RPC
      if (supabase) {
        try {
          const { data: rpcRes, error: rpcErr } = await supabase.rpc('reset_user_password_direct', {
            email_input: targetEmail,
            new_password: newPassword,
          });

          if (rpcErr) {
            console.warn('RPC reset notice:', rpcErr);
            // Fallback direct update to user_details
            await supabase.from('user_details').update({
              password: newPassword, // Note: trg_hash_user_details_password will automatically hash this on insert/update!
              reset_token: null,
              reset_expires_at: null,
              updated_at: new Date().toISOString(),
            }).eq('email', targetEmail);
          }
        } catch (rpcEx) {
          console.warn('Direct RPC execution notice:', rpcEx);
          await supabase.from('user_details').update({
            password: newPassword,
            reset_token: null,
            reset_expires_at: null,
            updated_at: new Date().toISOString(),
          }).eq('email', targetEmail);
        }
      }

      // Step B: Update Supabase auth session if active in browser
      if (supabase && supabase.auth) {
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData && sessionData.session) {
            await supabase.auth.updateUser({ password: newPassword }).catch(() => {});
          }
        } catch (sessionErr) {}
      }

      // Step C: Clean up temporary reset state
      localStorage.removeItem('bihar_ai_reset_state');
      localStorage.removeItem('bihar_ai_reset_email');

      return { 
        success: true, 
        message: 'Password reset successful! You can now sign in with your new password.' 
      };
    } catch (err) {
      return { success: false, error: err.message || 'Failed to update password' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        forcePurgeAndLogout,
        purgeAllUserData,
        resetPassword,
        updatePassword,
        loginWithGoogle,
      }}
    >
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
