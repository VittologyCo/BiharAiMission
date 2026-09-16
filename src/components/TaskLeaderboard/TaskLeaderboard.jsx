import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchRealtimeLeaderboardData, subscribeToLeaderboardRealtime } from '../../services/taskService';
import './TaskLeaderboard.css';

export default function TaskLeaderboard({ isHi = false, title = null, limit = null, showPodium = true }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = useCallback(async () => {
    try {
      setRefreshing(true);
      const data = await fetchRealtimeLeaderboardData();
      setLeaderboard(data || []);
      setLoading(false);
    } catch (err) {
      console.warn('Leaderboard load error:', err);
      setLoading(false);
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Real-time updates subscription from Supabase & window events
    const unsubscribe = subscribeToLeaderboardRealtime((updatedList) => {
      if (Array.isArray(updatedList)) {
        setLeaderboard(updatedList);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [loadData]);

  // Filter based on search query (Name, Designation, District)
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) {
      return limit ? leaderboard.slice(0, limit) : leaderboard;
    }
    const q = searchQuery.toLowerCase().trim();
    const result = leaderboard.filter((item) => {
      const nameMatch = (item.name || '').toLowerCase().includes(q);
      const desigMatch = (item.designation || '').toLowerCase().includes(q);
      const orgMatch = (item.organization || '').toLowerCase().includes(q);
      const distMatch = (item.district || '').toLowerCase().includes(q);

      return nameMatch || desigMatch || orgMatch || distMatch;
    });

    return limit ? result.slice(0, limit) : result;
  }, [leaderboard, searchQuery, limit]);

  const topThree = useMemo(() => leaderboard.slice(0, 3), [leaderboard]);

  return (
    <div className="lbContainer">
      {/* HEADER BAR */}
      <div className="lbHeaderRow">
        <div className="lbTitleWrap">
          <div className="lbIconBadge">🏆</div>
          <div>
            <h2 className="lbTitle">
              {title || (isHi ? 'दैनिक कार्य लीडरबोर्ड (रियल-टाइम)' : 'Daily Tasks Leaderboard')}
            </h2>
            <p className="lbSubtitle">
              {isHi
                ? 'अभ्यर्थियों द्वारा अपलोड किए गए असाइनमेंट, पद और जिले के आधार पर लाइव रैंकिंग।'
                : 'Live rankings by total tasks uploaded, candidate designations, and districts.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadData}
          className="liveBadge"
          style={{ cursor: 'pointer' }}
          title={isHi ? 'ताज़ा करने के लिए क्लिक करें' : 'Click to refresh leaderboard'}
        >
          <span className={`liveDot ${refreshing ? 'spinning' : ''}`} />
          <span>{refreshing ? (isHi ? 'सिंक हो रहा है...' : 'Syncing...') : (isHi ? 'लाइव अपडेट' : 'Real-Time Sync')}</span>
        </button>
      </div>

      {/* CONTROLS (SEARCH & TOTAL STATS) */}
      <div className="lbControlsBar">
        <div className="lbSearchBox">
          <span className="lbSearchIcon">🔍</span>
          <input
            type="text"
            placeholder={isHi ? 'नाम, पद या जिला खोजें...' : 'Search by name, designation, district...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="lbSearchInput"
          />
        </div>

        <div className="lbStatsChips">
          <span className="lbStatChip">
            👥 <strong>{leaderboard.length}</strong> {isHi ? 'अभ्यर्थी' : 'Candidates'}
          </span>
          <span className="lbStatChip">
            ⚡ <strong>{leaderboard.reduce((acc, c) => acc + (c.total || 0), 0)}</strong> {isHi ? 'कुल कार्य अपलोड' : 'Tasks Uploaded'}
          </span>
        </div>
      </div>

      {/* TOP 3 HIGHLIGHTS CARDS */}
      {showPodium && !searchQuery && topThree.length > 0 && (
        <div className="podiumGrid">
          {topThree.map((top, idx) => {
            const podiumClass = idx === 0 ? 'goldPodium' : idx === 1 ? 'silverPodium' : 'bronzePodium';
            const medalEmoji = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';
            const medalLabel = idx === 0 ? (isHi ? 'प्रथम स्थान' : '1st Place') : idx === 1 ? (isHi ? 'द्वितीय स्थान' : '2nd Place') : (isHi ? 'तृतीय स्थान' : '3rd Place');
            const medalBg = idx === 0 ? '#FEF3C7' : idx === 1 ? '#F3F4F6' : '#FFEDD5';
            const medalColor = idx === 0 ? '#92400E' : idx === 1 ? '#374151' : '#9A3412';
            const medalBorder = idx === 0 ? '#D97706' : idx === 1 ? '#4B5563' : '#C1552C';

            return (
              <div key={top.email || top.name} className={`podiumCard ${podiumClass}`}>
                <div className="podiumTopRow">
                  <span className="podiumMedal">{medalEmoji}</span>
                  <span
                    className="podiumRankTag"
                    style={{ background: medalBg, color: medalColor, border: `1.5px solid ${medalBorder}` }}
                  >
                    {medalLabel}
                  </span>
                </div>

                <h3 className="podiumName">{top.name}</h3>

                <div className="podiumDesignation">
                  <span>💼</span>
                  <span>
                    {top.designation || 'AI Candidate'}
                    {top.organization ? ` • ${top.organization}` : ''}
                  </span>
                </div>

                <div className="podiumStatsBar">
                  <span className="podiumDistrict">📍 {top.district || 'Bihar'}</span>
                  <span className="podiumTaskCount">
                    ⚡ {top.total || 0} {top.total === 1 ? 'Task Uploaded' : 'Tasks Uploaded'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FULL RANKINGS LIST */}
      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--color-terracotta-500, #C1552C)', fontSize: '15px', fontWeight: '700' }}>
          ⚡ {isHi ? 'लीडरबोर्ड लोड हो रहा है...' : 'Loading Real-Time Leaderboard...'}
        </div>
      ) : filteredList.length === 0 ? (
        <div className="lbEmptyState">
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>🔍</div>
          <h4 className="lbEmptyStateTitle">
            {isHi ? 'कोई अभ्यर्थी नहीं मिला' : 'No Candidates Found'}
          </h4>
          <p className="lbEmptyStateDesc">
            {isHi ? 'कृपया अलग कीवर्ड खोजें।' : 'Try searching with a different candidate name, designation, or district.'}
          </p>
        </div>
      ) : (
        <div className="lbTableWrap">
          <div style={{ overflowX: 'auto' }}>
            <table className="lbTable">
              <thead>
                <tr>
                  <th style={{ width: '80px', textAlign: 'center' }}>{isHi ? 'रैंक' : 'RANK'}</th>
                  <th>{isHi ? 'नाम' : 'NAME'}</th>
                  <th>{isHi ? 'पद' : 'DESIGNATION'}</th>
                  <th>{isHi ? 'जिला' : 'DISTRICT'}</th>
                  <th style={{ textAlign: 'right', paddingRight: '20px' }}>{isHi ? 'अपलोड किए गए कार्य' : 'TASKS UPLOADED'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((item) => {
                  const rankIcon = item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : `#${item.rank}`;
                  return (
                    <tr key={item.email || item.name}>
                      {/* 1. RANK */}
                      <td style={{
                        textAlign: 'center',
                        fontWeight: '900',
                        fontSize: '15px',
                        color: item.rank <= 3 ? 'var(--color-ink, #181512)' : 'var(--color-ink-muted, #5E554D)',
                        fontFamily: "var(--font-mono, 'Fira Code', monospace)"
                      }}>
                        {rankIcon}
                      </td>

                      {/* 2. NAME (No email) */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: item.rank === 1
                              ? 'linear-gradient(135deg, #F59E0B, #D97706)'
                              : item.rank === 2
                              ? 'linear-gradient(135deg, #6B7280, #4B5563)'
                              : item.rank === 3
                              ? 'linear-gradient(135deg, #EA580C, #C1552C)'
                              : 'linear-gradient(135deg, #C1552C, #872E0C)',
                            border: '1.5px solid var(--color-ink, #181512)',
                            boxShadow: '1.5px 1.5px 0px var(--color-ink, #181512)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '800',
                            fontSize: '14px',
                            color: '#FFFFFF',
                            flexShrink: 0
                          }}>
                            {item.name ? item.name[0].toUpperCase() : 'C'}
                          </div>
                          <strong style={{ color: 'var(--color-ink, #181512)', fontSize: '14.5px', letterSpacing: '-0.01em' }}>
                            {item.name}
                          </strong>
                        </div>
                      </td>

                      {/* 3. DESIGNATION */}
                      <td>
                        <div style={{ fontSize: '13px', color: 'var(--color-terracotta-500, #C1552C)', fontWeight: '700' }}>
                          💼 {item.designation || 'Participant'}
                          {item.organization ? ` • ${item.organization}` : ''}
                        </div>
                      </td>

                      {/* 4. DISTRICT */}
                      <td>
                        <span className="lbDistrictBadge">
                          📍 {item.district || 'Bihar'}
                        </span>
                      </td>

                      {/* 5. TASKS UPLOADED */}
                      <td style={{ textAlign: 'right', paddingRight: '20px' }}>
                        <span className="lbTaskPill">
                          <span style={{ color: 'var(--color-terracotta-500, #C1552C)' }}>⚡</span>
                          <strong>{item.total || 0}</strong> {item.total === 1 ? 'Task' : 'Tasks'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
