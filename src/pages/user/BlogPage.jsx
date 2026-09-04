import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import {
  fetchBlogsFromSupabase,
  incrementBlogViews
} from '../../utils/blogsStorage';
import styles from './BlogPage.module.css';

const CATEGORIES = [
  'All',
  'Mission',
  'Tools & Governance',
  'Education',
  'Startups',
  'Policy',
  'Agriculture',
  'About Us'
];

export default function BlogPage({ onGetInvolved }) {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeArticle, setActiveArticle] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // 1. Fetch Blogs directly from Supabase
  useEffect(() => {
    let isMounted = true;
    const loadBlogs = async () => {
      setLoading(true);
      const data = await fetchBlogsFromSupabase();
      if (isMounted) {
        setBlogs(data || []);
        setLoading(false);
      }
    };

    loadBlogs();

    const handleUpdate = () => loadBlogs();
    window.addEventListener('bihar_ai_blogs_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('bihar_ai_blogs_updated', handleUpdate);
    };
  }, []);

  // 2. Handle URL deep-linking for /blog/:blogId (SEO & Sharing)
  useEffect(() => {
    if (blogId && blogs.length > 0) {
      const found = blogs.find(
        (b) =>
          String(b.slug).toLowerCase() === String(blogId).toLowerCase() ||
          String(b.id) === String(blogId)
      );
      if (found) {
        setActiveArticle(found);
        incrementBlogViews(found.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (!blogId) {
      setActiveArticle(null);
    }
  }, [blogId, blogs]);

  // 3. Navigation handlers
  const handleOpenArticle = (item) => {
    setActiveArticle(item);
    incrementBlogViews(item.id);
    navigate(`/blog/${item.slug || item.id}`, { replace: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setActiveArticle(null);
    navigate('/blog', { replace: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 4. Social Sharing Handlers
  const handleShare = (platform) => {
    const currentUrl = window.location.href;
    const title = activeArticle ? activeArticle.title : 'Bihar AI Mission';

    if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} — ${currentUrl}`)}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(currentUrl)}`, '_blank');
    } else if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`, '_blank');
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(currentUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    }
  };

  // 5. Filter & Search Logic
  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      if (b.isPublished === false) return false;
      const matchesCategory = activeCategory === 'All' || b.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const titleMatch = b.title && b.title.toLowerCase().includes(q);
      const excerptMatch = b.excerpt && b.excerpt.toLowerCase().includes(q);
      const tagMatch = Array.isArray(b.tags) && b.tags.some(t => t.toLowerCase().includes(q));

      return matchesCategory && (q === '' || titleMatch || excerptMatch || tagMatch);
    });
  }, [blogs, activeCategory, searchQuery]);

  const featuredBlog = filteredBlogs[0];
  const gridBlogs = filteredBlogs.slice(1);

  // Recommendations for bottom of full article view
  const relatedArticles = useMemo(() => {
    if (!activeArticle) return [];
    return blogs
      .filter((b) => b.id !== activeArticle.id && b.isPublished !== false)
      .slice(0, 3);
  }, [blogs, activeArticle]);

  // JSON-LD Structured Data Schema for Search Engines & AEO (Perplexity/ChatGPT)
  const jsonLdSchema = useMemo(() => {
    if (activeArticle) {
      return {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        'headline': activeArticle.title,
        'image': activeArticle.image,
        'datePublished': activeArticle.createdAt,
        'author': {
          '@type': 'Person',
          'name': activeArticle.author || 'Bihar AI Mission Editorial Desk'
        },
        'description': activeArticle.excerpt,
        'publisher': {
          '@type': 'Organization',
          'name': 'Bihar AI Mission',
          'url': 'https://biharaimission.org'
        }
      };
    }
    return {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      'name': 'Bihar AI Mission Editorial & Insights',
      'url': 'https://biharaimission.org/blog',
      'description': 'Authoritative articles, governance AI workflows, student learning tracks, and innovation blueprints for Bihar.',
      'publisher': {
        '@type': 'Organization',
        'name': 'Bihar AI Mission',
        'url': 'https://biharaimission.org'
      }
    };
  }, [activeArticle]);

  /* ==========================================================================
     FULL-PAGE EDITORIAL ARTICLE READING VIEW
     ========================================================================== */
  if (activeArticle) {
    return (
      <div className={styles.fullArticlePage}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }} />

        <div className={styles.articleMainWrap}>
          {/* Top Nav Bar */}
          <div className={styles.articleTopNav}>
            <button type="button" onClick={handleBackToList} className={styles.backBtn}>
              <span>←</span>
              <span>{isHi ? 'सभी लेखों पर वापस जाएं' : 'Back to all articles'}</span>
            </button>

            <div className={styles.articleReadStats}>
              <span>⏱️ {activeArticle.readTime || '5 min read'}</span>
              <span>•</span>
              <span>👁️ {activeArticle.views || 1}+ {isHi ? 'views' : 'views'}</span>
            </div>
          </div>

          {/* Article Header (Title, Subtitle, Badges) */}
          <header className={styles.articleHeader}>
            <div className={styles.articleBadgeRow}>
              <span className={styles.categoryTag}>{activeArticle.category}</span>
              <span style={{ color: '#9CA3AF', fontSize: '13px' }}>•</span>
              <span style={{ color: '#9CA3AF', fontSize: '13px' }}>📅 {activeArticle.date}</span>
              {activeArticle.targetPage && (
                <>
                  <span style={{ color: '#9CA3AF', fontSize: '13px' }}>•</span>
                  <span style={{ color: '#E28B5C', fontSize: '12px', fontWeight: '700' }}>
                    🔗 {activeArticle.targetPage}
                  </span>
                </>
              )}
            </div>

            <h1 className={styles.articleTitleMain}>{activeArticle.title}</h1>

            {activeArticle.excerpt && (
              <p className={styles.articleSubtitle}>{activeArticle.excerpt}</p>
            )}

            {/* Author & Social Share Bar */}
            <div className={styles.articleMetaBar}>
              <div className={styles.authorMeta}>
                <div className={styles.authorAvatar}>
                  {activeArticle.author ? activeArticle.author[0] : 'B'}
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '14.5px', color: '#FFFFFF' }}>
                    {activeArticle.author || 'Bihar AI Mission Editorial Desk'}
                  </strong>
                  <span style={{ fontSize: '12px', color: '#E28B5C' }}>
                    {activeArticle.authorRole || 'Author / Contributor'}
                  </span>
                </div>
              </div>

              <div className={styles.shareBar}>
                <button type="button" onClick={() => handleShare('whatsapp')} className={styles.shareBtn} title="Share on WhatsApp">
                  💬 WhatsApp
                </button>
                <button type="button" onClick={() => handleShare('twitter')} className={styles.shareBtn} title="Share on X">
                  𝕏 Post
                </button>
                <button type="button" onClick={() => handleShare('linkedin')} className={styles.shareBtn} title="Share on LinkedIn">
                  💼 LinkedIn
                </button>
                <button type="button" onClick={() => handleShare('copy')} className={styles.shareBtn} title="Copy Link">
                  {copiedUrl ? '✅ Copied!' : '🔗 Copy Link'}
                </button>
              </div>
            </div>
          </header>

          {/* Article Cover Image (Contained & Clean) */}
          {activeArticle.image && (
            <div className={styles.articleCoverWrap}>
              <img src={activeArticle.image} alt={activeArticle.title} className={styles.articleCoverImg} />
            </div>
          )}

          {/* Key Highlights / Summary Box (For AEO / Search Engines) */}
          {activeArticle.excerpt && (
            <div className={styles.keyHighlightsBox}>
              <div className={styles.highlightsTitle}>
                <span>💡</span>
                <span>{isHi ? 'मुख्य सारांश' : 'Executive Summary & Key Takeaways'}</span>
              </div>
              <p className={styles.highlightsText}>{activeArticle.excerpt}</p>
            </div>
          )}

          {/* Formatted Markdown Content Body */}
          <div className={styles.articleBody}>
            {(activeArticle.content || '')
              .split('\n\n')
              .map((paragraph, index) => {
                const trimmed = paragraph.trim();
                if (trimmed.startsWith('## ')) {
                  return <h2 key={index}>{trimmed.replace('## ', '')}</h2>;
                }
                if (trimmed.startsWith('### ')) {
                  return <h3 key={index}>{trimmed.replace('### ', '')}</h3>;
                }
                if (trimmed.startsWith('> ')) {
                  return <blockquote key={index}>{trimmed.replace('> ', '')}</blockquote>;
                }
                if (trimmed.startsWith('* ') || trimmed.startsWith('• ') || trimmed.startsWith('1. ')) {
                  const lines = trimmed.split('\n');
                  return (
                    <ul key={index}>
                      {lines.map((l, i) => (
                        <li key={i}>{l.replace(/^(\* |• |\d+\. )/, '')}</li>
                      ))}
                    </ul>
                  );
                }
                return <p key={index}>{trimmed}</p>;
              })}
          </div>

          {/* Bottom Action Banner */}
          <div style={{
            marginTop: '50px',
            padding: '30px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(226, 139, 92, 0.15) 0%, rgba(193, 85, 44, 0.1) 100%)',
            border: '1px solid rgba(226, 139, 92, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div>
              <h4 style={{ margin: '0 0 6px', color: '#FFFFFF', fontSize: '18px' }}>
                {isHi ? 'बिहार एआई मिशन से जुड़ें' : 'Join the Bihar AI Mission Movement'}
              </h4>
              <p style={{ margin: 0, fontSize: '13.5px', color: '#C2B7A3', maxWidth: '520px' }}>
                {isHi
                  ? 'नि:शुल्क सर्टिफिकेशन, लाइव वर्कशॉप और जिला कार्यक्रमों का हिस्सा बनें।'
                  : 'Get free certified credentials, master hands-on AI tools, and participate across Bihar’s 38 districts.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (onGetInvolved) onGetInvolved();
              }}
              style={{
                background: 'linear-gradient(135deg, #C1552C 0%, #E06738 100%)',
                color: '#FFFFFF',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '12px',
                fontWeight: '800',
                cursor: 'pointer',
                fontSize: '14px',
                boxShadow: '0 4px 18px rgba(193, 85, 44, 0.4)'
              }}
            >
              🚀 {isHi ? 'शामिल हों' : 'Get Involved Today'}
            </button>
          </div>

          {/* Related Articles Section */}
          {relatedArticles.length > 0 && (
            <div style={{ marginTop: '70px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '40px' }}>
              <h3 style={{ fontSize: '22px', color: '#FFFFFF', fontWeight: '800', marginBottom: '24px' }}>
                {isHi ? 'संबंधित लेख पढ़ें' : 'More Insights & Articles'}
              </h3>
              <div className={styles.blogGrid}>
                {relatedArticles.map((item) => (
                  <article key={item.id} className={styles.blogCard} onClick={() => handleOpenArticle(item)}>
                    <div className={styles.cardImageWrap}>
                      <img src={item.image} alt={item.title} className={styles.cardImage} loading="lazy" />
                      <div style={{ position: 'absolute', top: '14px', left: '14px' }}>
                        <span className={styles.categoryTag}>{item.category}</span>
                      </div>
                    </div>
                    <div className={styles.cardBody}>
                      <h4 className={styles.cardTitle}>{item.title}</h4>
                      <p className={styles.cardExcerpt}>{item.excerpt}</p>
                      <span style={{ fontSize: '12.5px', color: '#E28B5C', fontWeight: '800' }}>
                        {isHi ? 'पूरा लेख पढ़ें →' : 'Read Article →'}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ==========================================================================
     MAIN BLOG DIRECTORY LISTING VIEW
     ========================================================================== */
  return (
    <div className={styles.blogContainer}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }} />

      <div className={styles.innerWrap}>
        {/* Hero Section */}
        <div className={styles.heroSection}>
          <div className={styles.badgePill}>
            <span>⚡</span>
            <span>{isHi ? 'बिहार एआई मिशन संपादकीय' : 'BIHAR AI MISSION EDITORIAL'}</span>
          </div>

          <h1 className={styles.pageTitle}>
            {isHi ? (
              <>ज्ञान, अनुसंधान एवं <span className={styles.titleHighlight}>एआई नवप्रवर्तन</span></>
            ) : (
              <>Insights, Research & <span className={styles.titleHighlight}>AI Renaissance</span></>
            )}
          </h1>

          <p className={styles.pageSubtitle}>
            {isHi
              ? 'बिहार के 38 जिलों में कृत्रिम बुद्धिमत्ता, सुशासन टूल्स, युवा कौशल विकास और स्टार्टअप्स पर आधिकारिक शोध, विश्लेषण और लेख।'
              : 'Authoritative analysis, governance AI tutorials, student learning tracks, and agricultural technology blueprints powering Bihar’s 38 districts.'}
          </p>
        </div>

        {/* Controls Bar: Search & Categories */}
        <div className={styles.controlsBar}>
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder={isHi ? 'लेख, विषय या टूल्स खोजें...' : 'Search articles, tools, governance, or policy...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className={styles.clearSearchBtn}
                title="Clear Search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className={styles.categoryPills}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`${styles.pillBtn} ${activeCategory === cat ? styles.pillBtnActive : ''}`}
              >
                {cat === 'All' ? (isHi ? 'सभी लेख (All)' : 'All Insights') : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#E28B5C', fontSize: '17px', fontWeight: '700' }}>
            ⚡ {isHi ? 'लेख लोड हो रहे हैं...' : 'Loading Bihar AI Mission Insights...'}
          </div>
        ) : filteredBlogs.length === 0 ? (
          /* Empty State */
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.07)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
            <h3 style={{ fontSize: '20px', color: '#FFFFFF', margin: '0 0 8px', fontWeight: '800' }}>
              {isHi ? 'कोई लेख उपलब्ध नहीं है' : 'No Articles Found'}
            </h3>
            <p style={{ color: '#A19A8E', fontSize: '14px', maxWidth: '460px', margin: '0 auto' }}>
              {searchQuery
                ? (isHi ? 'कृपया अलग कीवर्ड या श्रेणी चुनकर पुनः प्रयास करें।' : 'Try adjusting your search terms or selecting another category.')
                : (isHi ? 'व्यवस्थापक द्वारा नए लेख जोड़े जाने के बाद यहाँ प्रदर्शित होंगे।' : 'Articles published by the administrator will appear here.')}
            </p>
          </div>
        ) : (
          <>
            {/* Featured Spotlight Card */}
            {featuredBlog && activeCategory === 'All' && !searchQuery && (
              <div className={styles.featuredCard} onClick={() => handleOpenArticle(featuredBlog)}>
                <div className={styles.featuredImageWrap}>
                  <img src={featuredBlog.image} alt={featuredBlog.title} className={styles.featuredImage} loading="lazy" />
                  <div className={styles.featuredBadge}>⭐ Spotlight Article</div>
                </div>

                <div className={styles.featuredBody}>
                  <div className={styles.cardMeta}>
                    <span className={styles.categoryTag}>{featuredBlog.category}</span>
                    <span>•</span>
                    <span>⏱️ {featuredBlog.readTime}</span>
                    <span>•</span>
                    <span>📅 {featuredBlog.date}</span>
                  </div>

                  <h2 className={styles.featuredTitle}>{featuredBlog.title}</h2>
                  <p className={styles.featuredExcerpt}>{featuredBlog.excerpt}</p>

                  <div className={styles.authorRow}>
                    <div className={styles.authorMeta}>
                      <div className={styles.authorAvatar}>
                        {featuredBlog.author ? featuredBlog.author[0] : 'B'}
                      </div>
                      <div>
                        <strong style={{ display: 'block', fontSize: '13.5px', color: '#FFFFFF' }}>
                          {featuredBlog.author}
                        </strong>
                        <span style={{ fontSize: '11.5px', color: '#A19A8E' }}>
                          {featuredBlog.authorRole || 'Lead Author'}
                        </span>
                      </div>
                    </div>

                    <div className={styles.readMoreBtn}>
                      <span>{isHi ? 'पूरा लेख पढ़ें' : 'Read Full Article'}</span>
                      <span>→</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3-Column Blog Grid */}
            <div className={styles.blogGrid}>
              {(activeCategory === 'All' && !searchQuery ? gridBlogs : filteredBlogs).map((item) => (
                <article key={item.id} className={styles.blogCard} onClick={() => handleOpenArticle(item)}>
                  <div className={styles.cardImageWrap}>
                    <img src={item.image} alt={item.title} className={styles.cardImage} loading="lazy" />
                    <div style={{ position: 'absolute', top: '14px', left: '14px' }}>
                      <span className={styles.categoryTag}>{item.category}</span>
                    </div>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.cardMeta} style={{ marginBottom: '10px' }}>
                      <span>⏱️ {item.readTime}</span>
                      <span>•</span>
                      <span>👁️ {item.views || 1}+ views</span>
                    </div>

                    <h3 className={styles.cardTitle}>{item.title}</h3>
                    <p className={styles.cardExcerpt}>{item.excerpt}</p>

                    <div className={styles.authorRow}>
                      <div className={styles.authorMeta}>
                        <div className={styles.authorAvatar} style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                          {item.author ? item.author[0] : 'B'}
                        </div>
                        <span style={{ fontSize: '12px', color: '#C2B7A3', fontWeight: '700' }}>
                          {item.author}
                        </span>
                      </div>

                      <span style={{ fontSize: '12.5px', color: '#E28B5C', fontWeight: '800' }}>
                        {isHi ? 'पढ़ें →' : 'Read →'}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
