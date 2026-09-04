import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  trackPagePresence,
  logPageView,
  subscribeToPresence,
} from '../../services/visitorService';
import './LiveVisitorCounter.css';

export default function LiveVisitorCounter() {
  const location = useLocation();
  const [visitorData, setVisitorData] = useState({ totalActive: 0, pageBreakdown: [] });
  const [isExpanded, setIsExpanded] = useState(false);
  const panelRef = useRef(null);

  // Track presence and log page view on every route change
  useEffect(() => {
    const path = location.pathname;
    trackPagePresence(path);
    logPageView(path);
  }, [location.pathname]);

  // Subscribe to real-time presence updates
  useEffect(() => {
    const unsub = subscribeToPresence((data) => {
      setVisitorData(data);
    });
    return unsub;
  }, []);

  // Close panel on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsExpanded(false);
      }
    };
    if (isExpanded) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isExpanded]);

  // Don't render on admin pages
  if (location.pathname.startsWith('/admin')) return null;

  const count = visitorData.totalActive || 0;

  return (
    <div className="liveCounterWrap" ref={panelRef}>
      {/* Expanded breakdown panel */}
      {isExpanded && visitorData.pageBreakdown.length > 0 && (
        <div className="liveCounterPanel">
          <div className="panelTitle">
            <span className="liveDotPulse" style={{ width: '7px', height: '7px' }} />
            Live Visitors by Page
          </div>
          {visitorData.pageBreakdown.slice(0, 8).map((item) => (
            <div className="pageRow" key={item.page}>
              <span className="pageRowLabel">{item.label}</span>
              <span className="pageRowCount">{item.count}</span>
            </div>
          ))}
        </div>
      )}

      {/* Main counter pill */}
      <div
        className="liveCounterPill"
        onClick={() => setIsExpanded(!isExpanded)}
        title="Active visitors on Bihar AI Mission right now"
      >
        <span className="liveDotPulse" />
        <span className="liveCounterNumber">{count}</span>
      </div>
    </div>
  );
}
