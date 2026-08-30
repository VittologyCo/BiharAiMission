// Resend Email Utility for Sending Emails via Serverless Function / Direct API

const getDefaultSender = () => {
  return process.env.REACT_APP_RESEND_FROM_EMAIL || 'Bihar AI Mission <onboarding@resend.dev>';
};

const sendEmailPayload = async (payload) => {
  const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  const finalPayload = {
    ...payload,
    from: payload.from || getDefaultSender(),
  };

  // 1. Primary Strategy: Call Serverless Function (/api/send-email on Cloudflare, /.netlify/functions/send-email on Netlify)
  const endpoints = [
    '/api/send-email',
    '/.netlify/functions/send-email'
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalPayload),
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        console.log(`✅ Email delivered via serverless function (${ep}):`, data);
        return { success: true, data };
      }
    } catch (e) {
      // Endpoint not available or network error, continue to next
    }
  }

  // 2. In local development without a running serverless backend, simulate success
  if (isLocal) {
    console.info(`ℹ️ [Local Dev] Email queued/simulated for ${finalPayload.to}: "${finalPayload.subject}"`);
    return { success: true, simulated: true };
  }

  return { success: false, reason: 'Email serverless function unavailable or returned non-200' };
};

export const sendContactEmailViaResend = async ({ name, email, description }) => {
  const payload = {
    from: getDefaultSender(),
    to: ['contact@biharaimission.org'],
    reply_to: email,
    subject: `📩 New Website Contact Inquiry from ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #111827; max-width: 600px; border: 2px solid #000000; border-radius: 16px; background: #EFEAE5;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px; border-bottom: 2px solid #F3ECE0; padding-bottom: 12px;">
          <h2 style="color: #000000; margin: 0; font-size: 20px;">📩 New Contact Us Inquiry Received</h2>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 14.5px; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px 0; color: #5E554D; width: 120px; font-weight: bold;">Name:</td>
            <td style="padding: 8px 0; color: #111827; font-weight: bold;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #5E554D; font-weight: bold;">Email:</td>
            <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #C1552C; font-weight: bold;">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #5E554D; font-weight: bold;">Submitted At:</td>
            <td style="padding: 8px 0; color: #9CA3AF;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</td>
          </tr>
        </table>
        <p style="font-size: 14px; font-weight: bold; color: #111827; margin-bottom: 6px;">Description / Inquiry Details:</p>
        <div style="background: #EFEAE5; border-left: 4px solid #C1552C; padding: 16px; border-radius: 6px; font-size: 14px; color: #5E554D; line-height: 1.6; white-space: pre-wrap;">${description}</div>
        <hr style="border: none; border-top: 1px solid #E2D7C3; margin: 24px 0 16px 0;" />
        <p style="font-size: 12px; color: #C8BFB3; margin: 0; text-align: center;">
          Sent via official website contact desk · <strong>Bihar AI Mission</strong>
        </p>
      </div>
    `,
  };

  return await sendEmailPayload(payload);
};

export const sendWelcomeEmailViaResend = async ({ fullName, email }) => {
  const payload = {
    from: getDefaultSender(),
    to: [email],
    subject: 'Thank you for joining Bihar AI Mission 🚀',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eef2fb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="background: #000000; padding: 32px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 800;">Welcome to the Mission!</h1>
          <p style="margin: 6px 0 0 0; font-size: 13px; color: #F3ECE0;">Bihar AI Mission · Official Civic AI Initiative</p>
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

  return await sendEmailPayload(payload);
};

export const sendRegistrationThankYouEmail = async ({
  fullName,
  email,
  roleType = '',
  state = 'Bihar',
  district = '',
  intent = '',
}) => {
  const payload = {
    from: getDefaultSender(),
    to: [email],
    subject: `🎉 Registration Confirmed — Welcome to Bihar AI Mission, ${fullName}!`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #E2D7C3; border-radius: 16px; overflow: hidden; background: #FAF7F2; box-shadow: 0 8px 30px rgba(0,0,0,0.08);">
        <!-- Header -->
        <div style="background: #181512; padding: 36px 28px; text-align: center; color: #FFFFFF;">
          <div style="display: inline-block; background: rgba(217, 155, 38, 0.18); border: 1px solid rgba(217, 155, 38, 0.4); color: #FBE6A2; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; padding: 4px 14px; border-radius: 9999px; margin-bottom: 12px;">
            BIHAR AI MISSION · A CIVIC AI INITIATIVE
          </div>
          <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #FFFFFF; font-family: Georgia, serif;">
            Registration Confirmed! 🎉
          </h1>
          <p style="margin: 8px 0 0 0; font-size: 14px; color: #C8BFB3;">
            Empowering Bihar with AI Literacy & Technological Opportunity
          </p>
        </div>

        <!-- Main Body -->
        <div style="padding: 32px 28px; color: #181512; line-height: 1.7; text-align: left;">
          <h2 style="font-size: 19px; color: #181512; margin-top: 0; font-weight: 700;">
            Dear ${fullName},
          </h2>
          <p style="font-size: 14.5px; color: #4A4036; margin-bottom: 20px;">
            Thank you for registering with the <strong>Bihar AI Mission</strong>. Your profile has been recorded in our official registry. We are delighted to welcome you into our community of officers, students, researchers, and innovators shaping Bihar's digital future.
          </p>

          <!-- Details Card -->
          <div style="background: #FFFFFF; border: 1px solid #E2D7C3; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <div style="font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #C1552C; margin-bottom: 12px; border-bottom: 1px solid #F0E8DC; padding-bottom: 6px;">
              📋 Your Registered Profile Summary
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 13.5px; color: #2D241E;">
              <tr>
                <td style="padding: 6px 0; font-weight: 600; width: 120px; color: #73675C;">Full Name:</td>
                <td style="padding: 6px 0; font-weight: 700; color: #181512;">${fullName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: 600; color: #73675C;">Email:</td>
                <td style="padding: 6px 0; font-weight: 700; color: #C1552C;">${email}</td>
              </tr>
              ${roleType ? `<tr><td style="padding: 6px 0; font-weight: 600; color: #73675C;">Role Category:</td><td style="padding: 6px 0;">${roleType}</td></tr>` : ''}
              ${district || state ? `<tr><td style="padding: 6px 0; font-weight: 600; color: #73675C;">Location:</td><td style="padding: 6px 0;">${district ? district + ', ' : ''}${state || 'Bihar'}</td></tr>` : ''}
              ${intent ? `<tr><td style="padding: 6px 0; font-weight: 600; color: #73675C;">Primary Goal:</td><td style="padding: 6px 0;">${intent}</td></tr>` : ''}
            </table>
          </div>

          <!-- What's Next -->
          <div style="background: rgba(217, 155, 38, 0.08); border-left: 4px solid #D99B26; padding: 16px 20px; border-radius: 8px; margin-bottom: 24px;">
            <div style="font-size: 13.5px; font-weight: 700; color: #181512; margin-bottom: 4px;">
              ✨ What Happens Next?
            </div>
            <p style="font-size: 13px; color: #5E554D; margin: 0; line-height: 1.6;">
              You will receive priority invitations for upcoming Level 1 Masterclasses, District-level AI workshops, verifiable digital certifications, and exclusive prompt engineering libraries.
            </p>
          </div>

          <!-- Action Button -->
          <div style="text-align: center; margin: 32px 0 16px;">
            <a href="https://biharaimission.org/tools" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #C1552C 0%, #A3411B 100%); color: #FFFFFF; text-decoration: none; padding: 13px 32px; font-size: 14px; font-weight: 700; border-radius: 10px; box-shadow: 0 4px 14px rgba(193, 85, 44, 0.35);">
              Explore Ready AI Tools & Commands →
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #E2D7C3; margin: 32px 0 20px;" />

          <p style="font-size: 12px; color: #8A7E72; text-align: center; margin: 0; line-height: 1.6;">
            <strong>Bihar AI Mission</strong> · A Citizen-Led Civic AI Initiative<br/>
            Aligned with IndiaAI Mission · Patna, Bihar, India<br/>
            <a href="https://biharaimission.org" style="color: #C1552C; text-decoration: none;">biharaimission.org</a>
          </p>
        </div>
      </div>
    `,
  };

  return await sendEmailPayload(payload);
};
