import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { fetchTop10AiNews, fetchTop10GovtNews } from '../../services/newsService';
import './DailyNewsRadar.css';

export default function DailyNewsRadar() {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const [activeStream, setActiveStream] = useState('ai'); // 'ai' | 'govt'
  const [aiNews, setAiNews] = useState([]);
  const [govtNews, setGovtNews] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Dynamic Live Date & Day Formatting
  const todayFormatted = useMemo(() => {
    const now = new Date();
    const options = { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' };
    return now.toLocaleDateString(isHi ? 'hi-IN' : 'en-IN', options);
  }, [isHi]);

  // 2. Fetch both Top 10 streams
  useEffect(() => {
    let isMounted = true;
    const loadNews = async () => {
      setLoading(true);
      const [aiData, govtData] = await Promise.all([
        fetchTop10AiNews(),
        fetchTop10GovtNews()
      ]);
      if (isMounted) {
        setAiNews(aiData || []);
        setGovtNews(govtData || []);
        setLoading(false);
      }
    };

    loadNews();
    return () => { isMounted = false; };
  }, []);

  const currentList = activeStream === 'ai' ? aiNews : govtNews;

  return (
    <section className="newsRadarSection" id="daily-radar">
      <div className="newsRadarContainer">
        
        {/* Section Header with Live Date & Day */}
        <div className="radarHeader">
          <div className="radarDatePill">
            <span className="liveDot" />
            <span>{isHi ? 'दैनिक एआई एवं शासन रडार' : '60-SECOND DAILY RADAR'}</span>
            <span>•</span>
            <span>📅 {todayFormatted}</span>
          </div>

          <h2 className="radarTitle">
            {isHi ? (
              <>आज के शीर्ष <span className="radarTitleHighlight">एआई एवं सरकारी समाचार</span></>
            ) : (
              <>Today’s Top <span className="radarTitleHighlight">AI & Government Radar</span></>
            )}
          </h2>

          <p className="radarSubtitle">
            {isHi
              ? 'बिहार, भारत और वैश्विक स्तर पर उच्च-प्रभाव वाले शासन आदेशों, नीतिगत निर्णयों एवं एआई विकास को प्रत्यक्ष आधिकारिक स्रोतों से प्रस्तुत करता त्वरित बुलेटिन।'
              : 'Curated intelligence dispatch tracking high-impact governance orders, policy breakthroughs, and AI advancements across Bihar, India, and global frontiers with direct source links.'}
          </p>
        </div>

        {/* Stream Switcher Tabs */}
        <div className="streamTabsWrap">
          <button
            type="button"
            className={`streamTabBtn ${activeStream === 'ai' ? 'streamTabActive' : ''}`}
            onClick={() => setActiveStream('ai')}
          >
            <span>🤖</span>
            <span>{isHi ? 'शीर्ष एआई एवं तकनीकी समाचार' : 'Top AI & Tech News'}</span>
            <span className="tabCountBadge">{aiNews.length}</span>
          </button>

          <button
            type="button"
            className={`streamTabBtn ${activeStream === 'govt' ? 'streamTabActive' : ''}`}
            onClick={() => setActiveStream('govt')}
          >
            <span>🏛️</span>
            <span>{isHi ? 'शीर्ष प्रमुख सरकारी एवं विभागीय समाचार' : 'Top Major Government & Departmental News'}</span>
            <span className="tabCountBadge">{govtNews.length}</span>
          </button>
        </div>

        {/* Top 10 News List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#E28B5C', fontWeight: '800' }}>
            ⚡ {isHi ? 'आज का समाचार रडार लोड हो रहा है...' : 'Loading Today’s Verified News Radar...'}
          </div>
        ) : (
          <div className="newsListGrid">
            {currentList.map((item, index) => {
              const rank = index + 1;
              const isTop3 = rank <= 3;
              const regionClass = item.region === 'bihar' ? 'regionBihar' : item.region === 'india' ? 'regionIndia' : 'regionGlobal';
              const regionLabel = item.region === 'bihar' ? '📍 Bihar' : item.region === 'india' ? '🇮🇳 India' : '🌐 Global';

              return (
                <article key={item.id || index} className="newsCard">
                  {/* Rank Badge */}
                  <div className={`rankBadgeBox ${isTop3 ? 'rankTop3' : 'rankStandard'}`}>
                    <span>#{rank}</span>
                  </div>

                  {/* Main Content */}
                  <div className="cardMain">
                    <div className="tagRow">
                      <span className={`regionPill ${regionClass}`}>{regionLabel}</span>
                      {item.department && (
                        <span className="deptTag">{item.department}</span>
                      )}
                      <span className="datePill">📅 {item.publishedDate || 'Today'}</span>
                    </div>

                    <h3 className="newsCardTitle">{item.title}</h3>
                    <p className="newsCardSummary">{item.summary}</p>
                  </div>

                  {/* Action & Direct Verified Targeted Source */}
                  <div className="cardAction">
                    <span className="sourceBadge">
                      <span>📰</span>
                      <span>{item.sourceName}</span>
                    </span>

                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sourceLinkBtn"
                      title="Read targeted full article in new tab"
                    >
                      <span>{isHi ? 'पूरा लेख पढ़ें' : 'Read Full Article'}</span>
                      <span>↗</span>
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
