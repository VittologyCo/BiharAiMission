// Resend Email Utility for Sending Emails directly via API (No Docker/Edge Functions needed)

export const sendContactEmailViaResend = async ({ name, email, description }) => {
  const apiKey = process.env.REACT_APP_RESEND_API_KEY || '';

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'Bihar AI Mission <onboarding@resend.dev>',
        to: ['contact@biharaimission.org'],
        reply_to: email,
        subject: `📩 New Website Contact Inquiry from ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 24px; color: #111827; max-width: 600px; border: 2px solid #000000; border-radius: 16px; background: #EFEAE5;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px; border-bottom: 2px solid var(--color-sand-100, #F3ECE0); padding-bottom: 12px;">
              <h2 style="color: #000000; margin: 0; font-size: 20px;">📩 New Contact Us Inquiry Received</h2>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; font-size: 14.5px; margin-bottom: 20px;">
              <tr>
                <td style="padding: 8px 0; color: var(--color-ink-muted, #5E554D); width: 120px; font-weight: bold;">Name:</td>
                <td style="padding: 8px 0; color: #111827; font-weight: bold;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: var(--color-ink-muted, #5E554D); font-weight: bold;">Email:</td>
                <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: var(--color-terracotta-500, #C1552C); font-weight: bold;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: var(--color-ink-muted, #5E554D); font-weight: bold;">Submitted At:</td>
                <td style="padding: 8px 0; color: #9CA3AF;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</td>
              </tr>
            </table>

            <p style="font-size: 14px; font-weight: bold; color: #111827; margin-bottom: 6px;">Description / Inquiry Details:</p>
            <div style="background: #EFEAE5; border-left: 4px solid var(--color-terracotta-500, #C1552C); padding: 16px; border-radius: 6px; font-size: 14px; color: var(--color-ink-muted, #5E554D); line-height: 1.6; white-space: pre-wrap;">${description}</div>
            
            <hr style="border: none; border-top: 1px solid var(--color-line, #E2D7C3); margin: 24px 0 16px 0;" />
            <p style="font-size: 12px; color: var(--color-text-muted-on-dark, #C8BFB3); margin: 0; text-align: center;">
              Sent via official website contact desk · <strong>Bihar AI Mission</strong>
            </p>
          </div>
        `,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.warn('Resend API returned status:', response.status, data);
    }
    return { success: response.ok, data };
  } catch (error) {
    console.error('Error sending email via Resend API:', error);
    return { success: false, error };
  }
};

export const sendWelcomeEmailViaResend = async ({ fullName, email }) => {
  const apiKey = process.env.REACT_APP_RESEND_API_KEY || '';

  const sendViaProxy = async (senderEmail) => {
    const payload = {
      from: `Bihar AI Mission <${senderEmail}>`,
      to: [email],
      subject: 'Thank you for joining Bihar AI Mission 🚀',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eef2fb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="background: #000000; padding: 32px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 800;">Welcome to the Mission!</h1>
            <p style="margin: 6px 0 0 0; font-size: 13px; color: var(--color-sand-100, #F3ECE0);">Bihar AI Mission · Official Civic AI Initiative</p>
          </div>
          <div style="padding: 32px; color: #1a2232; line-height: 1.8; text-align: left;">
            <h2 style="color: #000000; font-size: 18px; margin-top: 0;">Dear ${fullName},</h2>
            <p>Thank you for creating your account with the <strong>Bihar AI Mission</strong>. We are thrilled to have you as part of our growing community dedicated to democratizing AI across Bihar.</p>
            <div style="margin: 28px 0; padding: 20px; background: #f0f7ff; border-left: 4px solid #000000; border-radius: 6px; color: #000000; font-weight: 500;">
              Your account has been successfully created. You can now access our AI learning tools, interactive courses, masterclasses, and certifications.
            </div>
            <p style="font-size: 14px; color: #5a6478;">Feel free to explore our training modules, prompt libraries, and AI tools on our platform.</p>
            <hr style="border: none; border-top: 1px solid #dde1ea; margin: 28px 0;" />
            <p style="font-size: 12px; color: #8993a6; text-align: center; margin: 0;">
              Bihar AI Mission · A civic AI initiative<br/>
              Patna, Bihar, India
            </p>
          </div>
        </div>
      `,
    };

    // Direct fetch attempt
    try {
      const directRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });
      if (directRes.ok) return true;
    } catch (e) {}

    // Proxy Attempt A: AllOrigins Raw
    try {
      const p1 = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent('https://api.resend.com/emails')}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });
      if (p1.ok) return true;
    } catch (e) {}

    // Proxy Attempt B: CorsProxy IO
    try {
      const p2 = await fetch(`https://corsproxy.io/?${encodeURIComponent('https://api.resend.com/emails')}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });
      if (p2.ok) return true;
    } catch (e) {}

    return false;
  };

  try {
    let sent = await sendViaProxy('onboarding@resend.dev');
    if (!sent) {
      sent = await sendViaProxy('contact@biharaimission.org');
    }
    return { success: sent };
  } catch (error) {
    console.error('Error sending welcome email via Resend API:', error);
    return { success: false, error };
  }
};
