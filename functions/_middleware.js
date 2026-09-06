/**
 * Cloudflare Pages Edge Middleware for Bihar AI Mission (biharaimission.org)
 * 
 * Features:
 * 1. Canonical HTTPS & Apex Domain Enforcement (301 Permanent Redirect)
 * 2. Accept-Markdown Content Negotiation (acceptmarkdown.com) with Vary: Accept, Accept-Encoding
 * 3. Agent-friendly real HTTP 404 handling (Never soft-200, Never 500)
 * 4. Dedicated pre-rendered trust anchor routing (/about, /contact, /privacy)
 * 5. Strict security and cache headers
 */

export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);

  // 1. Canonical HTTPS & Apex Domain Enforcement (301 Permanent Redirect)
  const isLocal = url.hostname.includes('localhost') || url.hostname.includes('127.0.0.1');
  if (!isLocal && (url.protocol === 'http:' || url.hostname.startsWith('www.'))) {
    url.protocol = 'https:';
    if (url.hostname.startsWith('www.')) {
      url.hostname = url.hostname.replace(/^www\./, '');
    }
    return Response.redirect(url.toString(), 301);
  }

  // 2. Accept-Markdown Content Negotiation (acceptmarkdown.com)
  const acceptHeader = (request.headers.get('accept') || '').toLowerCase();
  const userAgent = (request.headers.get('user-agent') || '').toLowerCase();
  const wantsMarkdown = acceptHeader.includes('text/markdown') || acceptHeader.includes('text/x-markdown');
  const isAiAgent =
    wantsMarkdown ||
    userAgent.includes('is-agentic') ||
    userAgent.includes('ora/') ||
    userAgent.includes('gptbot') ||
    userAgent.includes('claudebot') ||
    userAgent.includes('perplexitybot') ||
    userAgent.includes('curl/');

  const cleanPath = url.pathname.replace(/\/+$/, '') || '/';

  // Whitelist of known SPA routes
  const KNOWN_SPA_ROUTES = new Set([
    '/',
    '/learning',
    '/tools',
    '/policy',
    '/privacy',
    '/contact',
    '/about',
    '/blog',
    '/startups',
    '/profile',
    '/reset-password',
    '/experience',
    '/submission',
    '/admin',
    '/admin/login',
    '/admin/dashboard',
  ]);

  const isKnown =
    KNOWN_SPA_ROUTES.has(cleanPath) ||
    cleanPath.startsWith('/blog/') ||
    cleanPath.startsWith('/course/') ||
    cleanPath.startsWith('/program/') ||
    cleanPath.startsWith('/exam/') ||
    cleanPath.startsWith('/submission/') ||
    cleanPath.startsWith('/experience/') ||
    cleanPath.startsWith('/admin/');

  // Handle Accept: text/markdown negotiation
  if (wantsMarkdown && request.method === 'GET' && !cleanPath.startsWith('/api/')) {
    let mdAsset = '/llms.txt';
    if (cleanPath === '/about' || cleanPath === '/learning' || cleanPath === '/tools') {
      mdAsset = '/llms.md';
    } else if (cleanPath === '/contact') {
      mdAsset = '/agent-instructions.md';
    } else if (cleanPath === '/privacy' || cleanPath === '/policy') {
      mdAsset = '/llms.md';
    }

    let markdownBody = '';
    if (env && env.ASSETS) {
      try {
        const assetRes = await env.ASSETS.fetch(new Request(new URL(mdAsset, url.origin).toString()));
        if (assetRes && assetRes.ok) {
          markdownBody = await assetRes.text();
        }
      } catch (e) {
        // fallback
      }
    }

    if (!markdownBody) {
      markdownBody = [
        '# Bihar AI Mission (बिहार AI मिशन)',
        '',
        'Official AI Literacy and Digital Certification Platform for Bihar.',
        '- **Website**: https://biharaimission.org',
        '- **Agent Guide**: https://biharaimission.org/llms.txt',
        '- **Comprehensive Operational Guide**: https://biharaimission.org/llms.md',
        '- **Agent Instructions**: https://biharaimission.org/agent-instructions.md',
        '- **Official Secretariat Contact**: contact@biharaimission.org | +91-612-2215000',
        '- **Location**: Bailey Road, Technology Corridor, Patna, Bihar — 800001, India',
      ].join('\n');
    }

    return new Response(markdownBody, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Vary': 'Accept, Accept-Encoding',
        'Cache-Control': 'no-cache, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  // 3. Known SPA routes: rewrite to /index.html (or dedicated pre-rendered HTML)
  if (isKnown && request.method === 'GET') {
    let targetHtml = '/index.html';
    if (cleanPath === '/about') targetHtml = '/about/index.html';
    else if (cleanPath === '/contact') targetHtml = '/contact/index.html';
    else if (cleanPath === '/privacy' || cleanPath === '/policy') targetHtml = '/privacy/index.html';

    const rewriteUrl = new URL(targetHtml, request.url);
    const rewriteReq = new Request(rewriteUrl.toString(), request);

    let spaResponse = null;
    try {
      spaResponse = await next(rewriteReq);
    } catch (e) {
      spaResponse = null;
    }

    if ((!spaResponse || !spaResponse.ok) && env && env.ASSETS) {
      try {
        spaResponse = await env.ASSETS.fetch(rewriteReq);
      } catch (e) {
        spaResponse = null;
      }
    }

    if (spaResponse && spaResponse.ok) {
      const spaHeaders = new Headers(spaResponse.headers);
      spaHeaders.set('Content-Type', 'text/html; charset=utf-8');
      spaHeaders.set('Vary', 'Accept, Accept-Encoding');
      spaHeaders.set('Cache-Control', 'no-cache, must-revalidate');
      spaHeaders.set('X-Content-Type-Options', 'nosniff');
      spaHeaders.set('X-Frame-Options', 'SAMEORIGIN');
      return new Response(spaResponse.body, {
        status: 200,
        headers: spaHeaders,
      });
    }
  }

  // 4. Process the next handler / static asset (e.g. .js, .css, images, media)
  let response;
  try {
    response = await next();
  } catch (err) {
    response = new Response('Server Error', { status: 500 });
  }

  // 5. Handle 404s for truly unknown routes -> Real HTTP 404 (NEVER soft-200!)
  if (response.status === 404 && request.method === 'GET') {
    const notFoundHeaders = new Headers();
    notFoundHeaders.set('Vary', 'Accept, Accept-Encoding');
    notFoundHeaders.set('X-Content-Type-Options', 'nosniff');
    notFoundHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate');

    if (wantsMarkdown || isAiAgent) {
      notFoundHeaders.set('Content-Type', 'text/markdown; charset=utf-8');
      const md404 = [
        '# 404 Not Found — Bihar AI Mission',
        '',
        `The requested resource \`${url.pathname}\` does not exist on this server.`,
        '',
        '## Agent & Machine Guidance',
        '- **Agent Instructions**: https://biharaimission.org/agent-instructions.md',
        '- **Machine-Readable Index**: https://biharaimission.org/llms.txt',
        '- **Curriculum & Operational Guide**: https://biharaimission.org/llms.md',
        '- **XML Sitemap**: https://biharaimission.org/sitemap.xml',
        '- **Official Homepage**: https://biharaimission.org/',
        '- **About Desk**: https://biharaimission.org/about',
        '- **Contact Desk**: https://biharaimission.org/contact',
        '- **Privacy Policy**: https://biharaimission.org/privacy',
        '',
        '*Status: 404 Not Found — biharaimission.org*'
      ].join('\n');

      return new Response(md404, {
        status: 404,
        statusText: 'Not Found',
        headers: notFoundHeaders,
      });
    }

    notFoundHeaders.set('Content-Type', 'text/html; charset=utf-8');
    const html404 = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>404 Not Found — Bihar AI Mission</title><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="font-family:sans-serif;background:#181512;color:#f0ece1;padding:2rem;text-align:center"><h1>404 — Page Not Found</h1><p>The requested page <code>${url.pathname}</code> does not exist.</p><p><a href="/" style="color:#f5af87">Return to Bihar AI Mission Homepage &rarr;</a></p></body></html>`;

    return new Response(html404, {
      status: 404,
      statusText: 'Not Found',
      headers: notFoundHeaders,
    });
  }

  // 5. Ensure Vary: Accept, Accept-Encoding and security headers are present on all responses
  const finalHeaders = new Headers(response.headers);
  finalHeaders.set('Vary', 'Accept, Accept-Encoding');
  finalHeaders.set('X-Content-Type-Options', 'nosniff');

  if (url.pathname.endsWith('.md') || url.pathname.endsWith('.txt')) {
    finalHeaders.set('Content-Type', 'text/markdown; charset=utf-8');
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: finalHeaders,
  });
}
