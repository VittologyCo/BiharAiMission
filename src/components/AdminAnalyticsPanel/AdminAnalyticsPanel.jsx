import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchAnalyticsSummary,
  subscribeToPresence,
  getPageLabel,
  parseReferrerSource,
  parseDeviceFromUA,
} from '../../services/visitorService';
import {
  fetchErrorLogsSummary,
  markErrorResolved,
  deleteErrorLog,
} from '../../services/errorLoggingService';
import { supabase } from '../../utils/supabase';

// Format relative time helper
function formatRelativeTime(dateStr) {
  if (!dateStr) return 'Just now';
  const diffSec = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diffSec < 5) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

export default function AdminAnalyticsPanel() {
  // Navigation: 'traffic' or 'errors'
  const [activeSubTab, setActiveSubTab] = useState('traffic');

  // Analytics state
  const [analytics, setAnalytics] = useState(null);
  const [liveData, setLiveData] = useState({ totalActive: 0, pageBreakdown: [], visitors: [] });
  const [recentHits, setRecentHits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [peakLive, setPeakLive] = useState(0);
  const [lastLiveEvent, setLastLiveEvent] = useState(null);
  const [liveFlash, setLiveFlash] = useState(false);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  // Developer Error Logs state
  const [errorData, setErrorData] = useState({ errors: [], totalToday: 0, unresolvedCount: 0 });
  const [selectedError, setSelectedError] = useState(null);
  const [errorFilter, setErrorFilter] = useState('all'); // 'all', 'unresolved', 'resolved'
  const [newErrorAlert, setNewErrorAlert] = useState(false);

  // Load analytics data
  const loadAnalytics = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    try {
      const data = await fetchAnalyticsSummary();
      setAnalytics(data);
      if (Array.isArray(data.recentHits)) {
        setRecentHits(data.recentHits);
      }
    } catch (e) {
      console.warn('[AdminAnalytics] Load error:', e);
    } finally {
      setLoading(false);
      if (showRefreshing) {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  }, []);

  // Load error logs
  const loadErrors = useCallback(async () => {
    try {
      const data = await fetchErrorLogsSummary();
      setErrorData(data);
    } catch (e) {
      console.warn('[AdminAnalytics] Load error logs error:', e);
    }
  }, []);

  // Initial load and Realtime subscriptions
  useEffect(() => {
    loadAnalytics();
    loadErrors();

    let pageViewsChannel = null;
    let errorsChannel = null;

    if (supabase) {
      // 1. Realtime Page Views Channel
      try {
        pageViewsChannel = supabase
          .channel('admin_live_page_views_feed')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'page_views' },
            (payload) => {
              setRealtimeConnected(true);
              const row = payload?.new;
              if (row) {
                const newHit = {
                  id: row.id || `live_${Date.now()}`,
                  page: row.page_path || '/',
                  label: getPageLabel(row.page_path || '/'),
                  source: parseReferrerSource(row.referrer),
                  device: parseDeviceFromUA(row.user_agent),
                  userEmail: row.user_email || 'Guest Visitor',
                  createdAt: row.created_at || new Date().toISOString(),
                  isLiveInstant: true,
                };

                setLastLiveEvent(new Date().toLocaleTimeString());
                setLiveFlash(true);
                setTimeout(() => setLiveFlash(false), 1800);

                setRecentHits((prev) => [newHit, ...prev.slice(0, 9)]);

                setAnalytics((prev) => {
                  if (!prev) return prev;
                  const curHour = new Date().getHours();
                  const updatedHourly = [...prev.hourlyToday];
                  updatedHourly[curHour] = (updatedHourly[curHour] || 0) + 1;

                  const targetPath = row.page_path || '/';
                  let updatedTopPages = [...prev.topPages];
                  const existingIdx = updatedTopPages.findIndex((p) => p.page === targetPath);
                  if (existingIdx >= 0) {
                    updatedTopPages[existingIdx] = {
                      ...updatedTopPages[existingIdx],
                      views: updatedTopPages[existingIdx].views + 1,
                    };
                  } else {
                    updatedTopPages.push({
                      page: targetPath,
                      views: 1,
                      label: getPageLabel(targetPath),
                      pct: 1,
                    });
                  }
                  updatedTopPages.sort((a, b) => b.views - a.views);

                  return {
                    ...prev,
                    today: { ...prev.today, views: (prev.today?.views || 0) + 1 },
                    thisWeek: { ...prev.thisWeek, views: (prev.thisWeek?.views || 0) + 1 },
                    thisMonth: { ...prev.thisMonth, views: (prev.thisMonth?.views || 0) + 1 },
                    allTime: { ...prev.allTime, views: (prev.allTime?.views || 0) + 1 },
                    topPages: updatedTopPages,
                    hourlyToday: updatedHourly,
                  };
                });
              }
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              setRealtimeConnected(true);
            }
          });
      } catch (e) {
        console.warn('[AdminAnalytics] Realtime page_views error:', e);
      }

      // 2. Realtime Developer Error Logs Channel
      try {
        errorsChannel = supabase
          .channel('admin_live_error_logs_feed')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'app_error_logs' },
            (payload) => {
              const newErr = payload?.new;
              if (newErr) {
                setErrorData((prev) => ({
                  errors: [newErr, ...prev.errors.slice(0, 29)],
                  totalToday: prev.totalToday + 1,
                  unresolvedCount: prev.unresolvedCount + 1,
                }));
                setNewErrorAlert(true);
                setTimeout(() => setNewErrorAlert(false), 5000);
              }
            }
          )
          .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'app_error_logs' },
            () => {
              loadErrors();
            }
          )
          .subscribe();
      } catch (e) {
        console.warn('[AdminAnalytics] Realtime app_error_logs error:', e);
      }
    }

    // Periodic sync every 45s
    const interval = setInterval(() => {
      loadAnalytics();
      loadErrors();
    }, 45000);

    return () => {
      clearInterval(interval);
      if (pageViewsChannel && supabase) supabase.removeChannel(pageViewsChannel);
      if (errorsChannel && supabase) supabase.removeChannel(errorsChannel);
    };
  }, [loadAnalytics, loadErrors]);

  // Subscribe to live concurrent visitors via Supabase Presence
  useEffect(() => {
    const unsub = subscribeToPresence((data) => {
      setLiveData(data);
      setPeakLive((prev) => Math.max(prev, data.totalActive || 0));
    });
    return unsub;
  }, []);

  // Handle Mark Resolved
  const handleToggleResolve = async (errItem) => {
    const nextState = !errItem.resolved;
    // Optimistic UI update
    setErrorData((prev) => ({
      ...prev,
      errors: prev.errors.map((e) => (e.id === errItem.id ? { ...e, resolved: nextState } : e)),
      unresolvedCount: Math.max(0, prev.unresolvedCount + (nextState ? -1 : 1)),
    }));
    if (selectedError && selectedError.id === errItem.id) {
      setSelectedError((prev) => ({ ...prev, resolved: nextState }));
    }
    await markErrorResolved(errItem.id, nextState);
  };

  // Handle Delete Error Log
  const handleDeleteError = async (id) => {
    if (!window.confirm('Delete this error log?')) return;
    setErrorData((prev) => ({
      ...prev,
      errors: prev.errors.filter((e) => e.id !== id),
    }));
    if (selectedError && selectedError.id === id) {
      setSelectedError(null);
    }
    await deleteErrorLog(id);
  };

  const a = analytics || {
    today: { views: 0, unique: 0 },
    thisWeek: { views: 0, unique: 0 },
    thisMonth: { views: 0, unique: 0 },
    allTime: { views: 0, unique: 0 },
    topPages: [],
    sources: [],
    devices: { mobile: 0, desktop: 0, mobilePct: 0, desktopPct: 0 },
    hourlyToday: Array(24).fill(0),
    dailyThisMonth: Array(31).fill(0),
    peakConcurrent: 0,
  };

  const maxHourly = Math.max(...a.hourlyToday, 1);
  const currentHour = new Date().getHours();

  // Filtered error list
  const filteredErrors = errorData.errors.filter((item) => {
    if (errorFilter === 'unresolved') return !item.resolved;
    if (errorFilter === 'resolved') return item.resolved;
    return true;
  });

  // Card style helper
  const cardStyle = {
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
    position: 'relative',
  };

  return (
    <div style={{ marginBottom: '36px', fontFamily: 'inherit' }}>
      <style>{`
        @keyframes pulseDot {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.3); opacity: 1; box-shadow: 0 0 12px #10B981; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
        @keyframes flashRedPulse {
          0% { background-color: #FEE2E2; }
          50% { background-color: #FECACA; }
          100% { background-color: #FEE2E2; }
        }
        @keyframes flashRow {
          0% { background-color: rgba(16, 185, 129, 0.25); }
          100% { background-color: transparent; }
        }
        .live-hit-row-new {
          animation: flashRow 2s ease-out;
        }
      `}</style>

      {/* ─── 1. TOP HEADER & SUB-TABS ─────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background:
                activeSubTab === 'traffic'
                  ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              color: '#FFFFFF',
              boxShadow:
                activeSubTab === 'traffic'
                  ? '0 4px 14px rgba(16, 185, 129, 0.3)'
                  : '0 4px 14px rgba(239, 68, 68, 0.3)',
              flexShrink: 0,
              transition: 'all 0.3s ease',
            }}
          >
            {activeSubTab === 'traffic' ? '📈' : '🚨'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '21px', fontWeight: '900', color: '#111827', margin: 0, letterSpacing: '-0.02em' }}>
                Real-Time Website Analytics & Diagnostics
              </h2>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: realtimeConnected || liveData.totalActive > 0 ? '#ECFDF5' : '#F3F4F6',
                  border: realtimeConnected || liveData.totalActive > 0 ? '1px solid #A7F3D0' : '1px solid #E5E7EB',
                  color: realtimeConnected || liveData.totalActive > 0 ? '#065F46' : '#6B7280',
                  fontSize: '11px',
                  fontWeight: '800',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                }}
              >
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: realtimeConnected || liveData.totalActive > 0 ? '#10B981' : '#9CA3AF',
                    animation: realtimeConnected || liveData.totalActive > 0 ? 'pulseDot 2s infinite' : 'none',
                  }}
                />
                {realtimeConnected ? 'LIVE SOCKET ACTIVE' : 'LIVE PRESENCE ACTIVE'}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: '3px 0 0' }}>
              Live visitor pulse, traffic acquisition, and real-time developer error & crash monitoring.
            </p>
          </div>
        </div>

        {/* Sub-tab switcher + Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              display: 'inline-flex',
              background: '#F3F4F6',
              padding: '4px',
              borderRadius: '10px',
              border: '1px solid #E5E7EB',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveSubTab('traffic')}
              style={{
                background: activeSubTab === 'traffic' ? '#FFFFFF' : 'transparent',
                color: activeSubTab === 'traffic' ? '#111827' : '#6B7280',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '7px',
                fontWeight: '700',
                fontSize: '12.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: activeSubTab === 'traffic' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <span>📊 Traffic & Visitors</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('errors')}
              style={{
                background: activeSubTab === 'errors' ? '#FFFFFF' : 'transparent',
                color: activeSubTab === 'errors' ? '#DC2626' : '#6B7280',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '7px',
                fontWeight: '700',
                fontSize: '12.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: activeSubTab === 'errors' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <span>🚨 Error & Crash Logs</span>
              {errorData.unresolvedCount > 0 && (
                <span
                  style={{
                    background: '#EF4444',
                    color: '#FFFFFF',
                    fontSize: '10px',
                    fontWeight: '900',
                    padding: '1px 6px',
                    borderRadius: '9999px',
                    marginLeft: '2px',
                  }}
                >
                  {errorData.unresolvedCount}
                </span>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              loadAnalytics(true);
              loadErrors();
            }}
            disabled={isRefreshing}
            style={{
              background: '#FFFFFF',
              border: '1px solid #D1D5DB',
              color: '#374151',
              padding: '7px 14px',
              borderRadius: '9px',
              fontSize: '12.5px',
              fontWeight: '700',
              cursor: isRefreshing ? 'wait' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
          >
            <span style={{ display: 'inline-block', transform: isRefreshing ? 'rotate(360deg)' : 'none', transition: 'transform 0.6s ease' }}>
              🔄
            </span>
            {isRefreshing ? 'Syncing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* ─── LIVE ERROR ALERT BANNER (IF ACTIVE ERROR) ─────────────────── */}
      {newErrorAlert && (
        <div
          style={{
            background: '#FEE2E2',
            border: '1px solid #FCA5A5',
            color: '#B91C1C',
            padding: '10px 16px',
            borderRadius: '12px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            animation: 'flashRedPulse 2s infinite',
            fontSize: '13px',
            fontWeight: '700',
          }}
        >
          <span>🚨 Live Alert: A new client-side error was just logged from a user browser!</span>
          <button
            type="button"
            onClick={() => setActiveSubTab('errors')}
            style={{
              background: '#B91C1C',
              color: '#FFFFFF',
              border: 'none',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '800',
              cursor: 'pointer',
            }}
          >
            View Errors
          </button>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* VIEW A: TRAFFIC & LIVE VISITORS                                 */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'traffic' && (
        <>
          {/* Top Bento Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: '14px',
              marginBottom: '22px',
            }}
          >
            {/* Tile 1: Live Now */}
            <div
              style={{
                ...cardStyle,
                background: 'linear-gradient(145deg, #064E3B 0%, #065F46 100%)',
                color: '#FFFFFF',
                border: '1px solid #059669',
                boxShadow: '0 6px 20px rgba(6, 78, 59, 0.2)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#A7F3D0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  ⚡ Live Right Now
                </span>
                <span
                  style={{
                    width: '9px',
                    height: '9px',
                    borderRadius: '50%',
                    background: '#34D399',
                    boxShadow: '0 0 10px #34D399',
                    animation: 'pulseDot 1.8s infinite',
                  }}
                />
              </div>
              <div style={{ fontSize: '38px', fontWeight: '900', lineHeight: 1.05, letterSpacing: '-0.02em' }}>
                {liveData.totalActive}
              </div>
              <div style={{ fontSize: '12px', color: '#A7F3D0', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>Peak today:</span>
                <strong style={{ color: '#FFFFFF' }}>{Math.max(peakLive, a.peakConcurrent, liveData.totalActive)}</strong>
              </div>
            </div>

            {/* Tile 2: Today */}
            <div style={cardStyle}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                📅 Today's Views
              </div>
              <div style={{ fontSize: '32px', fontWeight: '900', color: '#111827', lineHeight: 1.1 }}>
                {a.today.views.toLocaleString()}
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '6px' }}>
                <strong style={{ color: '#059669' }}>{a.today.unique}</strong> unique visitors
              </div>
            </div>

            {/* Tile 3: This Week */}
            <div style={cardStyle}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                📆 This Week
              </div>
              <div style={{ fontSize: '32px', fontWeight: '900', color: '#111827', lineHeight: 1.1 }}>
                {a.thisWeek.views.toLocaleString()}
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '6px' }}>
                <strong style={{ color: '#2563EB' }}>{a.thisWeek.unique}</strong> unique visitors
              </div>
            </div>

            {/* Tile 4: This Month */}
            <div style={cardStyle}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                📊 This Month
              </div>
              <div style={{ fontSize: '32px', fontWeight: '900', color: '#111827', lineHeight: 1.1 }}>
                {a.thisMonth.views.toLocaleString()}
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '6px' }}>
                <strong style={{ color: '#7C3AED' }}>{a.thisMonth.unique}</strong> unique visitors
              </div>
            </div>

            {/* Tile 5: Developer Error Status */}
            <div
              style={{
                ...cardStyle,
                borderLeft: errorData.unresolvedCount > 0 ? '4px solid #EF4444' : '4px solid #10B981',
                cursor: 'pointer',
              }}
              onClick={() => setActiveSubTab('errors')}
              title="Click to view developer error logs"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {errorData.unresolvedCount > 0 ? '⚠️ Unresolved Errors' : '🛡 System Health'}
                </span>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>Inspect →</span>
              </div>
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: '900',
                  color: errorData.unresolvedCount > 0 ? '#DC2626' : '#059669',
                  lineHeight: 1.1,
                }}
              >
                {errorData.unresolvedCount > 0 ? errorData.unresolvedCount : '0'}
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '6px' }}>
                {errorData.unresolvedCount > 0
                  ? `${errorData.totalToday} errors reported today`
                  : 'All systems healthy & error-free'}
              </div>
            </div>
          </div>

          {/* Live Visitor Stream */}
          <div style={{ ...cardStyle, marginBottom: '22px', borderLeft: '4px solid #10B981' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '14px',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    width: '9px',
                    height: '9px',
                    borderRadius: '50%',
                    background: '#10B981',
                    boxShadow: '0 0 10px #10B981',
                    animation: 'pulseDot 1.5s infinite',
                  }}
                />
                <h3 style={{ fontSize: '15px', fontWeight: '900', color: '#111827', margin: 0 }}>
                  Live Visitor Stream
                </h3>
                <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>
                  (Instantly logs visitor route changes via WebSocket)
                </span>
              </div>

              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: '#059669',
                  background: '#ECFDF5',
                  padding: '3px 8px',
                  borderRadius: '6px',
                }}
              >
                Showing last {recentHits.length} events
              </span>
            </div>

            {recentHits.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>
                Waiting for live visitor traffic... As users browse biharaimission.org, live hits will appear here instantaneously.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recentHits.slice(0, 8).map((hit, idx) => (
                  <div
                    key={hit.id || idx}
                    className={hit.isLiveInstant ? 'live-hit-row-new' : ''}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '9px 14px',
                      background: idx === 0 && hit.isLiveInstant ? '#ECFDF5' : idx % 2 === 0 ? '#F9FAFB' : '#FFFFFF',
                      borderRadius: '10px',
                      border: '1px solid #F3F4F6',
                      fontSize: '13px',
                      gap: '12px',
                      flexWrap: 'wrap',
                      transition: 'background-color 0.4s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '220px' }}>
                      <span
                        style={{
                          background: '#E0F2FE',
                          color: '#0369A1',
                          fontWeight: '800',
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {hit.label}
                      </span>
                      <span style={{ fontSize: '12.5px', color: '#4B5563', fontFamily: 'monospace' }}>
                        {hit.page}
                      </span>
                      {hit.isLiveInstant && idx === 0 && (
                        <span
                          style={{
                            background: '#10B981',
                            color: '#FFFFFF',
                            fontSize: '9.5px',
                            fontWeight: '900',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            letterSpacing: '0.04em',
                          }}
                        >
                          NEW
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: '600',
                          color: hit.userEmail && hit.userEmail !== 'Guest Visitor' ? '#7C3AED' : '#6B7280',
                          background: hit.userEmail && hit.userEmail !== 'Guest Visitor' ? '#F5F3FF' : 'transparent',
                          padding: hit.userEmail && hit.userEmail !== 'Guest Visitor' ? '2px 8px' : '0',
                          borderRadius: '6px',
                        }}
                      >
                        👤 {hit.userEmail}
                      </span>

                      <span
                        style={{
                          fontSize: '11.5px',
                          fontWeight: '700',
                          color: hit.source === 'WhatsApp' ? '#15803D' : hit.source === 'Google Search' ? '#1D4ED8' : '#4B5563',
                          background: hit.source === 'WhatsApp' ? '#DCFCE7' : hit.source === 'Google Search' ? '#DBEAFE' : '#F3F4F6',
                          padding: '2px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        {hit.source === 'WhatsApp' ? '💬 WhatsApp' : hit.source === 'Google Search' ? '🔍 Google' : hit.source}
                      </span>

                      <span
                        style={{
                          fontSize: '11.5px',
                          fontWeight: '700',
                          color: '#4B5563',
                          background: '#F3F4F6',
                          padding: '2px 7px',
                          borderRadius: '6px',
                        }}
                      >
                        {hit.device === 'Mobile' ? '📱 Mobile' : '💻 Desktop'}
                      </span>
                    </div>

                    <div style={{ fontSize: '11.5px', color: '#9CA3AF', fontWeight: '600', minWidth: '70px', textAlign: 'right' }}>
                      {formatRelativeTime(hit.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Two-Column Bento */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '18px',
              marginBottom: '22px',
            }}
          >
            {/* Card A: Most Visited Pages */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '14.5px', fontWeight: '900', color: '#111827', margin: 0 }}>
                  🔥 Most Visited Pages (This Month)
                </h3>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280' }}>
                  Ranked by Views
                </span>
              </div>

              {a.topPages.length === 0 ? (
                <div style={{ fontSize: '13px', color: '#9CA3AF', padding: '24px 0', textAlign: 'center' }}>
                  No page visit data logged yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {a.topPages.slice(0, 7).map((item, idx) => (
                    <div key={item.page} style={{ position: 'relative' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '5px',
                              background: idx === 0 ? '#FEF3C7' : idx === 1 ? '#E0F2FE' : '#F3F4F6',
                              color: idx === 0 ? '#B45309' : idx === 1 ? '#0369A1' : '#6B7280',
                              fontWeight: '900',
                              fontSize: '11px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {idx + 1}
                          </span>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>
                            {item.label}
                          </span>
                          <span style={{ fontSize: '11.5px', color: '#9CA3AF', fontFamily: 'monospace' }}>
                            {item.page}
                          </span>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: '800', color: '#111827' }}>
                          {item.views.toLocaleString()} <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: '500' }}>({item.pct || 0}%)</span>
                        </span>
                      </div>

                      <div style={{ width: '100%', height: '6px', background: '#F3F4F6', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${Math.min(item.pct || 5, 100)}%`,
                            height: '100%',
                            background: idx === 0 ? 'linear-gradient(90deg, #F59E0B, #D97706)' : 'linear-gradient(90deg, #10B981, #059669)',
                            borderRadius: '9999px',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Card B: Traffic Sources & Device Split */}
            <div style={cardStyle}>
              <h3 style={{ fontSize: '14.5px', fontWeight: '900', color: '#111827', margin: '0 0 14px' }}>
                🧭 Traffic Acquisition & Device Split
              </h3>

              <div style={{ marginBottom: '18px', padding: '12px', background: '#F9FAFB', borderRadius: '12px', border: '1px solid #F3F4F6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px', fontWeight: '700' }}>
                  <span style={{ color: '#059669' }}>📱 Mobile: {a.devices?.mobilePct || 0}%</span>
                  <span style={{ color: '#2563EB' }}>💻 Desktop: {a.devices?.desktopPct || 0}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#E5E7EB', borderRadius: '9999px', overflow: 'hidden', display: 'flex' }}>
                  <div
                    style={{
                      width: `${a.devices?.mobilePct || 50}%`,
                      height: '100%',
                      background: '#10B981',
                      transition: 'width 0.4s ease',
                    }}
                    title={`Mobile: ${a.devices?.mobile || 0} views`}
                  />
                  <div
                    style={{
                      width: `${a.devices?.desktopPct || 50}%`,
                      height: '100%',
                      background: '#3B82F6',
                      transition: 'width 0.4s ease',
                    }}
                    title={`Desktop: ${a.devices?.desktop || 0} views`}
                  />
                </div>
              </div>

              <div style={{ fontSize: '12px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
                Top Traffic Referrers
              </div>

              {!a.sources || a.sources.length === 0 ? (
                <div style={{ fontSize: '12.5px', color: '#9CA3AF', padding: '12px 0' }}>
                  No referrer data logged yet. Most traffic is direct / bookmarks.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {a.sources.map((src) => (
                    <div
                      key={src.source}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 0',
                        borderBottom: '1px solid #F3F4F6',
                        fontSize: '12.5px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: '700', color: '#111827' }}>{src.source}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#6B7280', fontWeight: '600' }}>{src.count} views</span>
                        <span
                          style={{
                            background: '#EEF2FF',
                            color: '#4338CA',
                            fontWeight: '800',
                            fontSize: '11px',
                            padding: '1px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          {src.pct}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Today's Hourly Traffic Curve */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '14.5px', fontWeight: '900', color: '#111827', margin: 0 }}>
                  ⏰ Today's Hourly Traffic Curve
                </h3>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>
                  Distribution of page views across 24 hours (IST). Current hour is highlighted in emerald.
                </span>
              </div>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: '800',
                  color: '#059669',
                  background: '#ECFDF5',
                  padding: '4px 10px',
                  borderRadius: '8px',
                }}
              >
                Peak Hour: {maxHourly} views
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '110px', padding: '10px 0' }}>
              {a.hourlyToday.map((val, hour) => {
                const isCurrent = hour === currentHour;
                const heightPct = Math.max((val / maxHourly) * 100, 4);
                return (
                  <div
                    key={hour}
                    title={`${hour}:00 — ${val} views`}
                    style={{
                      flex: 1,
                      height: `${heightPct}%`,
                      background: isCurrent
                        ? 'linear-gradient(180deg, #10B981 0%, #059669 100%)'
                        : val > 0
                        ? 'linear-gradient(180deg, #93C5FD 0%, #3B82F6 100%)'
                        : '#F3F4F6',
                      borderRadius: '4px 4px 0 0',
                      boxShadow: isCurrent ? '0 0 10px rgba(16, 185, 129, 0.4)' : 'none',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                    }}
                  />
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '10.5px', color: '#9CA3AF', fontWeight: '600' }}>
              <span>12 AM</span>
              <span>4 AM</span>
              <span>8 AM</span>
              <span>12 PM</span>
              <span>4 PM</span>
              <span>8 PM</span>
              <span>11 PM</span>
            </div>
          </div>
        </>
      )}

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* VIEW B: DEVELOPER ERROR & CRASH LOGS                           */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'errors' && (
        <div>
          {/* Error Summary Bento */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '14px',
              marginBottom: '20px',
            }}
          >
            <div style={cardStyle}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', marginBottom: '6px' }}>
                🚨 Unresolved Errors
              </div>
              <div style={{ fontSize: '32px', fontWeight: '900', color: errorData.unresolvedCount > 0 ? '#DC2626' : '#059669' }}>
                {errorData.unresolvedCount}
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                Action needed
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', marginBottom: '6px' }}>
                📅 Errors Today
              </div>
              <div style={{ fontSize: '32px', fontWeight: '900', color: '#111827' }}>
                {errorData.totalToday}
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                Since midnight
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', marginBottom: '6px' }}>
                📂 Total Recorded Logs
              </div>
              <div style={{ fontSize: '32px', fontWeight: '900', color: '#111827' }}>
                {errorData.errors.length}
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                Stored in database
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', gap: '8px' }}>
              {['all', 'unresolved', 'resolved'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setErrorFilter(f)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: errorFilter === f ? '#111827' : '#E5E7EB',
                    background: errorFilter === f ? '#111827' : '#FFFFFF',
                    color: errorFilter === f ? '#FFFFFF' : '#4B5563',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {f === 'all' ? `All (${errorData.errors.length})` : f === 'unresolved' ? `Unresolved (${errorData.unresolvedCount})` : 'Resolved'}
                </button>
              ))}
            </div>

            <span style={{ fontSize: '12px', color: '#6B7280' }}>
              Click any row or "Inspect" to view full stack trace & diagnostics.
            </span>
          </div>

          {/* Error Logs List */}
          <div style={cardStyle}>
            {filteredErrors.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#6B7280' }}>
                <div style={{ fontSize: '36px', marginBottom: '10px' }}>🎉</div>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#111827' }}>
                  No errors match this filter!
                </div>
                <div style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px' }}>
                  biharaimission.org is running cleanly without recorded client crashes.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredErrors.map((errItem) => {
                  const typeColors = {
                    react_boundary: { bg: '#FEE2E2', text: '#991B1B', label: 'React Crash' },
                    unhandled_rejection: { bg: '#FEF3C7', text: '#92400E', label: 'Promise Error' },
                    unhandled_error: { bg: '#FEE2E2', text: '#B91C1C', label: 'Runtime Error' },
                    upload_failure: { bg: '#FFEDD5', text: '#9A3412', label: 'Upload Error' },
                    api_failure: { bg: '#EDE9FE', text: '#5B21B6', label: 'API Error' },
                  };
                  const badge = typeColors[errItem.error_type] || { bg: '#F3F4F6', text: '#374151', label: errItem.error_type || 'Error' };

                  return (
                    <div
                      key={errItem.id}
                      style={{
                        padding: '14px 16px',
                        background: errItem.resolved ? '#F9FAFB' : '#FFFFFF',
                        border: '1px solid',
                        borderColor: errItem.resolved ? '#E5E7EB' : '#FECACA',
                        borderLeft: errItem.resolved ? '4px solid #9CA3AF' : '4px solid #EF4444',
                        borderRadius: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {/* Top Row: Type, Page, Timestamp */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              background: badge.bg,
                              color: badge.text,
                              fontSize: '11px',
                              fontWeight: '800',
                              padding: '2px 8px',
                              borderRadius: '6px',
                            }}
                          >
                            {badge.label}
                          </span>

                          <span style={{ fontSize: '12px', fontWeight: '700', color: '#111827', fontFamily: 'monospace' }}>
                            {errItem.page_path}
                          </span>

                          {errItem.user_email && (
                            <span style={{ fontSize: '11.5px', color: '#6B7280', background: '#F3F4F6', padding: '1px 6px', borderRadius: '4px' }}>
                              👤 {errItem.user_email}
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '11.5px', color: '#9CA3AF' }}>
                            {formatRelativeTime(errItem.created_at)}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleToggleResolve(errItem)}
                            style={{
                              background: errItem.resolved ? '#ECFDF5' : '#F3F4F6',
                              color: errItem.resolved ? '#059669' : '#374151',
                              border: '1px solid',
                              borderColor: errItem.resolved ? '#A7F3D0' : '#D1D5DB',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: '700',
                              cursor: 'pointer',
                            }}
                          >
                            {errItem.resolved ? '✓ Resolved' : 'Mark Resolved'}
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedError(errItem)}
                            style={{
                              background: '#111827',
                              color: '#FFFFFF',
                              border: 'none',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: '700',
                              cursor: 'pointer',
                            }}
                          >
                            Inspect
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteError(errItem.id)}
                            style={{
                              background: 'transparent',
                              color: '#9CA3AF',
                              border: 'none',
                              padding: '4px 6px',
                              cursor: 'pointer',
                              fontSize: '13px',
                            }}
                            title="Delete log"
                          >
                            🗑
                          </button>
                        </div>
                      </div>

                      {/* Error Message */}
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: '700',
                          color: '#1F2937',
                          fontFamily: 'monospace',
                          wordBreak: 'break-word',
                          lineHeight: 1.4,
                        }}
                      >
                        {errItem.error_message}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── 3. ERROR INSPECTION MODAL ─────────────────────────────────── */}
      {selectedError && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setSelectedError(null)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '750px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>🚨</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#111827' }}>
                    Error Diagnostic Report
                  </h3>
                  <span style={{ fontSize: '12px', color: '#6B7280' }}>
                    Logged on {new Date(selectedError.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedError(null)}
                style={{
                  background: '#F3F4F6',
                  border: 'none',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            {/* Error Message Box */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', marginBottom: '4px' }}>
                Error Message
              </div>
              <div
                style={{
                  background: '#FEE2E2',
                  border: '1px solid #FCA5A5',
                  color: '#991B1B',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '700',
                  fontFamily: 'monospace',
                  wordBreak: 'break-word',
                }}
              >
                {selectedError.error_message}
              </div>
            </div>

            {/* Context Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
                marginBottom: '16px',
                fontSize: '12.5px',
              }}
            >
              <div style={{ background: '#F9FAFB', padding: '10px', borderRadius: '8px', border: '1px solid #F3F4F6' }}>
                <strong style={{ color: '#6B7280', display: 'block', fontSize: '11px' }}>PAGE ROUTE</strong>
                <span style={{ color: '#111827', fontWeight: '700', fontFamily: 'monospace' }}>{selectedError.page_path}</span>
              </div>
              <div style={{ background: '#F9FAFB', padding: '10px', borderRadius: '8px', border: '1px solid #F3F4F6' }}>
                <strong style={{ color: '#6B7280', display: 'block', fontSize: '11px' }}>USER EMAIL</strong>
                <span style={{ color: '#111827', fontWeight: '700' }}>{selectedError.user_email || 'Anonymous Guest'}</span>
              </div>
              <div style={{ background: '#F9FAFB', padding: '10px', borderRadius: '8px', border: '1px solid #F3F4F6' }}>
                <strong style={{ color: '#6B7280', display: 'block', fontSize: '11px' }}>ERROR TYPE</strong>
                <span style={{ color: '#111827', fontWeight: '700' }}>{selectedError.error_type}</span>
              </div>
              <div style={{ background: '#F9FAFB', padding: '10px', borderRadius: '8px', border: '1px solid #F3F4F6' }}>
                <strong style={{ color: '#6B7280', display: 'block', fontSize: '11px' }}>STATUS</strong>
                <span style={{ color: selectedError.resolved ? '#059669' : '#DC2626', fontWeight: '800' }}>
                  {selectedError.resolved ? 'Resolved' : 'Unresolved'}
                </span>
              </div>
            </div>

            {/* User Agent */}
            {selectedError.user_agent && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Client User Agent
                </div>
                <div style={{ background: '#F9FAFB', padding: '8px 12px', borderRadius: '6px', fontSize: '11.5px', color: '#4B5563', fontFamily: 'monospace' }}>
                  {selectedError.user_agent}
                </div>
              </div>
            )}

            {/* Stack Trace */}
            {selectedError.error_stack && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase' }}>
                    Stack Trace
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedError.error_stack);
                      alert('Stack trace copied to clipboard!');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#2563EB',
                      fontSize: '11.5px',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    Copy Stack Trace
                  </button>
                </div>
                <pre
                  style={{
                    background: '#1F2937',
                    color: '#F9FAFB',
                    padding: '14px',
                    borderRadius: '8px',
                    fontSize: '11.5px',
                    lineHeight: 1.5,
                    overflowX: 'auto',
                    maxHeight: '260px',
                    fontFamily: 'monospace',
                  }}
                >
                  {selectedError.error_stack}
                </pre>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => handleToggleResolve(selectedError)}
                style={{
                  background: selectedError.resolved ? '#F3F4F6' : '#10B981',
                  color: selectedError.resolved ? '#374151' : '#FFFFFF',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                {selectedError.resolved ? 'Mark as Unresolved' : '✓ Mark as Resolved'}
              </button>
              <button
                type="button"
                onClick={() => setSelectedError(null)}
                style={{
                  background: '#E5E7EB',
                  color: '#374151',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
