import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const SENDER = 'contact@biharaimission.org';

    // 1. Welcome / Thank You Email Handler
    if (payload.type === 'welcome') {
      const { fullName, email } = payload;
      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eef2fb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="background: #12384A; padding: 32px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 800;">Welcome to the Mission!</h1>
            <p style="margin: 6px 0 0 0; font-size: 13px; color: #BAE6FD;">Bihar AI Mission · Official Civic AI Initiative</p>
          </div>
          <div style="padding: 32px; color: #1a2232; line-height: 1.8; text-align: left;">
            <h2 style="color: #12384A; font-size: 18px; margin-top: 0;">Dear ${fullName},</h2>
            <p>Thank you for creating your account with the <strong>Bihar AI Mission</strong>. We are thrilled to have you as part of our growing community dedicated to democratizing AI across Bihar.</p>
            <div style="margin: 28px 0; padding: 20px; background: #f0f7ff; border-left: 4px solid #12384A; border-radius: 6px; color: #12384A; font-weight: 500;">
              Your account has been successfully created. You can now log in, access our AI learning tools, courses, and certifications.
            </div>
            <p style="font-size: 14px; color: #5a6478;">Feel free to explore our training modules, prompt libraries, and interactive AI tools on our platform.</p>
            <hr style="border: none; border-top: 1px solid #dde1ea; margin: 28px 0;" />
            <p style="font-size: 12px; color: #8993a6; text-align: center; margin: 0;">
              Bihar AI Mission · A civic AI initiative<br/>
              Patna, Bihar, India
            </p>
          </div>
        </div>
      `;

      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: `Bihar AI Mission <${SENDER}>`,
          to: email,
          subject: 'Thank you for joining Bihar AI Mission 🚀',
          html: emailHtml,
        }),
      });

      const resultText = await resendRes.text();
      return new Response(JSON.stringify({ success: resendRes.ok, detail: resultText }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: resendRes.ok ? 200 : 400,
      });
    }

    if (isReset) {
      const email = payload.email || (payload.formData && payload.formData.email);
      let resetUrl = payload.resetUrl;
      if (!resetUrl && payload.formData && payload.formData.intent) {
        resetUrl = payload.formData.intent.replace('RESET_PASSWORD:', '');
      }
      if (!resetUrl) {
        resetUrl = 'https://biharaimission.org/reset-password';
      }

      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eef2fb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="background: #12384A; padding: 28px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 22px; font-weight: 800;">Bihar AI Mission</h1>
            <p style="margin: 6px 0 0 0; font-size: 13px; color: #BAE6FD;">Account Security & Password Recovery</p>
          </div>
          <div style="padding: 32px; color: #1a2232; line-height: 1.6;">
            <h2 style="color: #0F172A; font-size: 18px; margin-top: 0;">Password Reset Request</h2>
            <p>We received a request to reset the password for your account associated with <strong>${email}</strong>.</p>
            <p>Click the button below to set a new password for your account:</p>
            <div style="text-align: center; margin: 28px 0;">
              <a href="${resetUrl}" style="background: #12384A; color: #FFFFFF; text-decoration: none; padding: 12px 26px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(18,56,74,0.2);">Reset Password →</a>
            </div>
            <p style="font-size: 13px; color: #64748B; margin-top: 24px;">Or copy and paste this link into your browser:<br/><a href="${resetUrl}" style="color: #0284C7;">${resetUrl}</a></p>
            <p style="font-size: 13px; color: #64748B;">If you did not request this, you can safely ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
            <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
              Bihar AI Mission · Official Civic AI Initiative<br/>Patna, Bihar, India
            </p>
          </div>
        </div>
      `;

      // Send password reset email via Resend API
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: `Bihar AI Mission <${SENDER}>`,
          to: email,
          subject: 'Reset your Bihar AI Mission Password 🔒',
          html: emailHtml,
        }),
      });

      const resultText = await resendRes.text();
      return new Response(JSON.stringify({ success: resendRes.ok, detail: resultText }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: resendRes.ok ? 200 : 400,
      });
    }

    // 2. Standard Form Submission Handler (Get Involved)
    const { formData } = payload;
    if (formData) {
      const { 
        fullName, 
        email, 
        mobile, 
        roleType, 
        district, 
        intent, 
        organization, 
        designation 
      } = formData;

      const adminRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: `Bihar AI Mission <${SENDER}>`, 
          to: 'contact@biharaimission.org',
          subject: 'New Get Involved Submission',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eef2fb; border-radius: 8px; overflow: hidden;">
              <div style="background: #1a4fa0; padding: 24px; color: white;">
                <h2 style="margin: 0; font-size: 20px;">New Application Received</h2>
              </div>
              <div style="padding: 32px; color: #1a2232; line-height: 1.6;">
                <p>A new visitor has submitted the "Get Involved" form on biharaimission.org.</p>
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                  <tr><td style="padding: 8px 0; border-bottom: 1px solid #f5f7fa; font-weight: bold; width: 140px;">Name:</td><td style="padding: 8px 0; border-bottom: 1px solid #f5f7fa;">${fullName}</td></tr>
                  <tr><td style="padding: 8px 0; border-bottom: 1px solid #f5f7fa; font-weight: bold;">Email:</td><td style="padding: 8px 0; border-bottom: 1px solid #f5f7fa;">${email}</td></tr>
                  <tr><td style="padding: 8px 0; border-bottom: 1px solid #f5f7fa; font-weight: bold;">Phone:</td><td style="padding: 8px 0; border-bottom: 1px solid #f5f7fa;">${mobile}</td></tr>
                  <tr><td style="padding: 8px 0; border-bottom: 1px solid #f5f7fa; font-weight: bold;">Role:</td><td style="padding: 8px 0; border-bottom: 1px solid #f5f7fa;">${roleType} (${designation || 'N/A'})</td></tr>
                  <tr><td style="padding: 8px 0; border-bottom: 1px solid #f5f7fa; font-weight: bold;">Organization:</td><td style="padding: 8px 0; border-bottom: 1px solid #f5f7fa;">${organization || 'N/A'}</td></tr>
                  <tr><td style="padding: 8px 0; border-bottom: 1px solid #f5f7fa; font-weight: bold;">District:</td><td style="padding: 8px 0; border-bottom: 1px solid #f5f7fa;">${district}</td></tr>
                </table>
                <div style="margin-top: 24px;">
                  <h4 style="margin-bottom: 10px; color: #1a4fa0;">Statement of Intent:</h4>
                  <div style="background: #f5f7fa; padding: 16px; border-left: 4px solid #1a4fa0; border-radius: 4px;">
                    ${intent}
                  </div>
                </div>
              </div>
            </div>
          `,
        }),
      });

      if (!adminRes.ok) {
        const adminError = await adminRes.text();
        console.error('Admin Email Error:', adminError);
      }

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: `Bihar AI Mission <${SENDER}>`, 
          to: email,
          subject: 'Thank you for joining Bihar AI Mission 🚀',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eef2fb; border-radius: 8px; overflow: hidden;">
              <div style="background: #1a4fa0; padding: 32px; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 24px;">Welcome to the Mission!</h1>
              </div>
              <div style="padding: 32px; color: #1a2232; line-height: 1.8; text-align: center;">
                <h2 style="color: #1a4fa0;">Dear ${fullName},</h2>
                <p>Thank you for expressing your interest in the **Bihar AI Mission**. We are thrilled to have you as part of our growing community dedicated to democratizing AI across Bihar.</p>
                <div style="margin: 32px 0; padding: 20px; background: #eef2fb; border-radius: 8px; color: #122f72; font-weight: 500;">
                  Our team is currently reviewing your application. We will reach out to you soon regarding the next steps and potential collaboration opportunities.
                </div>
                <p style="font-size: 14px; color: #5a6478;">In the meantime, feel free to explore our training modules and tools on our hub.</p>
                <hr style="border: none; border-top: 1px solid #dde1ea; margin: 32px 0;" />
                <p style="font-size: 13px; color: #8993a6;">
                  Bihar AI Mission · A civic AI initiative<br/>
                  Patna, Bihar, India
                </p>
              </div>
            </div>
          `,
        }),
      });

      return new Response(JSON.stringify({ message: "Emails sent successfully" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ message: "No action performed" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Function Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
