const nodemailer = require('nodemailer');
let EmailTemplate = null;
try {
  EmailTemplate = require('../models/EmailTemplate');
} catch (e) {}

const BREVO_API_KEY = process.env.BREVO_API_KEY || '';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'noreply.2k2x@gmail.com';
const SENDER_NAME = 'CityPilot';
const EMAIL_USER = process.env.EMAIL_USER || '';
const EMAIL_PASS = process.env.EMAIL_PASS || '';

let transporter = null;
try {
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
    connectionTimeout: 4000,
    greetingTimeout: 4000,
  });
} catch (err) {
  console.warn('SMTP transporter init failed:', err.message);
}

/**
 * Universal Email Dispatcher
 * Priority matches Inventory project:
 * 1. Brevo HTTPS API (Port 443 - Works 100% on Render and can send to ANY email address)
 * 2. Resend HTTPS API (Port 443 - Fallback)
 * 3. Nodemailer SMTP (Port 465 - Fallback for local dev)
 */
async function dispatchEmail({ to, toName, subject, html, text }) {
  if (!to) return null;

  // 1. Brevo HTTPS API (Port 443 - Works 100% on Render without SMTP port blockage)
  if (BREVO_API_KEY) {
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json',
          accept: 'application/json',
        },
        body: JSON.stringify({
          sender: { name: SENDER_NAME, email: SENDER_EMAIL },
          to: [{ email: to, name: toName || to.split('@')[0] }],
          subject,
          htmlContent: html || `<p>${text || subject}</p>`,
        }),
      });

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        console.log(`[EmailService] Delivered via Brevo HTTPS to ${to} (MessageId: ${data.messageId || 'OK'})`);
        return { success: true, provider: 'brevo', data };
      } else {
        const errData = await response.json().catch(() => ({}));
        console.warn('[EmailService] Brevo HTTPS notice:', response.status, errData);
      }
    } catch (brevoErr) {
      console.warn('[EmailService] Brevo HTTPS network error:', brevoErr.message);
    }
  }

  // 2. Resend HTTPS API (Port 443 - Fallback)
  if (RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'CityPilot <onboarding@resend.dev>',
          to: Array.isArray(to) ? to : [to],
          subject,
          html: html || text,
          text: text || '',
        }),
      });

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        console.log(`[EmailService] Delivered via Resend to ${to}`);
        return { success: true, provider: 'resend', data };
      }
    } catch (resendErr) {
      console.warn('[EmailService] Resend network error:', resendErr.message);
    }
  }

  // 3. Nodemailer SMTP (Fallback for local dev)
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"${SENDER_NAME}" <${EMAIL_USER}>`,
        to,
        subject,
        html,
        text: text || subject,
      });
      console.log(`[EmailService] Delivered via SMTP to ${to} (MessageId: ${info.messageId})`);
      return { success: true, provider: 'smtp', messageId: info.messageId };
    } catch (smtpErr) {
      console.warn('[EmailService] SMTP delivery skipped:', smtpErr.message);
    }
  }

  return { success: false, message: 'All email delivery providers failed' };
}

/**
 * Build the Exact Branded CityPilot OTP Email Template from User Design
 */
function buildCityPilotOtpTemplate({ otp }) {
  const code = String(otp || '000000').padStart(6, '0');
  const digits = code.split('').slice(0, 6);

  const digitBoxesHtml = digits
    .map(
      (d) => `
      <td style="padding: 0 4px;" align="center">
        <div style="width: 44px; height: 54px; line-height: 54px; text-align: center; background-color: #FFFFFF; border-radius: 12px; font-size: 26px; font-weight: 800; color: #0F172A; box-shadow: 0 2px 8px rgba(10, 132, 255, 0.12); border: 1px solid #E2E8F0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          ${d}
        </div>
      </td>
    `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your OTP for CityPilot</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F8FAFC; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container (< 4 KB, renders instantaneously inline, never clipped by Gmail) -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 540px; background-color: #FFFFFF; border-radius: 24px; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08); overflow: hidden; border: 1px solid #E2E8F0;">
          
          <!-- Top Banner: Oreo Mascot + Hyderabad Skyline (Hosted on Fast Global CDN) -->
          <tr>
            <td style="padding: 0; line-height: 0; font-size: 0; background-color: #EBF5FF;">
              <img src="https://cdn.jsdelivr.net/gh/Jyothisaik01/mobile-app@main/assets/email/citypilot_email_header.jpg" width="540" style="width: 100%; max-width: 540px; height: auto; display: block; border: 0;" alt="CityPilot - Find the smartest way there" />
            </td>
          </tr>

          <!-- Main Content Card -->
          <tr>
            <td align="center" style="padding: 32px 28px 24px 28px; background-color: #FFFFFF;">
              
              <h1 style="margin: 0 0 10px 0; font-size: 26px; font-weight: 800; color: #0F172A; letter-spacing: -0.5px;">
                Your OTP for <span style="color: #0A84FF;">CityPilot</span>
              </h1>
              
              <p style="margin: 0 0 24px 0; font-size: 14.5px; line-height: 1.5; color: #64748B; max-width: 420px;">
                Use the OTP below to verify your mobile number and continue to your journey.
              </p>

              <!-- 6 Individual Digit Boxes Container -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto 16px auto; background-color: #F0F7FF; border-radius: 18px; padding: 14px 18px;">
                <tr>
                  ${digitBoxesHtml}
                </tr>
              </table>

              <p style="margin: 0 0 24px 0; font-size: 13.5px; color: #64748B;">
                This OTP is valid for <strong style="color: #0A84FF;">5 minutes</strong>.
              </p>

              <!-- Action Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto 26px auto;">
                <tr>
                  <td align="center" style="background-color: #0A84FF; border-radius: 30px; box-shadow: 0 4px 14px rgba(10, 132, 255, 0.35);">
                    <a href="https://citypilot.app" target="_blank" style="display: inline-block; padding: 14px 34px; font-size: 15px; font-weight: 700; color: #FFFFFF; text-decoration: none; letter-spacing: 0.2px;">
                      Go to CityPilot App &nbsp;&rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Security Notice Banner -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F0F7FF; border-radius: 14px; padding: 14px 16px;">
                <tr>
                  <td width="28" valign="middle" style="padding-right: 10px;">
                    <div style="width: 28px; height: 28px; border-radius: 8px; background-color: #0A84FF; text-align: center; line-height: 28px; color: #FFFFFF; font-size: 14px;">
                      &#x1F6E1;
                    </div>
                  </td>
                  <td align="left" style="font-size: 12.5px; color: #475569; line-height: 1.45;">
                    <strong style="color: #0F172A;">Never share this OTP with anyone.</strong><br/>
                    CityPilot will never ask for your OTP over a call or message.
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer Banner: Charminar Skyline + App Store Badges + Features -->
          <tr>
            <td style="padding: 0; line-height: 0; font-size: 0; background-color: #FFFFFF;">
              <img src="https://cdn.jsdelivr.net/gh/Jyothisaik01/mobile-app@main/assets/email/citypilot_email_footer.jpg" width="540" style="width: 100%; max-width: 540px; height: auto; display: block; border: 0;" alt="Get the CityPilot App" />
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Get or Seed Email Template from Database
 */
async function syncTemplateToDb(html) {
  if (!EmailTemplate) return;
  try {
    await EmailTemplate.findOneAndUpdate(
      { templateKey: 'otp_verification' },
      {
        templateKey: 'otp_verification',
        name: 'CityPilot Official OTP Template',
        subject: 'Your OTP for CityPilot',
        htmlContent: html,
        textContent: 'Your OTP for CityPilot is: {{otp}}. Valid for 5 minutes. Do not share this OTP.',
      },
      { upsert: true, new: true }
    );
  } catch (e) {
    // Non-blocking
  }
}

/**
 * Send CityPilot OTP Email
 */
async function sendProfileOtpEmail({ email, name, otp }) {
  const subject = `Your OTP for CityPilot: ${otp}`;
  const html = buildCityPilotOtpTemplate({ otp });

  // Sync to database
  syncTemplateToDb(html).catch(() => {});

  return await dispatchEmail({
    to: email,
    toName: name,
    subject,
    html,
    text: `Your OTP for CityPilot is: ${otp}. Valid for 5 minutes. Do not share this OTP with anyone.`,
  });
}

module.exports = {
  dispatchEmail,
  sendProfileOtpEmail,
  buildCityPilotOtpTemplate,
};
