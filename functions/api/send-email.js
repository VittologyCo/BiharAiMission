/**
 * Cloudflare Pages Function: /api/send-email
 * Server-to-server dispatch to Resend API (No CORS issues)
 */
export async function onRequest(context) {
  const { request, env } = context;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response('OK', {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    const body = await request.json();
    const { to, subject, html, from } = body;

    if (!to || !subject || !html) {
      return new Response(JSON.stringify({ error: 'Missing required email fields (to, subject, html)' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const defaultKey = typeof atob === 'function' ? atob('cmVfVXdLdFVLWURfQVhyUERmckRVcXNNYVE1ckF1N1BFUFdC') : '';
    const apiKey =
      env?.RESEND_API_KEY ||
      env?.REACT_APP_RESEND_API_KEY ||
      env?.REACT_APP_RESEND_API_KI ||
      defaultKey;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY is not configured' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const sender =
      from ||
      env?.RESEND_FROM_EMAIL ||
      env?.REACT_APP_RESEND_FROM_EMAIL ||
      env?.REACT_APP_RESEND_FROM ||
      'Bihar AI Mission <onboarding@biharaimission.org>';

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: sender,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
      }),
    });

    const resendData = await resendResponse.json();

    return new Response(JSON.stringify(resendData), {
      status: resendResponse.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
