import { supabase } from '../utils/supabase';

// In-memory cache to prevent spamming identical errors within 30 seconds
const recentErrorsCache = new Map();
const DEDUPE_WINDOW_MS = 30000;

/**
 * Clean error message helper
 */
const getErrorMessage = (error) => {
  if (!error) return 'Unknown application error';
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  try {
    return JSON.stringify(error);
  } catch (e) {
    return String(error);
  }
};

/**
 * Filter out noisy third-party / browser extension errors
 */
const shouldIgnoreError = (msg, stack = '') => {
  const text = `${msg} ${stack}`.toLowerCase();
  // Cross-origin "Script error." — browser hides real details, zero actionable info
  if (text === 'script error.' || text === 'script error' || text.startsWith('script error')) return true;
  // Browser extension noise
  if (text.includes('chrome-extension://')) return true;
  if (text.includes('moz-extension://')) return true;
  if (text.includes('safari-extension://')) return true;
  if (text.includes('resizeobserver loop')) return true;
  if (text.includes('loading chunk') && text.includes('failed')) return false; // Important chunk load failure
  return false;
};

/**
 * Get current user email from localStorage
 */
const getCurrentUserEmail = () => {
  try {
    const raw = localStorage.getItem('bihar_ai_user');
    if (!raw) return null;
    const u = JSON.parse(raw);
    return u?.email || null;
  } catch (e) {
    return null;
  }
};

/**
 * Core function to log an application error to Supabase `app_error_logs`.
 */
export const logAppError = async (error, options = {}) => {
  if (!supabase) return null;

  try {
    const message = getErrorMessage(error);
    const stack = error?.stack || options.metadata?.componentStack || '';
    const errorType = options.errorType || 'unhandled_error';
    const pagePath =
      options.pagePath || (typeof window !== 'undefined' ? window.location.pathname : '/');

    // Skip ignored browser extension noise
    if (shouldIgnoreError(message, stack)) return null;

    // Deduplication check
    const dedupeKey = `${pagePath}:${message}:${errorType}`;
    const now = Date.now();
    const lastLogged = recentErrorsCache.get(dedupeKey);
    if (lastLogged && now - lastLogged < DEDUPE_WINDOW_MS) {
      return null;
    }
    recentErrorsCache.set(dedupeKey, now);

    const userEmail = options.userEmail || getCurrentUserEmail();
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';

    const payload = {
      error_message: message.slice(0, 1500),
      error_stack: stack ? stack.slice(0, 4000) : null,
      error_type: errorType,
      page_path: pagePath,
      user_email: userEmail,
      user_agent: userAgent,
      resolved: false,
      metadata: options.metadata || {},
    };

    const { data, error: insertErr } = await supabase
      .from('app_error_logs')
      .insert(payload)
      .select()
      .single();

    if (insertErr) {
      // Table may not exist yet or RLS not applied
      return null;
    }
    return data;
  } catch (err) {
    // Fail silently — error logger must NEVER crash the app
    return null;
  }
};

/**
 * Initialize global window error handlers (uncaught exceptions + unhandled promises)
 */
let isInitialized = false;

export const initGlobalErrorLogging = () => {
  if (isInitialized || typeof window === 'undefined') return;
  isInitialized = true;

  // Uncaught JavaScript errors
  window.addEventListener('error', (event) => {
    try {
      logAppError(event.error || event.message, {
        errorType: 'unhandled_error',
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    } catch (e) {}
  });

  // Unhandled Promise Rejections (e.g. failed fetches, async crashes)
  window.addEventListener('unhandledrejection', (event) => {
    try {
      const reason = event.reason;
      logAppError(reason || 'Unhandled Promise Rejection', {
        errorType: 'unhandled_rejection',
      });
    } catch (e) {}
  });
};

/**
 * Fetch error logs summary for admin
 */
export const fetchErrorLogsSummary = async () => {
  if (!supabase) return { errors: [], totalToday: 0, unresolvedCount: 0 };

  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('app_error_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);

    if (error || !Array.isArray(data)) {
      return { errors: [], totalToday: 0, unresolvedCount: 0 };
    }

    const todayIso = todayStart.toISOString();
    const totalToday = data.filter((e) => e.created_at >= todayIso).length;
    const unresolvedCount = data.filter((e) => !e.resolved).length;

    return {
      errors: data,
      totalToday,
      unresolvedCount,
    };
  } catch (e) {
    return { errors: [], totalToday: 0, unresolvedCount: 0 };
  }
};

/**
 * Mark an error as resolved
 */
export const markErrorResolved = async (errorId, resolved = true) => {
  if (!supabase || !errorId) return false;
  try {
    const { error } = await supabase
      .from('app_error_logs')
      .update({ resolved })
      .eq('id', errorId);
    return !error;
  } catch (e) {
    return false;
  }
};

/**
 * Delete / Clear an error log
 */
export const deleteErrorLog = async (errorId) => {
  if (!supabase || !errorId) return false;
  try {
    const { error } = await supabase.from('app_error_logs').delete().eq('id', errorId);
    return !error;
  } catch (e) {
    return false;
  }
};
