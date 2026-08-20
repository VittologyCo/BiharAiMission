const https = require('https');

exports.handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: 'OK',
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { to, subject, html, from } = JSON.parse(event.body || '{}');

    if (!to || !subject || !html) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
    }

    const apiKey = process.env.RESEND_API_KEY || process.env.REACT_APP_RESEND_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: 'RESEND_API_KEY or REACT_APP_RESEND_API_KEY not configured in Netlify env' }) };
    }

    const senderEmail = from || process.env.RESEND_FROM_EMAIL || process.env.REACT_APP_RESEND_FROM_EMAIL || 'Bihar AI Mission <onboarding@resend.dev>';
    const requestBody = JSON.stringify({
      from: senderEmail,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    // Use Node.js native https module (guaranteed available in all Netlify runtimes)
    const resendData = await new Promise((resolve, reject) => {
      const req = https.request(
        {
          hostname: 'api.resend.com',
          path: '/emails',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'Content-Length': Buffer.byteLength(requestBody),
          },
        },
        (res) => {
          let body = '';
          res.on('data', (chunk) => (body += chunk));
          res.on('end', () => {
            try {
              resolve({ statusCode: res.statusCode, data: JSON.parse(body) });
            } catch (e) {
              resolve({ statusCode: res.statusCode, data: { raw: body } });
            }
          });
        }
      );
      req.on('error', reject);
      req.write(requestBody);
      req.end();
    });

    return {
      statusCode: resendData.statusCode,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(resendData.data),
    };
  } catch (error) {
    console.error('send-email function error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message || 'Internal Server Error' }),
    };
  }
};
