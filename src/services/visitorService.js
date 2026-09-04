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
    await supabase.from('page_views').insert({
      session_id: SESSION_ID,
      page_path: path,
      page_title: typeof document !== 'undefined' ? document.title || '' : '',
      referrer: typeof document !== 'undefined' ? document.referrer || '' : '',
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent || '' : '',
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
 * Returns: { today, thisWeek, thisMonth, allTime, topPages, hourlyToday, dailyThisMonth, peakConcurrent }
 */
export const fetchAnalyticsSummary = async () => {
  if (!supabase) return getEmptyAnalytics();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  try {
    // Fetch all page views for this month (covers today + week + month)
    const { data: monthViews, error } = await supabase
      .from('page_views')
      .select('page_path, session_id, created_at')
      .gte('created_at', monthStart)
      .order('created_at', { ascending: true });

    if (error || !Array.isArray(monthViews)) return getEmptyAnalytics();

    const todayViews = monthViews.filter((v) => v.created_at >= todayStart);
    const weekViews = monthViews.filter((v) => v.created_at >= weekStart);

    // Unique sessions
    const todayUnique = new Set(todayViews.map((v) => v.session_id)).size;
    const weekUnique = new Set(weekViews.map((v) => v.session_id)).size;
    const monthUnique = new Set(monthViews.map((v) => v.session_id)).size;

    // Top pages
    const pageCount = {};
    monthViews.forEach((v) => {
      const p = v.page_path || '/';
      pageCount[p] = (pageCount[p] || 0) + 1;
    });
    const topPages = Object.entries(pageCount)
      .map(([page, views]) => ({ page, views, label: getPageLabel(page) }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Hourly breakdown for today
    const hourlyToday = Array(24).fill(0);
    todayViews.forEach((v) => {
      const hour = new Date(v.created_at).getHours();
      hourlyToday[hour]++;
    });

    // Daily breakdown for this month
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dailyThisMonth = Array(daysInMonth).fill(0);
    monthViews.forEach((v) => {
      const day = new Date(v.created_at).getDate() - 1;
      if (day >= 0 && day < daysInMonth) dailyThisMonth[day]++;
    });

    // Peak concurrent estimate (most views in any 5-minute window today)
    let peakConcurrent = 0;
    if (todayViews.length > 0) {
      const windowMs = 5 * 60 * 1000;
      for (let i = 0; i < todayViews.length; i++) {
        const windowStart = new Date(todayViews[i].created_at).getTime();
        const windowEnd = windowStart + windowMs;
        const sessionsInWindow = new Set();
        for (let j = i; j < todayViews.length; j++) {
          const t = new Date(todayViews[j].created_at).getTime();
          if (t > windowEnd) break;
          sessionsInWindow.add(todayViews[j].session_id);
        }
        if (sessionsInWindow.size > peakConcurrent) {
          peakConcurrent = sessionsInWindow.size;
        }
      }
    }

    // All-time count
    let allTimeViews = monthViews.length;
    let allTimeUnique = monthUnique;
    try {
      const { count } = await supabase
        .from('page_views')
        .select('*', { count: 'exact', head: true });
      if (count !== null && count !== undefined) allTimeViews = count;
    } catch (e) {}

    return {
      today: { views: todayViews.length, unique: todayUnique },
      thisWeek: { views: weekViews.length, unique: weekUnique },
      thisMonth: { views: monthViews.length, unique: monthUnique },
      allTime: { views: allTimeViews, unique: allTimeUnique },
      topPages,
      hourlyToday,
      dailyThisMonth,
      peakConcurrent,
    };
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
