import React, { useState, useEffect, useMemo } from 'react';
import {
  fetchAnalyticsSummary,
  subscribeToPresence,
  getPageLabel,
} from '../../services/visitorService';
import { supabase } from '../../utils/supabase';

export default function AdminAnalyticsPanel() {
  const [analytics, setAnalytics] = useState(null);
  const [liveData, setLiveData] = useState({ totalActive: 0, pageBreakdown: [], visitors: [] });
  const [loading, setLoading] = useState(true);
  const [peakLive, setPeakLive] = useState(0);

  // Fetch historical analytics
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const data = await fetchAnalyticsSummary();
      if (mounted) {
        setAnalytics(data);
        setLoading(false);
      }
    };
    load();

    // Subscribe to page_views realtime to refresh analytics
    let channel = null;
    if (supabase) {
      try {
        channel = supabase
          .channel('admin_page_views_monitor')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'page_views' }, () => {
            load(); // Refresh on new page view
          })
          .subscribe();
      } catch (e) {}
    }

    // Refresh every 30s
    const interval = setInterval(load, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
      if (channel && supabase) supabase.removeChannel(channel);
    };
  }, []);

  // Subscribe to live presence
  useEffect(() => {
    const unsub = subscribeToPresence((data) => {
      setLiveData(data);
      setPeakLive((prev) => Math.max(prev, data.totalActive));
    });
    return unsub;
  }, []);

  const a = analytics || {
    today: { views: 0, unique: 0 },
    thisWeek: { views: 0, unique: 0 },
    thisMonth: { views: 0, unique: 0 },
    allTime: { views: 0, unique: 0 },
    topPages: [],
    hourlyToday: Array(24).fill(0),
    dailyThisMonth: Array(31).fill(0),
    peakConcurrent: 0,
  };

  const maxHourly = Math.max(...a.hourlyToday, 1);
  const maxDaily = Math.max(...a.dailyThisMonth, 1);
  const currentHour = new Date().getHours();

  // Card style helper
  const cardStyle = (accent = '#111827') => ({
    background: '#FFFFFF',
    border: '1px solid rgba(17, 24, 39, 0.08)',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
    position: 'relative',
    overflow: 'hidden',
  });

  return (
    <div style={{ marginBottom: '32px' }}>
      {/* SECTION HEADER */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px', color: '#FFFFFF', flexShrink: 0,
          }}>📊</div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#111827', margin: 0 }}>
              Real-Time Website Analytics
            </h2>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: '2px 0 0' }}>
              Live visitors, page views, traffic trends — updated in real-time.
            </p>
          </div>
        </div>

        {/* Status Indicator */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: '#F9FAFB', border: '1px solid #E5E7EB',
          color: '#374151', fontSize: '12px', fontWeight: '700',
          padding: '6px 14px', borderRadius: '9999px',
        }}>
          <span style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: '#10B981', boxShadow: '0 0 8px #10B981',
          }} />
          Realtime Feed Active
        </div>
      </div>

      {/* LIVE STATS BENTO GRID */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}>
        {/* Live Visitors NOW */}
        <div style={{
          ...cardStyle(),
          background: 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)',
          color: '#FFFFFF',
          border: '1px solid #10B981',
        }}>
          <div style={{ fontSize: '11px', fontWeight: '800', color: '#A7F3D0', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
            ⚡ Live Right Now
          </div>
          <div style={{ fontSize: '38px', fontWeight: '900', lineHeight: 1.1, fontFamily: "'Fraunces', serif" }}>
            {liveData.totalActive}
          </div>
          <div style={{ fontSize: '12px', color: '#6EE7B7', marginTop: '6px' }}>
            Peak today: {Math.max(peakLive, a.peakConcurrent)} concurrent
          </div>
        </div>

        {/* Today */}
        <div style={cardStyle()}>
          <div style={{ fontSize: '11px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
            📅 Today's Views
          </div>
          <div style={{ fontSize: '32px', fontWeight: '900', color: '#111827', lineHeight: 1.1 }}>
            {a.today.views}
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '6px' }}>
            {a.today.unique} unique visitors
          </div>
        </div>

        {/* This Week */}
        <div style={cardStyle()}>
          <div style={{ fontSize: '11px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
            📆 This Week
          </div>
          <div style={{ fontSize: '32px', fontWeight: '900', color: '#111827', lineHeight: 1.1 }}>
            {a.thisWeek.views}
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '6px' }}>
            {a.thisWeek.unique} unique visitors
          </div>
        </div>

        {/* This Month */}
        <div style={cardStyle()}>
          <div style={{ fontSize: '11px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
            📊 This Month
          </div>
          <div style={{ fontSize: '32px', fontWeight: '900', color: '#111827', lineHeight: 1.1 }}>
            {a.thisMonth.views}
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '6px' }}>
            {a.thisMonth.unique} unique visitors
          </div>
        </div>

        {/* All-time */}
        <div style={cardStyle()}>
          <div style={{ fontSize: '11px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
            🌐 All-Time Total
          </div>
          <div style={{ fontSize: '32px', fontWeight: '900', color: '#111827', lineHeight: 1.1 }}>
            {a.allTime.views.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '6px' }}>
            page views logged
          </div>
        </div>
      </div>

      {/* MIDDLE ROW: Live Page Breakdown + Top Pages (Month) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}>
        {/* Live visitors by page */}
        <div style={cardStyle()}>
          <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#111827', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981' }} />
            Live Visitors by Page
          </h3>
          {liveData.pageBreakdown.length === 0 ? (
            <div style={{ fontSize: '13px', color: '#9CA3AF', padding: '20px 0', textAlign: 'center' }}>
              No live visitors detected yet.
            </div>
          ) : (
            liveData.pageBreakdown.map((item) => (
              <div key={item.page} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 0', borderBottom: '1px solid #F3F4F6',
              }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>{item.label}</div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{item.page}</div>
                </div>
                <span style={{
                  background: '#ECFDF5', color: '#059669', fontWeight: '800',
                  fontSize: '12px', padding: '3px 10px', borderRadius: '9999px',
                  border: '1px solid #A7F3D0',
                }}>
                  {item.count} {item.count === 1 ? 'visitor' : 'visitors'}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Top pages this month */}
        <div style={cardStyle()}>
          <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#111827', margin: '0 0 14px' }}>
            🔥 Most Visited Pages (This Month)
          </h3>
          {a.topPages.length === 0 ? (
            <div style={{ fontSize: '13px', color: '#9CA3AF', padding: '20px 0', textAlign: 'center' }}>
              No page view data yet.
            </div>
          ) : (
            a.topPages.slice(0, 8).map((item, idx) => (
              <div key={item.page} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 0', borderBottom: '1px solid #F3F4F6',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    width: '24px', height: '24px', borderRadius: '6px',
                    background: idx < 3 ? '#FEF3C7' : '#F3F4F6',
                    color: idx < 3 ? '#B45309' : '#6B7280',
                    fontWeight: '900', fontSize: '11px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {idx + 1}
                  </span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>{item.label}</div>
                    <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{item.page}</div>
                  </div>
                </div>
                <span style={{ fontWeight: '800', fontSize: '13px', color: '#111827' }}>
                  {item.views.toLocaleString()} views
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* BOTTOM ROW: Hourly Chart + Daily Chart */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '16px',
      }}>
        {/* Hourly traffic today */}
        <div style={cardStyle()}>
          <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#111827', margin: '0 0 14px' }}>
            ⏰ Hourly Traffic Today
          </h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '100px' }}>
            {a.hourlyToday.map((val, hour) => (
              <div
                key={hour}
                title={`${hour}:00 — ${val} views`}
                style={{
                  flex: 1,
                  height: `${Math.max((val / maxHourly) * 100, 3)}%`,
                  background: hour === currentHour
                    ? 'linear-gradient(180deg, #10B981 0%, #059669 100%)'
                    : hour < currentHour
                    ? 'linear-gradient(180deg, #E5E7EB 0%, #D1D5DB 100%)'
                    : '#F3F4F6',
                  borderRadius: '3px 3px 0 0',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '10px', color: '#9CA3AF' }}>
            <span>12 AM</span>
            <span>6 AM</span>
            <span>12 PM</span>
            <span>6 PM</span>
            <span>11 PM</span>
          </div>
        </div>

        {/* Daily traffic this month */}
        <div style={cardStyle()}>
          <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#111827', margin: '0 0 14px' }}>
            📈 Daily Traffic This Month
          </h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '100px' }}>
            {a.dailyThisMonth.map((val, day) => {
              const todayDay = new Date().getDate() - 1;
              return (
                <div
                  key={day}
                  title={`Day ${day + 1} — ${val} views`}
                  style={{
                    flex: 1,
                    height: `${Math.max((val / maxDaily) * 100, 2)}%`,
                    background: day === todayDay
                      ? 'linear-gradient(180deg, #C1552C 0%, #9F3812 100%)'
                      : day < todayDay
                      ? val > 0
                        ? 'linear-gradient(180deg, #FDE68A 0%, #FCD34D 100%)'
                        : '#F3F4F6'
                      : '#F9FAFB',
                    borderRadius: '2px 2px 0 0',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                  }}
                />
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '10px', color: '#9CA3AF' }}>
            <span>1st</span>
            <span>10th</span>
            <span>20th</span>
            <span>{a.dailyThisMonth.length}th</span>
          </div>
        </div>
      </div>
    </div>
  );
}
