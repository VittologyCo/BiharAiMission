import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import SEO from '../../components/SEO/SEO';
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

/**
 * Safe smooth scrolling helper that never throws on older mobile browsers
 */
const safeScrollToTop = () => {
  try {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  } catch (e) {
    try {
      window.scrollTo(0, 0);
    } catch (err) {
      /* no-op */
    }
  }
};

/**
 * Safe clipboard copy with fallback to execCommand for iOS Safari / Mobile WebViews
 */
const copyToClipboard = async (text) => {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) {
    // Fall back to document.execCommand
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    return !!successful;
  } catch (err) {
    return false;
  }
};

/**
 * Parse inline markdown tokens: **bold**, `code`, and [link](url)
 */
const renderInlineMarkdown = (text) => {
  if (!text || typeof text !== 'string') return '';
  const parts = text.split(/(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return <code key={i}>{part.slice(1, -1)}</code>;
    }
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      return (
        <a
          key={i}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#E28B5C', textDecoration: 'underline' }}
        >
          {linkMatch[1]}
        </a>
      );
    }
    return part;
  });
};

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
      try {
        const data = await fetchBlogsFromSupabase();
        if (isMounted) {
          setBlogs(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isMounted) {
          setBlogs([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
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

  // 2. Handle URL deep-linking for /blog/:blogId (SEO & Direct Link Sharing)
  useEffect(() => {
    if (blogId && blogs.length > 0) {
      const targetSlug = String(blogId).toLowerCase().trim();
      const found = blogs.find(
        (b) =>
          String(b.slug || '').toLowerCase().trim() === targetSlug ||
          String(b.id || '') === String(blogId)
      );
      if (found) {
        setActiveArticle(found);
        incrementBlogViews(found.id);
        safeScrollToTop();
      } else {
        setActiveArticle(null);
      }
    } else if (!blogId) {
      setActiveArticle(null);
    }
  }, [blogId, blogs]);

  // 3. Navigation handlers
  const handleOpenArticle = (item) => {
    if (!item) return;
    setActiveArticle(item);
    incrementBlogViews(item.id);
    navigate(`/blog/${item.slug || item.id}`, { replace: false });
    safeScrollToTop();
  };

  const handleBackToList = () => {
    setActiveArticle(null);
    navigate('/blog', { replace: false });
    safeScrollToTop();
  };

  // 4. Social Sharing Handlers (Safe against mobile clipboard and webview constraints)
  const handleShare = async (platform) => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://biharaimission.org/blog';
    const title = activeArticle?.title || 'Bihar AI Mission Insights';

    if (platform === 'whatsapp') {
      window.open(
        `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} — ${currentUrl}`)}`,
        '_blank',
        'noopener,noreferrer'
      );
    } else if (platform === 'twitter') {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(currentUrl)}`,
        '_blank',
        'noopener,noreferrer'
      );
    } else if (platform === 'linkedin') {
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
        '_blank',
        'noopener,noreferrer'
      );
    } else if (platform === 'copy') {
      const ok = await copyToClipboard(currentUrl);
      if (ok) {
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2500);
      }
    }
  };

  // 5. Filter & Search Logic with complete crash guards
  const filteredBlogs = useMemo(() => {
    if (!Array.isArray(blogs)) return [];
    return blogs.filter((b) => {
      if (!b || b.isPublished === false) return false;
      const matchesCategory = activeCategory === 'All' || b.category === activeCategory;
      const q = (searchQuery || '').toLowerCase().trim();
      if (!q) return matchesCategory;

      const titleMatch = typeof b.title === 'string' && b.title.toLowerCase().includes(q);
      const excerptMatch = typeof b.excerpt === 'string' && b.excerpt.toLowerCase().includes(q);
      const tagMatch =
        Array.isArray(b.tags) &&
        b.tags.some((t) => typeof t === 'string' && t.toLowerCase().includes(q));

      return matchesCategory && (titleMatch || excerptMatch || tagMatch);
    });
  }, [blogs, activeCategory, searchQuery]);

  const featuredBlog = filteredBlogs[0];
  const gridBlogs = filteredBlogs.slice(1);

  // Recommendations for bottom of full article view
  const relatedArticles = useMemo(() => {
    if (!activeArticle || !Array.isArray(blogs)) return [];
    return blogs
      .filter((b) => b && b.id !== activeArticle.id && b.isPublished !== false)
      .slice(0, 3);
  }, [blogs, activeArticle]);

  // JSON-LD Structured Data Schema for Search Engines & AEO (Perplexity/ChatGPT)
  const jsonLdSchema = useMemo(() => {
    if (activeArticle) {
      return {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: activeArticle.title || 'Bihar AI Mission Insight',
        image: activeArticle.image || 'https://biharaimission.org/bi_logo.png',
        datePublished: activeArticle.createdAt || activeArticle.date,
        author: {
          '@type': 'Person',
          name: activeArticle.author || 'Bihar AI Mission Editorial Desk'
        },
        description: activeArticle.excerpt || '',
        publisher: {
          '@type': 'Organization',
          name: 'Bihar AI Mission',
          url: 'https://biharaimission.org'
        }
      };
    }
    return {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'Bihar AI Mission Editorial & Insights',
      url: 'https://biharaimission.org/blog',
      description:
        'Authoritative articles, governance AI workflows, student learning tracks, and innovation blueprints for Bihar.',
      publisher: {
        '@type': 'Organization',
        name: 'Bihar AI Mission',
        url: 'https://biharaimission.org'
      }
    };
  }, [activeArticle]);

  /* ==========================================================================
     DEEP-LINK LOADING SKELETON (Prevents page flash/crash on direct mobile URL load)
     ========================================================================== */
  if (blogId && loading) {
    return (
      <div className={styles.fullArticlePage}>
        <div className={styles.articleMainWrap}>
          <div style={{ textAlign: 'center', padding: '100px 20px', color: '#E28B5C' }}>
            <div style={{ fontSize: '36px', marginBottom: '16px' }}>⚡</div>
            <h2 style={{ fontSize: '20px', color: '#FFFFFF', marginBottom: '8px' }}>
              {isHi ? 'लेख लोड हो रहा है...' : 'Loading Editorial Article...'}
            </h2>
            <p style={{ color: '#A19A8E', fontSize: '14px' }}>
              {isHi ? 'कृपया प्रतीक्षा करें...' : 'Fetching research data from Bihar AI Mission...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================================================
     DEEP-LINK 404 ARTICLE NOT FOUND VIEW
     ========================================================================== */
  if (blogId && !loading && !activeArticle) {
    return (
      <div className={styles.fullArticlePage}>
        <SEO
          title={isHi ? 'लेख नहीं मिला | बिहार AI मिशन' : 'Article Not Found | Bihar AI Mission'}
          description="The requested article could not be found on Bihar AI Mission."
        />
        <div className={styles.articleMainWrap} style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: '54px', marginBottom: '16px' }}>🔍</div>
          <h2 style={{ fontSize: '26px', color: '#FFFFFF', marginBottom: '12px' }}>
            {isHi ? 'लेख नहीं मिला' : 'Article Not Found'}
          </h2>
          <p style={{ color: '#A19A8E', fontSize: '15px', maxWidth: '440px', margin: '0 auto 28px' }}>
            {isHi
              ? 'यह लेख मौजूद नहीं है या हटा दिया गया है।'
              : 'The article you are looking for does not exist or may have been archived.'}
          </p>
          <button type="button" onClick={handleBackToList} className={styles.backBtn}>
            <span>←</span>
            <span>{isHi ? 'सभी लेखों पर वापस जाएं' : 'Back to all articles'}</span>
          </button>
        </div>
      </div>
    );
  }

  /* ==========================================================================
     FULL-PAGE EDITORIAL ARTICLE READING VIEW
     ========================================================================== */
  if (activeArticle) {
    const articleCanonical = `https://biharaimission.org/blog/${activeArticle.slug || activeArticle.id}`;

    return (
      <div className={styles.fullArticlePage}>
        <SEO
          title={`${activeArticle.title || 'Insight'} | Bihar AI Mission`}
          description={activeArticle.excerpt || 'Bihar AI Mission Editorial and Research insight.'}
          keywords={`${Array.isArray(activeArticle.tags) ? activeArticle.tags.join(', ') : ''}, Bihar AI Mission, AI Research`}
          canonical={articleCanonical}
          ogImage={activeArticle.image || 'https://biharaimission.org/bi_logo.png'}
          ogType="article"
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />

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
              <span>👁️ {activeArticle.views || 1}+ views</span>
            </div>
          </div>

          {/* Article Header (Title, Subtitle, Badges) */}
          <header className={styles.articleHeader}>
            <div className={styles.articleBadgeRow}>
              <span className={styles.categoryTag}>{activeArticle.category || 'Mission'}</span>
              {activeArticle.date && (
                <>
                  <span style={{ color: '#9CA3AF', fontSize: '13px' }}>•</span>
                  <span style={{ color: '#9CA3AF', fontSize: '13px' }}>📅 {activeArticle.date}</span>
                </>
              )}
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
                <button
                  type="button"
                  onClick={() => handleShare('whatsapp')}
                  className={styles.shareBtn}
                  title="Share on WhatsApp"
                >
                  💬 WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => handleShare('twitter')}
                  className={styles.shareBtn}
                  title="Share on X"
                >
                  𝕏 Post
                </button>
                <button
                  type="button"
                  onClick={() => handleShare('linkedin')}
                  className={styles.shareBtn}
                  title="Share on LinkedIn"
                >
                  💼 LinkedIn
                </button>
                <button
                  type="button"
                  onClick={() => handleShare('copy')}
                  className={styles.shareBtn}
                  title="Copy Link"
                >
                  {copiedUrl ? '✅ Copied!' : '🔗 Copy'}
                </button>
              </div>
            </div>
          </header>

          {/* Article Cover Image (Responsive & Contained) */}
          {activeArticle.image && (
            <div className={styles.articleCoverWrap}>
              <img
                src={activeArticle.image}
                alt={activeArticle.title || 'Cover image'}
                className={styles.articleCoverImg}
                loading="eager"
              />
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
              .replace(/\r\n/g, '\n')
              .split('\n\n')
              .map((paragraph, index) => {
                const trimmed = paragraph.trim();
                if (!trimmed) return null;

                if (trimmed.startsWith('#### ')) {
                  return (
                    <h4 key={index} className={styles.bodyH4}>
                      {renderInlineMarkdown(trimmed.replace('#### ', ''))}
                    </h4>
                  );
                }
                if (trimmed.startsWith('### ')) {
                  return (
                    <h3 key={index} className={styles.bodyH3}>
                      {renderInlineMarkdown(trimmed.replace('### ', ''))}
                    </h3>
                  );
                }
                if (trimmed.startsWith('## ')) {
                  return (
                    <h2 key={index} className={styles.bodyH2}>
                      {renderInlineMarkdown(trimmed.replace('## ', ''))}
                    </h2>
                  );
                }
                if (trimmed.startsWith('# ')) {
                  return (
                    <h2 key={index} className={styles.bodyH1}>
                      {renderInlineMarkdown(trimmed.replace('# ', ''))}
                    </h2>
                  );
                }
                if (trimmed.startsWith('> ')) {
                  return (
                    <blockquote key={index} className={styles.bodyBlockquote}>
                      {renderInlineMarkdown(trimmed.replace(/^>\s*/gm, ''))}
                    </blockquote>
                  );
                }
                if (trimmed.startsWith('```')) {
                  const cleanCode = trimmed.replace(/^```[a-z]*\n?/i, '').replace(/```$/, '');
                  return (
                    <pre key={index} className={styles.bodyCodeBlock}>
                      <code>{cleanCode}</code>
                    </pre>
                  );
                }
                if (trimmed === '---' || trimmed === '***') {
                  return <hr key={index} className={styles.bodyDivider} />;
                }
                if (
                  trimmed.startsWith('* ') ||
                  trimmed.startsWith('- ') ||
                  trimmed.startsWith('• ')
                ) {
                  const lines = trimmed.split('\n');
                  return (
                    <ul key={index} className={styles.bodyList}>
                      {lines.map((l, i) => (
                        <li key={i}>
                          {renderInlineMarkdown(l.replace(/^(\* |- |• )/, ''))}
                        </li>
                      ))}
                    </ul>
                  );
                }
                if (/^\d+\.\s/.test(trimmed)) {
                  const lines = trimmed.split('\n');
                  return (
                    <ol key={index} className={styles.bodyOrderedList}>
                      {lines.map((l, i) => (
                        <li key={i}>
                          {renderInlineMarkdown(l.replace(/^\d+\.\s*/, ''))}
                        </li>
                      ))}
                    </ol>
                  );
                }
                return (
                  <p key={index} className={styles.bodyParagraph}>
                    {renderInlineMarkdown(trimmed)}
                  </p>
                );
              })}
          </div>

          {/* Bottom Call-to-Action Banner */}
          <div className={styles.bottomActionBanner}>
            <div>
              <h4 className={styles.actionBannerTitle}>
                {isHi ? 'बिहार एआई मिशन से जुड़ें' : 'Join the Bihar AI Mission Movement'}
              </h4>
              <p className={styles.actionBannerText}>
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
              className={styles.actionBannerBtn}
            >
              <span>🚀</span>
              <span>{isHi ? 'शामिल हों' : 'Get Involved Today'}</span>
            </button>
          </div>

          {/* Related Articles Section */}
          {relatedArticles.length > 0 && (
            <div className={styles.relatedSection}>
              <h3 className={styles.relatedTitle}>
                {isHi ? 'संबंधित लेख पढ़ें' : 'More Insights & Articles'}
              </h3>
              <div className={styles.blogGrid}>
                {relatedArticles.map((item) => (
                  <article
                    key={item.id}
                    className={styles.blogCard}
                    onClick={() => handleOpenArticle(item)}
                  >
                    <div className={styles.cardImageWrap}>
                      <img
                        src={item.image}
                        alt={item.title || 'Related article'}
                        className={styles.cardImage}
                        loading="lazy"
                      />
                      <div className={styles.cardCategoryOverlay}>
                        <span className={styles.categoryTag}>{item.category}</span>
                      </div>
                    </div>
                    <div className={styles.cardBody}>
                      <h4 className={styles.cardTitle}>{item.title}</h4>
                      <p className={styles.cardExcerpt}>{item.excerpt}</p>
                      <span className={styles.readMoreLink}>
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
      <SEO
        title={isHi ? 'ब्लॉग एवं अनुसंधान | बिहार AI मिशन' : 'Insights & Research Blog | Bihar AI Mission'}
        description={
          isHi
            ? 'बिहार के 38 जिलों में कृत्रिम बुद्धिमत्ता, सुशासन टूल्स, युवा कौशल विकास और स्टार्टअप्स पर आधिकारिक शोध और लेख।'
            : 'Authoritative analysis, governance AI tutorials, student learning tracks, and agricultural technology blueprints powering Bihar’s 38 districts.'
        }
        canonical="https://biharaimission.org/blog"
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />

      <div className={styles.innerWrap}>
        {/* Hero Section */}
        <div className={styles.heroSection}>
          <div className={styles.badgePill}>
            <span>⚡</span>
            <span>{isHi ? 'बिहार एआई मिशन संपादकीय' : 'BIHAR AI MISSION EDITORIAL'}</span>
          </div>

          <h1 className={styles.pageTitle}>
            {isHi ? (
              <>
                ज्ञान, अनुसंधान एवं <span className={styles.titleHighlight}>एआई नवप्रवर्तन</span>
              </>
            ) : (
              <>
                Insights, Research & <span className={styles.titleHighlight}>AI Renaissance</span>
              </>
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
          <div
            style={{
              textAlign: 'center',
              padding: '80px 20px',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.07)'
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
            <h3 style={{ fontSize: '20px', color: '#FFFFFF', margin: '0 0 8px', fontWeight: '800' }}>
              {isHi ? 'कोई लेख उपलब्ध नहीं है' : 'No Articles Found'}
            </h3>
            <p style={{ color: '#A19A8E', fontSize: '14px', maxWidth: '460px', margin: '0 auto' }}>
              {searchQuery
                ? isHi
                  ? 'कृपया अलग कीवर्ड या श्रेणी चुनकर पुनः प्रयास करें।'
                  : 'Try adjusting your search terms or selecting another category.'
                : isHi
                ? 'व्यवस्थापक द्वारा नए लेख जोड़े जाने के बाद यहाँ प्रदर्शित होंगे।'
                : 'Articles published by the administrator will appear here.'}
            </p>
          </div>
        ) : (
          <>
            {/* Featured Spotlight Card */}
            {featuredBlog && activeCategory === 'All' && !searchQuery && (
              <div
                className={styles.featuredCard}
                onClick={() => handleOpenArticle(featuredBlog)}
              >
                <div className={styles.featuredImageWrap}>
                  <img
                    src={featuredBlog.image}
                    alt={featuredBlog.title || 'Spotlight article'}
                    className={styles.featuredImage}
                    loading="lazy"
                  />
                  <div className={styles.featuredBadge}>⭐ Spotlight Article</div>
                </div>

                <div className={styles.featuredBody}>
                  <div className={styles.cardMeta}>
                    <span className={styles.categoryTag}>{featuredBlog.category}</span>
                    {featuredBlog.readTime && (
                      <>
                        <span>•</span>
                        <span>⏱️ {featuredBlog.readTime}</span>
                      </>
                    )}
                    {featuredBlog.date && (
                      <>
                        <span>•</span>
                        <span>📅 {featuredBlog.date}</span>
                      </>
                    )}
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
                          {featuredBlog.author || 'Bihar AI Mission'}
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

            {/* Responsive Blog Grid */}
            <div className={styles.blogGrid}>
              {(activeCategory === 'All' && !searchQuery ? gridBlogs : filteredBlogs).map((item) => (
                <article
                  key={item.id}
                  className={styles.blogCard}
                  onClick={() => handleOpenArticle(item)}
                >
                  <div className={styles.cardImageWrap}>
                    <img
                      src={item.image}
                      alt={item.title || 'Article image'}
                      className={styles.cardImage}
                      loading="lazy"
                    />
                    <div className={styles.cardCategoryOverlay}>
                      <span className={styles.categoryTag}>{item.category}</span>
                    </div>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.cardMeta} style={{ marginBottom: '10px' }}>
                      {item.readTime && <span>⏱️ {item.readTime}</span>}
                      {item.readTime && <span>•</span>}
                      <span>👁️ {item.views || 1}+ views</span>
                    </div>

                    <h3 className={styles.cardTitle}>{item.title}</h3>
                    <p className={styles.cardExcerpt}>{item.excerpt}</p>

                    <div className={styles.authorRow}>
                      <div className={styles.authorMeta}>
                        <div
                          className={styles.authorAvatar}
                          style={{ width: '32px', height: '32px', fontSize: '12px' }}
                        >
                          {item.author ? item.author[0] : 'B'}
                        </div>
                        <span style={{ fontSize: '12px', color: '#C2B7A3', fontWeight: '700' }}>
                          {item.author || 'Contributor'}
                        </span>
                      </div>

                      <span className={styles.readMoreLink}>
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
