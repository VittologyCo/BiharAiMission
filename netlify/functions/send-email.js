exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: 'OK',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { to, subject, html, from } = JSON.parse(event.body || '{}');

    if (!to || !subject || !html) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required email fields (to, subject, html)' }),
      };
    }

    const apiKey = process.env.RESEND_API_KEY || process.env.REACT_APP_RESEND_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'RESEND_API_KEY environment variable not configured' }),
      };
    }

    // Try primary sender, then fallback to onboarding
    const senderEmail = from || 'Bihar AI Mission <onboarding@resend.dev>';

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: senderEmail,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
      }),
    });

    const data = await resendResponse.json();

    return {
      statusCode: resendResponse.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Netlify function send-email error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: error.message || 'Internal Server Error' }),
    };
  }
};
