/**
 * lib/withAuthRetry.js / src/utils/withAuthRetry.js
 * 
 * Fix #1 — Add a single silent retry-with-refresh on unexpected 401s
 * Fix #2 — Track consecutive auth failures in a short-lived counter (only logout on >= 2)
 * Fix #3 — Show calm degraded-service banner when retries exhaust
 */

import { supabase } from './supabase.js';

let consecutiveAuthFailures = 0;
const bannerListeners = new Set();

export function subscribeToAuthBanner(listener) {
  bannerListeners.add(listener);
  return () => bannerListeners.delete(listener);
}

function notifyBanner(event) {
  bannerListeners.forEach((fn) => {
    try {
      fn(event);
    } catch (e) {
      console.warn('Banner notification error:', e);
    }
  });
}

export function isAuthRejection(error) {
  if (!error) return false;
  const message = (error?.message || error?.error_description || error?.details || '').toLowerCase();
  const status = error?.status || error?.statusCode || error?.code;
  return (
    status === 401 ||
    status === '401' ||
    status === 'PGRST301' ||
    message.includes('jwt') ||
    message.includes('invalid token') ||
    message.includes('token is expired') ||
    message.includes('jwt expired') ||
    message.includes('unauthorized') ||
    message.includes('auth failure')
  );
}

export function handleAuthSuccess() {
  consecutiveAuthFailures = 0;
  notifyBanner({ type: 'CLEAR' });
}

export function handleAuthFailure(signOutAndRedirectToLogin = null) {
  consecutiveAuthFailures++;
  if (consecutiveAuthFailures >= 2) {
    // Only now treat this as a genuinely dead session
    notifyBanner({
      type: 'DEAD_SESSION',
      message: 'Your session has expired. Redirecting to sign in...'
    });
    if (typeof signOutAndRedirectToLogin === 'function') {
      signOutAndRedirectToLogin();
    }
  } else {
    // First failure: show a soft, non-alarming inline message and let withAuthRetry handle it.
    notifyBanner({
      type: 'TRANSIENT',
      message: 'Having trouble reaching the server — retrying...'
    });
  }
}

export function getConsecutiveAuthFailures() {
  return consecutiveAuthFailures;
}

export function resetConsecutiveAuthFailures() {
  consecutiveAuthFailures = 0;
}

/**
 * Execute an authenticated Supabase request with silent single retry-with-refresh on 401.
 * For write operations, silent retries only proceed if `idempotent: true` is explicitly passed.
 * Non-idempotent writes are NOT silently retried to prevent double-submitting records.
 */
export async function withAuthRetry(
  requestFn,
  {
    maxRetries = 1,
    onFatalAuthFailure = null,
    isWrite = false,
    idempotent = false,
  } = {}
) {
  // Guard: For non-idempotent writes, DO NOT silently retry on 401.
  // Instead, surface a clear prompt for the user to confirm/resubmit manually.
  if (isWrite && !idempotent) {
    try {
      const result = await requestFn();
      if (result?.error && isAuthRejection(result.error)) {
        throw result.error;
      }
      handleAuthSuccess();
      return result;
    } catch (err) {
      if (isAuthRejection(err)) {
        handleAuthFailure(onFatalAuthFailure);
        notifyBanner({
          type: 'DEGRADED',
          message:
            'Your session timed out while saving data. Please verify your submission and resubmit manually.',
        });
      }
      throw err;
    }
  }

  let attempt = 0;
  let lastError;

  while (attempt <= maxRetries) {
    try {
      const result = await requestFn();

      // If the underlying client returns an error object instead of throwing
      // (common with Supabase's `{ data, error }` pattern), check it explicitly:
      if (result?.error && isAuthRejection(result.error)) {
        throw result.error;
      }

      // Success: reset consecutive failures and clear any banner
      handleAuthSuccess();
      return result;
    } catch (err) {
      lastError = err;

      if (isAuthRejection(err) && attempt < maxRetries) {
        // First transient failure: soft banner
        notifyBanner({
          type: 'TRANSIENT',
          message: 'Having trouble reaching the server — retrying...',
        });

        // Refresh the session once, then retry the original request.
        try {
          if (supabase && supabase.auth) {
            const { error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) {
              // Refresh itself failed — this is a genuinely invalid/expired session, stop retrying.
              console.warn('⚠️ [withAuthRetry] Session refresh failed:', refreshError.message);
              break;
            }
            attempt++;
            continue;
          }
        } catch (refreshEx) {
          console.warn('⚠️ [withAuthRetry] Exception while refreshing session:', refreshEx);
          break;
        }
      }
      break; // Not an auth rejection, or retries exhausted — stop and surface the error.
    }
  }

  // If retries exhausted with auth rejection, trigger failure counter and calm degraded banner
  if (isAuthRejection(lastError)) {
    handleAuthFailure(onFatalAuthFailure);
    notifyBanner({
      type: 'DEGRADED',
      message:
        "We're experiencing temporary connectivity issues with our backend provider. Your data is safe — please try again in a moment.",
    });
  }

  throw lastError;
}
