// Local dev proxy for /api/send-email
// Calls Resend API server-side to bypass browser CORS restrictions
// This file is auto-loaded by CRA's dev server on startup (react-scripts)

const https = require('https');

module.exports = function (app) {
  // Parse JSON bodies for our route
  app.use('/api/send-email', (req, res, next) => {
    if (req.method !== 'POST') return next();
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        req.body = JSON.parse(body);
      } catch (e) {
        req.body = {};
      }
      next();
    });
  });

  app.post('/api/send-email', (req, res) => {
    const { from, to, subject, html } = req.body || {};

    const apiKey = process.env.RESEND_API_KEY || process.env.REACT_APP_RESEND_API_KEY;
    if (!apiKey) {
      console.error('❌ [Dev Proxy] RESEND_API_KEY not found in .env');
      return res.status(500).json({ error: 'RESEND_API_KEY not set' });
    }

    const postData = JSON.stringify({
      from: from || 'Bihar AI Mission <onboarding@biharaimission.org>',
      to: Array.isArray(to) ? to : [to],
      subject: subject || 'Bihar AI Mission',
      html: html || '',
    });

    console.log(`📧 [Dev Proxy] Sending email to ${to} via Resend...`);

    const options = {
      hostname: 'api.resend.com',
      port: 443,
      path: '/emails',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const proxyReq = https.request(options, (proxyRes) => {
      let responseBody = '';
      proxyRes.on('data', chunk => { responseBody += chunk; });
      proxyRes.on('end', () => {
        try {
          const data = JSON.parse(responseBody);
          if (proxyRes.statusCode >= 200 && proxyRes.statusCode < 300) {
            console.log('✅ [Dev Proxy] Email sent successfully:', data);
            res.status(200).json({ success: true, data });
          } else {
            console.warn('⚠️ [Dev Proxy] Resend error:', data);
            res.status(proxyRes.statusCode).json({ success: false, error: data });
          }
        } catch (e) {
          console.error('❌ [Dev Proxy] Parse error:', e.message);
          res.status(500).json({ error: 'Failed to parse Resend response' });
        }
      });
    });

    proxyReq.on('error', (err) => {
      console.error('❌ [Dev Proxy] Request error:', err.message);
      res.status(500).json({ error: err.message });
    });

    proxyReq.write(postData);
    proxyReq.end();
  });

  console.log('📧 [Dev Proxy] /api/send-email proxy registered for Resend API');
};
