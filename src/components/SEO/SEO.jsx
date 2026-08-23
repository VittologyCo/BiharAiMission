import { useEffect } from 'react';

const DEFAULT_SEO = {
  title: 'Bihar AI Mission — Official AI Training & Certification Platform | बिहार AI मिशन',
  description: 'Bihar AI Mission (बिहार AI मिशन) is Bihar\'s official AI literacy and certification platform. Get AI Fundamentals Level 1 training, earn QR-verifiable certificates (BAIM-CERT), access 50+ prompt templates, governance AI tools, and Bihar officer training programs at biharaimission.org.',
  keywords: 'Bihar AI Mission, बिहार AI मिशन, Bihar AI, Bihar Artificial Intelligence, Bihar AI Certificate, Bihar AI Training, Bihar AI Masterclass, Bihar AI Certification, Bihar AI Platform, Bihar AI Learning Hub, Bihar Government AI, AI for Bihar Officers, Bihar AI Exam, biharaimission.org, AI Literacy Bihar, AI Mission Bihar, Bihar Digital AI, Bihar AI Program, AI Officer Training Bihar, Prompt Engineering Bihar',
  canonical: 'https://biharaimission.org',
  ogImage: 'https://biharaimission.org/bi_logo.png',
  ogType: 'website',
  ogLocale: 'en_IN',
  siteName: 'Bihar AI Mission (बिहार AI मिशन)',
  twitterCard: 'summary_large_image',
};


export default function SEO({
  title = DEFAULT_SEO.title,
  description = DEFAULT_SEO.description,
  keywords = DEFAULT_SEO.keywords,
  canonical,
  ogImage = DEFAULT_SEO.ogImage,
  ogType = DEFAULT_SEO.ogType,
  schema = null,
}) {
  useEffect(() => {
    // 1. Update Title
    document.title = title;

    // Helper to update or create meta tags
    const setMetaTag = (selector, attributeName, attributeValue, content) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper to update or create link tags (e.g. canonical)
    const setLinkTag = (rel, href) => {
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    const currentUrl = canonical || window.location.href;

    // 2. Standard Meta Tags
    setMetaTag('meta[name="description"]', 'name', 'description', description);
    setMetaTag('meta[name="keywords"]', 'name', 'keywords', keywords);
    setMetaTag('meta[name="robots"]', 'name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    setMetaTag('meta[name="author"]', 'name', 'author', 'Bihar AI Mission');

    // 3. OpenGraph Meta Tags (Facebook, WhatsApp, LinkedIn)
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', title);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', ogType);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', currentUrl);
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', ogImage);
    setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', DEFAULT_SEO.siteName);
    setMetaTag('meta[property="og:locale"]', 'property', 'og:locale', DEFAULT_SEO.ogLocale);

    // 4. Twitter Card Meta Tags
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', DEFAULT_SEO.twitterCard);
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', ogImage);

    // 5. Canonical Link
    setLinkTag('canonical', currentUrl);

    // 6. Generative AI / AEO Structured JSON-LD Schema Injection
    const scriptId = 'dynamic-seo-jsonld';
    let scriptElement = document.getElementById(scriptId);

    if (schema) {
      if (!scriptElement) {
        scriptElement = document.createElement('script');
        scriptElement.id = scriptId;
        scriptElement.type = 'application/ld+json';
        document.head.appendChild(scriptElement);
      }
      scriptElement.textContent = JSON.stringify(schema);
    } else if (scriptElement) {
      scriptElement.remove();
    }

    return () => {
      // Cleanup on unmount if needed
    };
  }, [title, description, keywords, canonical, ogImage, ogType, schema]);

  return null;
}
