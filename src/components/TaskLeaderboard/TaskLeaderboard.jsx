import React, { useState, useEffect, useMemo } from 'react';
import { fetchRealtimeLeaderboardData, subscribeToLeaderboardRealtime } from '../../services/taskService';
import './TaskLeaderboard.css';

export default function TaskLeaderboard({ isHi = false, title = null, limit = null, showPodium = true }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const data = await fetchRealtimeLeaderboardData();
        if (isMounted) {
          setLeaderboard(data || []);
          setLoading(false);
        }
      } catch (err) {
        console.warn('Leaderboard load error:', err);
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    // Real-time updates subscription from Supabase & window events
    const unsubscribe = subscribeToLeaderboardRealtime((updatedList) => {
      if (isMounted && Array.isArray(updatedList)) {
        setLeaderboard(updatedList);
      }
    });

    return () => {
      isMounted = false;
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

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

        <div className="liveBadge">
          <span className="liveDot" />
          <span>{isHi ? 'लाइव अपडेट' : 'Real-Time Sync'}</span>
        </div>
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

        <div style={{ fontSize: '13px', color: 'var(--color-sand-200, #C2B7A3)', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span>
            👥 <strong>{leaderboard.length}</strong> {isHi ? 'अभ्यर्थी' : 'Candidates'}
          </span>
          <span>
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
            const medalBg = idx === 0 ? 'rgba(245, 158, 11, 0.15)' : idx === 1 ? 'rgba(156, 163, 175, 0.15)' : 'rgba(249, 115, 22, 0.15)';
            const medalColor = idx === 0 ? '#F59E0B' : idx === 1 ? '#E5E7EB' : '#FB923C';

            return (
              <div key={top.email || top.name} className={`podiumCard ${podiumClass}`}>
                <div className="podiumTopRow">
                  <span className="podiumMedal">{medalEmoji}</span>
                  <span
                    className="podiumRankTag"
                    style={{ background: medalBg, color: medalColor, border: `1px solid ${medalColor}` }}
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
        <div style={{ padding: '50px 0', textAlign: 'center', color: '#E28B5C', fontSize: '15px' }}>
          ⚡ {isHi ? 'लीडरबोर्ड लोड हो रहा है...' : 'Loading Real-Time Leaderboard...'}
        </div>
      ) : filteredList.length === 0 ? (
        <div style={{ padding: '50px 20px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>🔍</div>
          <h4 style={{ fontSize: '16px', margin: '0 0 6px', color: '#FFFFFF' }}>
            {isHi ? 'कोई अभ्यर्थी नहीं मिला' : 'No Candidates Found'}
          </h4>
          <p style={{ fontSize: '13px', color: '#9CA3AF', margin: 0 }}>
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
                  <th style={{ textAlign: 'right', paddingRight: '24px' }}>{isHi ? 'अपलोड किए गए कार्य' : 'TASKS UPLOADED'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((item) => {
                  const rankIcon = item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : `#${item.rank}`;
                  return (
                    <tr key={item.email || item.name}>
                      {/* 1. RANK */}
                      <td style={{ textAlign: 'center', fontWeight: '900', fontSize: '15px', color: item.rank <= 3 ? '#F59E0B' : '#C2B7A3' }}>
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
                              ? 'linear-gradient(135deg, #9CA3AF, #6B7280)'
                              : item.rank === 3
                              ? 'linear-gradient(135deg, #F97316, #EA580C)'
                              : 'linear-gradient(135deg, #E28B5C, #C1552C)',
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
                          <strong style={{ color: '#FFFFFF', fontSize: '14.5px', letterSpacing: '-0.01em' }}>
                            {item.name}
                          </strong>
                        </div>
                      </td>

                      {/* 3. DESIGNATION */}
                      <td>
                        <div style={{ fontSize: '13px', color: '#E28B5C', fontWeight: '700' }}>
                          💼 {item.designation || 'Participant'}
                          {item.organization ? ` • ${item.organization}` : ''}
                        </div>
                      </td>

                      {/* 4. DISTRICT */}
                      <td>
                        <span style={{
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          padding: '4px 12px',
                          borderRadius: '8px',
                          fontSize: '12.5px',
                          fontWeight: '600',
                          color: '#F3ECE0'
                        }}>
                          📍 {item.district || 'Bihar'}
                        </span>
                      </td>

                      {/* 5. TASKS UPLOADED */}
                      <td style={{ textAlign: 'right', paddingRight: '24px' }}>
                        <span style={{
                          background: 'rgba(226, 139, 92, 0.15)',
                          color: '#F3ECE0',
                          border: '1px solid rgba(226, 139, 92, 0.35)',
                          padding: '5px 14px',
                          borderRadius: '9999px',
                          fontSize: '13px',
                          fontWeight: '800',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <span style={{ color: '#E28B5C' }}>⚡</span>
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
