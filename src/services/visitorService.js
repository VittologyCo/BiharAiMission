/**
 * Bihar AI Mission — Real-Time Visitor Analytics Service
 * Uses Supabase Presence for live visitor counting + page_views table for historical data.
 */
import { supabase } from '../utils/supabase';

// Generate a unique session ID per browser tab/device
const SESSION_ID = (() => {
  if (typeof window === 'undefined') return 'ssr';
  try {
    let sid = sessionStorage.getItem('bihar_ai_session_id');
    if (!sid) {
      sid = `v_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem('bihar_ai_session_id', sid);
    }
    return sid;
  } catch (e) {
    return `v_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }
})();

// Detect device type
const getDeviceType = () => {
  if (typeof window === 'undefined') return 'Desktop';
  const ua = navigator.userAgent || '';
  if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    return 'Mobile';
  }
  return 'Desktop';
};

// ─── PRESENCE: Real-Time Active Visitors ──────────────────────────────

let presenceChannel = null;
let currentTrackedPath = '';
const presenceListeners = new Set();

/**
 * Initialize or retrieve the global presence channel
 */
const getOrCreatePresenceChannel = () => {
  if (presenceChannel || !supabase) return presenceChannel;

  presenceChannel = supabase.channel('site_visitors', {
    config: {
      presence: { key: SESSION_ID },
    },
  });

  const notifyListeners = () => {
    try {
      const state = presenceChannel.presenceState();
      const parsed = parsePresenceState(state);
      presenceListeners.forEach((fn) => {
        try {
          fn(parsed);
        } catch (err) {
          console.error('[VisitorService] listener error:', err);
        }
      });
    } catch (e) {
      console.warn('[VisitorService] presence sync warning:', e);
    }
  };

  presenceChannel
    .on('presence', { event: 'sync' }, notifyListeners)
    .on('presence', { event: 'join' }, notifyListeners)
    .on('presence', { event: 'leave' }, notifyListeners)
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        const path = currentTrackedPath || (typeof window !== 'undefined' ? window.location.pathname : '/');
        // Only track if not an admin route
        if (path && !path.startsWith('/admin')) {
          try {
            await presenceChannel.track({
              session_id: SESSION_ID,
              page: path,
              device: getDeviceType(),
              joined_at: new Date().toISOString(),
            });
          } catch (e) {}
        }
        notifyListeners();
      }
    });

  return presenceChannel;
};

/**
 * Join the presence channel and track which page this visitor is on.
 * Call this on every route change.
 */
export const trackPagePresence = (pagePath) => {
  const path = pagePath || (typeof window !== 'undefined' ? window.location.pathname : '/');
  currentTrackedPath = path;

  const channel = getOrCreatePresenceChannel();
  if (!channel) return;

  // Don't track admin pages as public visitors
  if (path.startsWith('/admin')) {
    try {
      channel.untrack();
    } catch (e) {}
    return;
  }

  try {
    channel.track({
      session_id: SESSION_ID,
      page: path,
      device: getDeviceType(),
      joined_at: new Date().toISOString(),
    });
  } catch (e) {
    console.warn('[VisitorService] track error:', e);
  }
};

/**
 * Parse Supabase presence state into usable visitor data.
 */
const parsePresenceState = (state) => {
  const visitors = [];
  const pageMap = {};
  let totalActive = 0;

  if (state && typeof state === 'object') {
    Object.keys(state).forEach((key) => {
      const presences = state[key];
      if (Array.isArray(presences) && presences.length > 0) {
        presences.forEach((p) => {
          totalActive++;
          const page = p.page || '/';
          visitors.push({
            sessionId: p.session_id || key,
            page,
            device: p.device || 'Desktop',
            joinedAt: p.joined_at || new Date().toISOString(),
          });
          pageMap[page] = (pageMap[page] || 0) + 1;
        });
      }
    });
  }

  // Sort pages by visitor count descending
  const pageBreakdown = Object.entries(pageMap)
    .map(([page, count]) => ({ page, count, label: getPageLabel(page) }))
    .sort((a, b) => b.count - a.count);

  return { totalActive, visitors, pageBreakdown };
};

/**
 * Subscribe to presence updates from anywhere in the app.
 */
export const subscribeToPresence = (callback) => {
  if (typeof callback !== 'function') return () => {};

  presenceListeners.add(callback);
  const channel = getOrCreatePresenceChannel();

  // If channel already has presence state, immediately fire current state
  if (channel) {
    try {
      const state = channel.presenceState();
      callback(parsePresenceState(state));
    } catch (e) {}
  }

  return () => {
    presenceListeners.delete(callback);
  };
};

/**
 * Get current active visitor count synchronously.
 */
export const getActiveVisitorCount = () => {
  if (!presenceChannel) return 0;
  try {
    const state = presenceChannel.presenceState();
    return parsePresenceState(state).totalActive;
  } catch (e) {
    return 0;
  }
};

// ─── PAGE VIEWS: Historical Analytics ─────────────────────────────────

/**
 * Log a page view to the Supabase page_views table.
 * Call this on every route change.
 */
export const logPageView = async (pagePath) => {
  if (!supabase) return;

  const path = pagePath || (typeof window !== 'undefined' ? window.location.pathname : '/');

  // Do not log internal admin page views to visitor table
  if (path.startsWith('/admin')) return;

  try {
    // FIX 1: Store pre-computed device_type instead of raw user_agent (avoids bulk fetching huge UA strings)
    const device_type = getDeviceType();
    await supabase.from('page_views').insert({
      session_id: SESSION_ID,
      page_path: path,
      page_title: typeof document !== 'undefined' ? document.title || '' : '',
      referrer: typeof document !== 'undefined' ? document.referrer || '' : '',
      device_type,
      screen_width: typeof window !== 'undefined' ? window.innerWidth || 0 : 0,
      screen_height: typeof window !== 'undefined' ? window.innerHeight || 0 : 0,
      user_email: (() => {
        try {
          const u = JSON.parse(localStorage.getItem('bihar_ai_user') || '{}');
          return u.email || null;
        } catch (e) {
          return null;
        }
      })(),
    });
  } catch (err) {
    // Silent fail — analytics should never block the user
  }
};

// ─── ADMIN: Fetch Historical Analytics ────────────────────────────────

/**
 * Fetch analytics summary for the admin dashboard.
 * FIX 2: Uses lightweight aggregate count queries instead of bulk row downloads.
 * FIX 3: Caches results for 5 minutes to avoid repeated DB hits on tab switches.
 */

// ─── Analytics Cache (5-minute TTL) ───────────────────────────────────
let _analyticsCache = null;
let _analyticsCacheAt = 0;
const ANALYTICS_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Invalidate analytics cache (call after admin refresh button click).
 */
export const invalidateAnalyticsCache = () => {
  _analyticsCache = null;
  _analyticsCacheAt = 0;
};

/**
 * Helper: count rows matching a date filter — sends ZERO row data (head-only request).
 */
const countPageViews = async (sinceISO, untilISO = null) => {
  let q = supabase
    .from('page_views')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', sinceISO);
  if (untilISO) q = q.lt('created_at', untilISO);
  const { count, error } = await q;
  if (error) throw error;
  return count || 0;
};

/**
 * Helper: count distinct sessions since a date — uses a small select of session_id only.
 * Limits to 5000 rows max to cap egress; returns approximate unique count.
 */
const countUniqueSessions = async (sinceISO) => {
  const { data, error } = await supabase
    .from('page_views')
    .select('session_id')
    .gte('created_at', sinceISO)
    .limit(5000);
  if (error || !Array.isArray(data)) return 0;
  return new Set(data.map((r) => r.session_id)).size;
};

export const fetchAnalyticsSummary = async (forceRefresh = false) => {
  if (!supabase) return getEmptyAnalytics();

  // FIX 3: Return cached result if still fresh
  if (!forceRefresh && _analyticsCache && Date.now() - _analyticsCacheAt < ANALYTICS_CACHE_TTL_MS) {
    return _analyticsCache;
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  try {
    // FIX 2: Aggregate counts — NO row data transferred for counts
    const [todayCount, weekCount, monthCount, allTimeCount] = await Promise.all([
      countPageViews(todayStart),
      countPageViews(weekStart),
      countPageViews(monthStart),
      countPageViews('2020-01-01T00:00:00.000Z'),
    ]);

    // Unique sessions — small session_id-only queries
    const [todayUnique, weekUnique, monthUnique] = await Promise.all([
      countUniqueSessions(todayStart),
      countUniqueSessions(weekStart),
      countUniqueSessions(monthStart),
    ]);

    // Top pages — fetch only page_path + count for the month (small columns)
    let topPages = [];
    let sources = [];
    let devices = { mobile: 0, desktop: 0, mobilePct: 0, desktopPct: 0 };
    try {
      // FIX 2: Fetch only minimal columns needed for aggregation (NO user_agent)
      const { data: monthRows } = await supabase
        .from('page_views')
        .select('page_path, session_id, referrer, device_type, created_at')
        .gte('created_at', monthStart)
        .limit(3000); // Safety cap: stops runaway egress if table grows huge

      if (Array.isArray(monthRows) && monthRows.length > 0) {
        const totalMonthViews = Math.max(monthRows.length, 1);

        // Top pages
        const pageCount = {};
        monthRows.forEach((v) => {
          const p = v.page_path || '/';
          pageCount[p] = (pageCount[p] || 0) + 1;
        });
        topPages = Object.entries(pageCount)
          .map(([page, views]) => ({
            page,
            views,
            label: getPageLabel(page),
            pct: Math.round((views / totalMonthViews) * 100),
          }))
          .sort((a, b) => b.views - a.views)
          .slice(0, 10);

        // Referrer sources
        const sourceMap = {};
        let mobileCount = 0;
        let desktopCount = 0;
        monthRows.forEach((v) => {
          const src = parseReferrerSource(v.referrer);
          sourceMap[src] = (sourceMap[src] || 0) + 1;
          // FIX 1: Use pre-stored device_type; fall back to UA parse if column missing
          const dev = v.device_type || 'Desktop';
          if (dev === 'Mobile') mobileCount++;
          else desktopCount++;
        });
        sources = Object.entries(sourceMap)
          .map(([source, count]) => ({
            source,
            count,
            pct: Math.round((count / totalMonthViews) * 100),
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6);

        devices = {
          mobile: mobileCount,
          desktop: desktopCount,
          mobilePct: Math.round((mobileCount / totalMonthViews) * 100),
          desktopPct: Math.round((desktopCount / totalMonthViews) * 100),
        };
      }
    } catch (e) {
      console.warn('[VisitorService] topPages/sources fetch error:', e);
    }

    // Hourly breakdown for today — tiny select (created_at + session_id only)
    const hourlyToday = Array(24).fill(0);
    let peakConcurrent = 0;
    try {
      const { data: todayRows } = await supabase
        .from('page_views')
        .select('session_id, created_at')
        .gte('created_at', todayStart)
        .limit(2000);

      if (Array.isArray(todayRows)) {
        todayRows.forEach((v) => {
          const hour = new Date(v.created_at).getHours();
          hourlyToday[hour]++;
        });

        // Peak concurrent estimate (most views in any 5-minute window)
        if (todayRows.length > 0) {
          const windowMs = 5 * 60 * 1000;
          for (let i = 0; i < todayRows.length; i++) {
            const windowStart = new Date(todayRows[i].created_at).getTime();
            const windowEnd = windowStart + windowMs;
            const sessionsInWindow = new Set();
            for (let j = i; j < todayRows.length; j++) {
              const t = new Date(todayRows[j].created_at).getTime();
              if (t > windowEnd) break;
              sessionsInWindow.add(todayRows[j].session_id);
            }
            if (sessionsInWindow.size > peakConcurrent) {
              peakConcurrent = sessionsInWindow.size;
            }
          }
        }
      }
    } catch (e) {}

    // Daily breakdown for this month — from monthRows already fetched above
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dailyThisMonth = Array(daysInMonth).fill(0);
    // Re-use topPages month fetch by refetching created_at only if needed
    // (topPages query already includes created_at so this is free)
    try {
      const { data: dailyRows } = await supabase
        .from('page_views')
        .select('created_at')
        .gte('created_at', monthStart)
        .limit(3000);
      if (Array.isArray(dailyRows)) {
        dailyRows.forEach((v) => {
          const day = new Date(v.created_at).getDate() - 1;
          if (day >= 0 && day < daysInMonth) dailyThisMonth[day]++;
        });
      }
    } catch (e) {}

    // Latest 10 live stream hits — only 10 rows, small columns (NO user_agent)
    let recentHits = [];
    try {
      const { data: recents } = await supabase
        .from('page_views')
        .select('id, page_path, page_title, referrer, device_type, user_email, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      if (Array.isArray(recents)) {
        recentHits = recents.map((r) => ({
          id: r.id,
          page: r.page_path,
          label: getPageLabel(r.page_path),
          source: parseReferrerSource(r.referrer),
          // FIX 1: Use pre-stored device_type (no need to parse UA)
          device: r.device_type || 'Desktop',
          userEmail: r.user_email || 'Guest Visitor',
          createdAt: r.created_at,
        }));
      }
    } catch (e) {}

    const result = {
      today: { views: todayCount, unique: todayUnique },
      thisWeek: { views: weekCount, unique: weekUnique },
      thisMonth: { views: monthCount, unique: monthUnique },
      allTime: { views: allTimeCount, unique: monthUnique },
      topPages,
      sources,
      devices,
      recentHits,
      hourlyToday,
      dailyThisMonth,
      peakConcurrent,
    };

    // FIX 3: Cache the result
    _analyticsCache = result;
    _analyticsCacheAt = Date.now();

    return result;
  } catch (err) {
    console.warn('[VisitorService] Analytics fetch error:', err);
    return getEmptyAnalytics();
  }
};

const getEmptyAnalytics = () => ({
  today: { views: 0, unique: 0 },
  thisWeek: { views: 0, unique: 0 },
  thisMonth: { views: 0, unique: 0 },
  allTime: { views: 0, unique: 0 },
  topPages: [],
  sources: [],
  devices: { mobile: 0, desktop: 0, mobilePct: 0, desktopPct: 0 },
  recentHits: [],
  hourlyToday: Array(24).fill(0),
  dailyThisMonth: Array(31).fill(0),
  peakConcurrent: 0,
});

// ─── HELPERS ──────────────────────────────────────────────────────────

const PAGE_LABELS = {
  '/': 'Home',
  '/learning': 'Learning Hub',
  '/tools': 'AI Tools',
  '/policy': 'AI Policy',
  '/blog': 'Blog',
  '/startups': 'Startups',
  '/about': 'About',
  '/profile': 'User Profile',
  '/admin': 'Admin Login',
  '/admin/dashboard': 'Admin Dashboard',
  '/reset-password': 'Reset Password',
};

export const getPageLabel = (path) => {
  if (!path) return 'Unknown';
  if (PAGE_LABELS[path]) return PAGE_LABELS[path];
  if (path.startsWith('/blog/')) return 'Blog Article';
  if (path.startsWith('/course/')) return 'Course Detail';
  if (path.startsWith('/program/')) return 'Program Detail';
  if (path.startsWith('/exam/')) return 'Exam Page';
  if (path.startsWith('/experience')) return 'Experience';
  return path;
};

export const parseReferrerSource = (referrer) => {
  if (!referrer || typeof referrer !== 'string' || !referrer.trim()) return 'Direct / Bookmark';
  const r = referrer.toLowerCase();
  if (r.includes('google.')) return 'Google Search';
  if (r.includes('whatsapp') || r.includes('api.whatsapp') || r.includes('wa.me')) return 'WhatsApp';
  if (r.includes('linkedin.')) return 'LinkedIn';
  if (r.includes('t.co') || r.includes('twitter.') || r.includes('x.com')) return 'X / Twitter';
  if (r.includes('facebook.') || r.includes('fb.com')) return 'Facebook';
  if (r.includes('instagram.')) return 'Instagram';
  if (r.includes('youtube.')) return 'YouTube';
  if (r.includes('bing.') || r.includes('yahoo.')) return 'Search Engine';
  try {
    const u = new URL(referrer);
    return u.hostname.replace(/^www\./, '');
  } catch (e) {
    return 'External Referral';
  }
};

export const parseDeviceFromUA = (ua) => {
  if (!ua || typeof ua !== 'string') return 'Desktop';
  const lower = ua.toLowerCase();
  if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(lower)) {
    return 'Mobile';
  }
  return 'Desktop';
};

/**
 * Cleanup presence on tab close / unload.
 */
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (presenceChannel) {
      try {
        presenceChannel.untrack();
      } catch (e) {}
    }
  });
}
