// Resend Email Utility for Sending Emails via Serverless Function / Direct API

const getDefaultSender = () => {
  return process.env.REACT_APP_RESEND_FROM_EMAIL || 'Bihar AI Mission <onboarding@biharaimission.org>';
};

const sendEmailPayload = async (payload) => {
  const finalPayload = {
    ...payload,
    from: payload.from || getDefaultSender(),
  };

  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalPayload),
    });

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return { success: true, data };
    }

    const err = await res.json().catch(() => ({}));
    return {
      success: false,
      reason: err?.error || `Email service responded with status ${res.status}`,
    };
  } catch (e) {
    return { success: false, reason: e?.message || 'Network connection error' };
  }
};

export const sendContactEmailViaResend = async ({ name, email, description }) => {
  const refId = Date.now().toString(36).toUpperCase();
  const submittedTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';
  const payload = {
    from: getDefaultSender(),
    to: ['vittologyconsultants@gmail.com'],
    reply_to: email,
    subject: `[Inquiry #${refId}] New Message from ${name} — Bihar AI Mission`,
    text: `New Website Contact Inquiry Received [#${refId}]\n\nName: ${name}\nEmail: ${email}\nDate: ${submittedTime}\nReference: ${refId}\n\nMessage / Inquiry:\n${description}\n\n--\nSent via official website contact desk · Bihar AI Mission`,
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

export const sendPasswordResetEmailViaResend = async ({
  email,
  resetUrl,
}) => {
  const payload = {
    from: getDefaultSender(),
    to: [email],
    subject: '🔐 Reset Your Password — Bihar AI Mission',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E2D7C3; border-radius: 16px; overflow: hidden; background: #FAF7F2; box-shadow: 0 8px 30px rgba(0,0,0,0.08);">
        <div style="background: #181512; padding: 32px 24px; text-align: center; color: #FFFFFF;">
          <div style="display: inline-block; background: rgba(226, 139, 92, 0.15); border: 1px solid rgba(226, 139, 92, 0.3); color: #E28B5C; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; padding: 4px 12px; border-radius: 9999px; margin-bottom: 12px;">
            BIHAR AI MISSION · CIVIC AUTH
          </div>
          <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #FFFFFF; font-family: Georgia, serif;">
            Password Reset Request 🔐
          </h1>
          <p style="margin: 6px 0 0 0; font-size: 13px; color: #C8BFB3;">
            Bihar AI Mission · Secure Civic Portal
          </p>
        </div>
        <div style="padding: 32px 24px; color: #181512; line-height: 1.7;">
          <p style="font-size: 15px; color: #3A322A; margin-top: 0;">
            We received a request to reset the password for your account associated with <strong>${email}</strong>.
          </p>

          <!-- 5-Minute Timer Expiry Highlight -->
          <div style="margin: 20px 0 24px; padding: 14px 20px; background: rgba(193, 85, 44, 0.08); border: 1.5px dashed #C1552C; border-radius: 12px; text-align: center;">
            <div style="font-size: 11px; text-transform: uppercase; font-weight: 800; color: #C1552C; letter-spacing: 0.08em; margin-bottom: 3px;">
              ⏳ Security Expiration
            </div>
            <div style="font-size: 14.5px; font-weight: 700; color: #181512;">
              This reset link will expire in <span style="color: #C1552C; font-weight: 800;">5 minutes</span>
            </div>
          </div>

          <p style="font-size: 14px; color: #5E554D; text-align: center;">
            Click the button below to choose a new password:
          </p>
          <div style="text-align: center; margin: 24px 0 28px;">
            <a href="${resetUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #C1552C 0%, #A3411B 100%); color: #FFFFFF; text-decoration: none; padding: 14px 38px; font-size: 15px; font-weight: 700; border-radius: 12px; box-shadow: 0 4px 16px rgba(193, 85, 44, 0.35);">
              Reset My Password →
            </a>
          </div>
          <p style="font-size: 12.5px; color: #8A7E72; text-align: center;">
            For security reasons, this link will be expired after <strong>5 minutes</strong>. If you did not request this reset, you can safely ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #E2D7C3; margin: 24px 0 16px;" />
          <p style="font-size: 11.5px; color: #A89F91; text-align: center; margin: 0;">
            Bihar AI Mission · Patna, Bihar, India · <a href="https://biharaimission.org" style="color: #C1552C;">biharaimission.org</a>
          </p>
        </div>
      </div>
    `,
  };

  return await sendEmailPayload(payload);
};

export const sendStartupApplicationEmailViaResend = async ({
  startupName = '',
  shortDescription = '',
  companyName,
  companyEmail,
  companyAddress,
  companyWebsite,
  founderName,
  contactNumber,
  founderEmail,
  linkedin = '',
  portfolio = '',
  sector = '',
  stage = '',
  supportNeeded = '',
}) => {
  const refId = 'STUP-' + Date.now().toString(36).toUpperCase();
  const submittedTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';
  const displayName = startupName || companyName;

  const payload = {
    from: getDefaultSender(),
    to: ['vittologyconsultants@gmail.com'],
    reply_to: founderEmail || companyEmail,
    subject: `🚀 [Startup Application #${refId}] ${displayName} — Founder: ${founderName}`,
    text: `New AI Startup Application [#${refId}]\n\n` +
      `Startup Name: ${startupName || 'N/A'}\n` +
      `Company Name: ${companyName}\n` +
      `Company Email: ${companyEmail}\n` +
      `Company Address: ${companyAddress}\n` +
      `Company Website: ${companyWebsite}\n` +
      `Founder Name: ${founderName}\n` +
      `Contact Number: ${contactNumber}\n` +
      `Founder Email: ${founderEmail}\n` +
      `LinkedIn: ${linkedin || 'N/A'}\n` +
      `Portfolio / Pitch: ${portfolio || 'N/A'}\n` +
      `Sector: ${sector || 'N/A'}\n` +
      `Current Stage: ${stage || 'N/A'}\n` +
      `Support Requested: ${supportNeeded || 'N/A'}\n\n` +
      `Short Description:\n${shortDescription || 'N/A'}\n\n` +
      `Submitted At: ${submittedTime}\n` +
      `Reference: ${refId}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 24px; color: #181512; max-width: 650px; border: 1.5px solid #E2D7C3; border-radius: 16px; background: #FAF7F2; margin: 0 auto; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
        <!-- Header -->
        <div style="background: #181512; padding: 24px 20px; border-radius: 12px; color: #FFFFFF; text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background: rgba(193, 85, 44, 0.2); border: 1px solid rgba(193, 85, 44, 0.5); color: #E28B5C; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; padding: 4px 12px; border-radius: 9999px; margin-bottom: 8px;">
            BIHAR AI MISSION · STARTUP DESK
          </div>
          <h2 style="margin: 4px 0 0 0; color: #FFFFFF; font-size: 22px; font-weight: 800;">
            🚀 New AI Startup Application Received
          </h2>
          <p style="margin: 6px 0 0 0; font-size: 12.5px; color: #C8BFB3;">
            Application Reference: <strong style="color: #FBE6A2;">#${refId}</strong> · ${submittedTime}
          </p>
        </div>

        <!-- Quick Summary Banner -->
        <div style="background: #FFFFFF; border: 1.5px solid #E2D7C3; border-radius: 12px; padding: 16px 20px; margin-bottom: 20px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; color: #73675C; font-weight: 600; width: 140px;">Startup Name:</td>
              <td style="padding: 6px 0; color: #181512; font-weight: 800; font-size: 16px;">${displayName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #73675C; font-weight: 600;">Founder:</td>
              <td style="padding: 6px 0; color: #C1552C; font-weight: 700;">${founderName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #73675C; font-weight: 600;">Contact Phone:</td>
              <td style="padding: 6px 0; font-weight: 700;"><a href="tel:${contactNumber}" style="color: #181512; text-decoration: none;">${contactNumber}</a></td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #73675C; font-weight: 600;">Founder Email:</td>
              <td style="padding: 6px 0;"><a href="mailto:${founderEmail}" style="color: #C1552C; font-weight: 700;">${founderEmail}</a></td>
            </tr>
          </table>
        </div>

        <!-- Section 1: Company Details -->
        <div style="background: #FFFFFF; border: 1px solid #E2D7C3; border-radius: 12px; padding: 18px 20px; margin-bottom: 20px;">
          <h3 style="font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #C1552C; margin: 0 0 12px 0; border-bottom: 1px solid #F0E8DC; padding-bottom: 6px;">
            🏢 Registered Company Information
          </h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13.5px;">
            <tr>
              <td style="padding: 6px 0; color: #73675C; font-weight: 600; width: 140px;">Legal Company Name:</td>
              <td style="padding: 6px 0; color: #181512; font-weight: 700;">${companyName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #73675C; font-weight: 600;">Company Email:</td>
              <td style="padding: 6px 0;"><a href="mailto:${companyEmail}" style="color: #C1552C; text-decoration: none; font-weight: 600;">${companyEmail}</a></td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #73675C; font-weight: 600;">Company Website:</td>
              <td style="padding: 6px 0;"><a href="${companyWebsite.startsWith('http') ? companyWebsite : 'https://' + companyWebsite}" target="_blank" style="color: #C1552C; font-weight: 700; text-decoration: underline;">${companyWebsite}</a></td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #73675C; font-weight: 600; vertical-align: top;">Registered Address:</td>
              <td style="padding: 6px 0; color: #181512; line-height: 1.5;">${companyAddress}</td>
            </tr>
          </table>
        </div>

        <!-- Section 2: Founder & Professional Profiles -->
        <div style="background: #FFFFFF; border: 1px solid #E2D7C3; border-radius: 12px; padding: 18px 20px; margin-bottom: 20px;">
          <h3 style="font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #C1552C; margin: 0 0 12px 0; border-bottom: 1px solid #F0E8DC; padding-bottom: 6px;">
            👤 Founder & Leadership Profile
          </h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13.5px;">
            <tr>
              <td style="padding: 6px 0; color: #73675C; font-weight: 600; width: 140px;">Founder Full Name:</td>
              <td style="padding: 6px 0; color: #181512; font-weight: 700;">${founderName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #73675C; font-weight: 600;">Contact Phone / WA:</td>
              <td style="padding: 6px 0; color: #181512; font-weight: 600;"><a href="tel:${contactNumber}" style="color: #181512;">${contactNumber}</a></td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #73675C; font-weight: 600;">Founder Email:</td>
              <td style="padding: 6px 0;"><a href="mailto:${founderEmail}" style="color: #C1552C; font-weight: 600;">${founderEmail}</a></td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #73675C; font-weight: 600;">LinkedIn Profile:</td>
              <td style="padding: 6px 0;">
                ${linkedin ? `<a href="${linkedin.startsWith('http') ? linkedin : 'https://' + linkedin}" target="_blank" style="color: #0077b5; font-weight: 600; text-decoration: underline;">${linkedin}</a>` : '<span style="color: #9CA3AF;">Not provided</span>'}
              </td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #73675C; font-weight: 600;">Portfolio / Pitch:</td>
              <td style="padding: 6px 0;">
                ${portfolio ? `<a href="${portfolio.startsWith('http') ? portfolio : 'https://' + portfolio}" target="_blank" style="color: #C1552C; font-weight: 600; text-decoration: underline;">${portfolio}</a>` : '<span style="color: #9CA3AF;">Not provided</span>'}
              </td>
            </tr>
          </table>
        </div>

        <!-- Section 3: Domain & Stage -->
        ${(sector || stage || supportNeeded) ? `
          <div style="background: #FFFFFF; border: 1px solid #E2D7C3; border-radius: 12px; padding: 18px 20px; margin-bottom: 20px;">
            <h3 style="font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #C1552C; margin: 0 0 12px 0; border-bottom: 1px solid #F0E8DC; padding-bottom: 6px;">
              🎯 Sector & Growth Stage
            </h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13.5px;">
              ${sector ? `<tr><td style="padding: 6px 0; color: #73675C; font-weight: 600; width: 140px;">Industry / Sector:</td><td style="padding: 6px 0; color: #181512; font-weight: 600;">${sector}</td></tr>` : ''}
              ${stage ? `<tr><td style="padding: 6px 0; color: #73675C; font-weight: 600;">Current Stage:</td><td style="padding: 6px 0; color: #181512; font-weight: 600;">${stage}</td></tr>` : ''}
              ${supportNeeded ? `<tr><td style="padding: 6px 0; color: #73675C; font-weight: 600;">Support Needed:</td><td style="padding: 6px 0; color: #181512; font-weight: 600;">${supportNeeded}</td></tr>` : ''}
            </table>
          </div>
        ` : ''}

        <!-- Section 4: Short Description -->
        ${shortDescription ? `
          <div style="background: #FFFFFF; border: 1px solid #E2D7C3; border-radius: 12px; padding: 18px 20px; margin-bottom: 24px;">
            <h3 style="font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #C1552C; margin: 0 0 8px 0;">
              📝 Startup Description & AI Solution
            </h3>
            <div style="background: #FAF7F2; border-left: 4px solid #C1552C; padding: 14px 16px; border-radius: 6px; font-size: 14px; color: #4A4036; line-height: 1.65; white-space: pre-wrap;">${shortDescription}</div>
          </div>
        ` : ''}

        <hr style="border: none; border-top: 1px solid #E2D7C3; margin: 24px 0 16px 0;" />
        <p style="font-size: 12px; color: #8A7E72; text-align: center; margin: 0; line-height: 1.5;">
          Official Startup Application Entry · <strong>Bihar AI Mission</strong><br />
          Delivered directly to Bihar AI Mission Incubation & Strategy Desk
        </p>
      </div>
    `,
  };

  return await sendEmailPayload(payload);
};

export const sendStartupThankYouEmailViaResend = async ({
  startupName = '',
  companyName,
  founderName,
  founderEmail,
  companyWebsite = '',
  sector = '',
  stage = '',
}) => {
  const refId = 'STUP-' + Date.now().toString(36).toUpperCase();
  const displayName = startupName || companyName;

  const payload = {
    from: getDefaultSender(),
    to: [founderEmail],
    subject: `🎉 Application Received — Welcome ${displayName} to Bihar AI Mission!`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #E2D7C3; border-radius: 16px; overflow: hidden; background: #FAF7F2; box-shadow: 0 8px 30px rgba(0,0,0,0.08);">
        <!-- Header -->
        <div style="background: #181512; padding: 36px 28px; text-align: center; color: #FFFFFF;">
          <div style="display: inline-block; background: rgba(217, 155, 38, 0.18); border: 1px solid rgba(217, 155, 38, 0.4); color: #FBE6A2; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; padding: 4px 14px; border-radius: 9999px; margin-bottom: 12px;">
            BIHAR AI MISSION · STARTUP & INNOVATION HUB
          </div>
          <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #FFFFFF; font-family: Georgia, serif;">
            Startup Registration Confirmed! 🚀
          </h1>
          <p style="margin: 8px 0 0 0; font-size: 14px; color: #C8BFB3;">
            Empowering DeepTech and AI Innovators Across Bihar
          </p>
        </div>

        <!-- Main Body -->
        <div style="padding: 32px 28px; color: #181512; line-height: 1.7; text-align: left;">
          <h2 style="font-size: 18px; color: #181512; margin-top: 0; font-weight: 700;">
            Dear ${founderName},
          </h2>
          <p style="font-size: 14.5px; color: #4A4036; margin-bottom: 16px;">
            Thank you for registering <strong>${displayName}</strong> with the <strong>Bihar AI Mission</strong>. Your application dossier has been received by our startup desk and registered under reference ID <strong style="color: #C1552C;">#${refId}</strong>.
          </p>

          <!-- Details Card -->
          <div style="background: #FFFFFF; border: 1px solid #E2D7C3; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <div style="font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #C1552C; margin-bottom: 12px; border-bottom: 1px solid #F0E8DC; padding-bottom: 6px;">
              📋 Application Summary
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 13.5px; color: #2D241E;">
              <tr>
                <td style="padding: 6px 0; font-weight: 600; width: 130px; color: #73675C;">Startup Name:</td>
                <td style="padding: 6px 0; font-weight: 700; color: #181512;">${displayName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: 600; color: #73675C;">Company Name:</td>
                <td style="padding: 6px 0; color: #181512;">${companyName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: 600; color: #73675C;">Lead Founder:</td>
                <td style="padding: 6px 0; font-weight: 700; color: #C1552C;">${founderName}</td>
              </tr>
              ${companyWebsite ? `<tr><td style="padding: 6px 0; font-weight: 600; color: #73675C;">Website:</td><td style="padding: 6px 0;"><a href="${companyWebsite.startsWith('http') ? companyWebsite : 'https://' + companyWebsite}" target="_blank" style="color: #C1552C;">${companyWebsite}</a></td></tr>` : ''}
              ${sector ? `<tr><td style="padding: 6px 0; font-weight: 600; color: #73675C;">Sector / Focus:</td><td style="padding: 6px 0;">${sector}</td></tr>` : ''}
              ${stage ? `<tr><td style="padding: 6px 0; font-weight: 600; color: #73675C;">Stage:</td><td style="padding: 6px 0;">${stage}</td></tr>` : ''}
            </table>
          </div>

          <!-- What's Next Card -->
          <div style="background: rgba(217, 155, 38, 0.08); border-left: 4px solid #D99B26; padding: 18px 20px; border-radius: 8px; margin-bottom: 24px;">
            <div style="font-size: 14px; font-weight: 700; color: #181512; margin-bottom: 6px;">
              ✨ What Happens Next?
            </div>
            <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #5E554D; line-height: 1.65;">
              <li><strong>Incubation Review:</strong> Our panel evaluates your application for eligibility under the ₹10 Lakh Startup Bihar 10-year interest-free seed grant scheme.</li>
              <li><strong>IIT Patna & STPI Compute:</strong> Eligible deep-tech AI projects will be connected to high-performance GPU cluster allocations and lab facilities.</li>
              <li><strong>Government AI Pilots:</strong> We regularly connect vetted AI startups to state administrative departments (Revenue, Agriculture, Health, and Disaster Management) for pilot testing.</li>
            </ul>
          </div>

          <!-- Need Help / Questions -->
          <p style="font-size: 13px; color: #73675C; margin-bottom: 24px;">
            If you need to update any information or share a revised pitch deck, feel free to reply directly to this email or reach us at <a href="mailto:contact@biharaimission.org" style="color: #C1552C; font-weight: 600;">contact@biharaimission.org</a>.
          </p>

          <hr style="border: none; border-top: 1px solid #E2D7C3; margin: 28px 0 20px;" />

          <p style="font-size: 12px; color: #8A7E72; text-align: center; margin: 0; line-height: 1.6;">
            <strong>Bihar AI Mission</strong> · Startup & Innovation Ecosystem<br />
            Patna, Bihar, India · <a href="https://biharaimission.org" style="color: #C1552C; text-decoration: none;">biharaimission.org</a>
          </p>
        </div>
      </div>
    `,
  };

  return await sendEmailPayload(payload);
};

