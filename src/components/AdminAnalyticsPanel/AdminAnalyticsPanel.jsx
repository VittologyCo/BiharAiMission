import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchAnalyticsSummary,
  subscribeToPresence,
  getPageLabel,
  parseReferrerSource,
  parseDeviceFromUA,
} from '../../services/visitorService';
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
  const [analytics, setAnalytics] = useState(null);
  const [liveData, setLiveData] = useState({ totalActive: 0, pageBreakdown: [], visitors: [] });
  const [recentHits, setRecentHits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [peakLive, setPeakLive] = useState(0);
  const [lastLiveEvent, setLastLiveEvent] = useState(null);
  const [liveFlash, setLiveFlash] = useState(false);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  // Load analytics data
  const loadData = useCallback(async (showRefreshing = false) => {
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

  // Subscribe to real-time Postgres changes on public.page_views
  useEffect(() => {
    loadData();

    let channel = null;
    if (supabase) {
      try {
        channel = supabase
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

                // Flash pulse
                setLastLiveEvent(new Date().toLocaleTimeString());
                setLiveFlash(true);
                setTimeout(() => setLiveFlash(false), 1800);

                // Prepend to real-time hits feed
                setRecentHits((prev) => [newHit, ...prev.slice(0, 9)]);

                // Increment summary counters in real time
                setAnalytics((prev) => {
                  if (!prev) return prev;
                  const curHour = new Date().getHours();
                  const updatedHourly = [...prev.hourlyToday];
                  updatedHourly[curHour] = (updatedHourly[curHour] || 0) + 1;

                  // Update top pages
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
        console.warn('[AdminAnalytics] Realtime subscription error:', e);
      }
    }

    // Periodic sync every 45 seconds to keep all aggregates reconciled
    const interval = setInterval(() => {
      loadData();
    }, 45000);

    return () => {
      clearInterval(interval);
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [loadData]);

  // Subscribe to live concurrent visitors via Supabase Presence
  useEffect(() => {
    const unsub = subscribeToPresence((data) => {
      setLiveData(data);
      setPeakLive((prev) => Math.max(prev, data.totalActive || 0));
    });
    return unsub;
  }, []);

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

  // Color tokens
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
        @keyframes flashRow {
          0% { background-color: rgba(16, 185, 129, 0.25); }
          100% { background-color: transparent; }
        }
        .live-hit-row-new {
          animation: flashRow 2s ease-out;
        }
      `}</style>

      {/* ─── 1. TOP HEADER & REALTIME STATUS ─────────────────────────── */}
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
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              color: '#FFFFFF',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
              flexShrink: 0,
            }}
          >
            📈
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '21px', fontWeight: '900', color: '#111827', margin: 0, letterSpacing: '-0.02em' }}>
                Real-Time Website Analytics
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
              High-priority metrics, live visitor stream, traffic channels, and device insights.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {lastLiveEvent && (
            <div
              style={{
                fontSize: '11.5px',
                color: liveFlash ? '#059669' : '#6B7280',
                background: liveFlash ? '#D1FAE5' : '#F9FAFB',
                border: '1px solid',
                borderColor: liveFlash ? '#6EE7B7' : '#E5E7EB',
                padding: '6px 12px',
                borderRadius: '8px',
                fontWeight: '700',
                transition: 'all 0.3s ease',
              }}
            >
              ⚡ Last Hit: {lastLiveEvent}
            </div>
          )}

          <button
            type="button"
            onClick={() => loadData(true)}
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

      {/* ─── 2. EXECUTIVE METRICS CARDS (5 HIGH-PRIORITY TILES) ──────── */}
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

        {/* Tile 5: All-Time Total */}
        <div style={cardStyle}>
          <div style={{ fontSize: '11px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
            🌐 All-Time Views
          </div>
          <div style={{ fontSize: '32px', fontWeight: '900', color: '#111827', lineHeight: 1.1 }}>
            {a.allTime.views.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '6px' }}>
            Total page hits logged
          </div>
        </div>
      </div>

      {/* ─── 3. LIVE ACTIVITY STREAM (REAL-TIME TICKER) ──────────────── */}
      <div
        style={{
          ...cardStyle,
          marginBottom: '22px',
          borderLeft: '4px solid #10B981',
        }}
      >
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
                {/* Left: Route and user */}
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

                {/* Center: Visitor Identity & Source */}
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

                {/* Right: Timestamp */}
                <div style={{ fontSize: '11.5px', color: '#9CA3AF', fontWeight: '600', minWidth: '70px', textAlign: 'right' }}>
                  {formatRelativeTime(hit.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── 4. TWO-COLUMN HIGH SIGNAL BENTO ─────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '18px',
          marginBottom: '22px',
        }}
      >
        {/* Card A: Top Visited Content */}
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

                  {/* Visual Bar */}
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

        {/* Card B: Traffic Sources & Device Distribution */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: '14.5px', fontWeight: '900', color: '#111827', margin: '0 0 14px' }}>
            🧭 Traffic Acquisition & Device Split
          </h3>

          {/* Device Split Bar */}
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

          {/* Sources List */}
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

      {/* ─── 5. TODAY'S 24-HOUR PEAK TRAFFIC CURVE ────────────────────── */}
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
    </div>
  );
}
