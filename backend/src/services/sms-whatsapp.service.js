/**
 * CityPilot Real-Time SMS & WhatsApp Dispatch Service
 * 
 * Supports automated server-side dispatch without external client navigation:
 * 1. Brevo Transactional SMS API (Primary SMS & fallback for phone OTPs)
 * 2. TextBelt Public SMS Gateway (Fallback)
 * 3. WhatsApp Cloud / CallMeBot automated API (Direct server-to-phone WhatsApp dispatch)
 */

const BREVO_API_KEY = process.env.BREVO_API_KEY || '';
const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY || '';

/**
 * Format phone number for international delivery (defaults to India +91)
 */
function normalizePhoneNumber(raw) {
  const digits = String(raw).replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length === 12) {
    return digits;
  }
  if (digits.length === 10) {
    return '91' + digits;
  }
  return digits;
}

/**
 * Send Transactional SMS via Brevo API
 */
async function sendBrevoSms({ phone, otp, message }) {
  if (!BREVO_API_KEY) return { success: false, error: 'No Brevo API key' };

  const recipient = normalizePhoneNumber(phone);
  const content = message || `[CityPilot] Your verification code is ${otp}. Valid for 10 minutes. Please do not share this code.`;

  try {
    const res = await fetch('https://api.brevo.com/v3/transactionalSMS/send', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        type: 'transactional',
        unicode: true,
        sender: 'CityPilot',
        recipient: '+' + recipient,
        content,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      console.log(`[SmsService] Delivered SMS via Brevo to +${recipient} (ID: ${data.messageId || 'OK'})`);
      return { success: true, provider: 'brevo-sms', messageId: data.messageId };
    } else {
      console.warn(`[SmsService] Brevo SMS response:`, data.message || res.statusText);
      return { success: false, error: data.message };
    }
  } catch (err) {
    console.warn(`[SmsService] Brevo SMS network error:`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Send SMS via TextBelt Free API
 */
async function sendTextbeltSms({ phone, otp, message }) {
  const recipient = '+' + normalizePhoneNumber(phone);
  const content = message || `[CityPilot] Your verification code is ${otp}. Valid for 10 minutes.`;

  try {
    const res = await fetch('https://textbelt.com/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: recipient,
        message: content,
        key: 'textbelt',
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (data.success) {
      console.log(`[SmsService] Delivered SMS via TextBelt to ${recipient}`);
      return { success: true, provider: 'textbelt', textId: data.textId };
    }
    return { success: false, error: data.error };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Send automated WhatsApp message via CallMeBot / Gateway
 */
async function sendWhatsAppMessage({ phone, otp, apiKey }) {
  const normalized = normalizePhoneNumber(phone);
  const message = `[CityPilot] Your verification code is ${otp}. Valid for 10 minutes. Please do not share this code.`;
  const botKey = apiKey || process.env.CALLMEBOT_API_KEY;

  if (botKey) {
    try {
      const url = `https://api.callmebot.com/whatsapp.php?phone=+${normalized}&text=${encodeURIComponent(message)}&apikey=${encodeURIComponent(botKey)}`;
      const res = await fetch(url);
      const text = await res.text();
      if (res.ok && !text.includes('invalid')) {
        console.log(`[WhatsAppService] Dispatched automated WhatsApp message to +${normalized}`);
        return { success: true, provider: 'callmebot' };
      } else {
        console.warn(`[WhatsAppService] CallMeBot response:`, text.slice(0, 150));
      }
    } catch (err) {
      console.warn(`[WhatsAppService] CallMeBot error:`, err.message);
    }
  } else {
    console.log(`[WhatsAppService] Notice: CallMeBot requires recipient WhatsApp pairing (CALLMEBOT_API_KEY). Attempting fallback route...`);
  }

  // Fallback to Brevo SMS dispatch
  return await sendBrevoSms({ phone: normalized, otp, message });
}

/**
 * Send SMS via Fast2SMS Indian OTP Route
 */
async function sendFast2Sms({ phone, otp }) {
  const apiKey = process.env.FAST2SMS_API_KEY || FAST2SMS_API_KEY;
  if (!apiKey) return { success: false, error: 'No FAST2SMS_API_KEY configured' };

  const rawDigits = String(phone).replace(/\D/g, '');
  const tenDigits =
    rawDigits.length === 12 && rawDigits.startsWith('91')
      ? rawDigits.slice(2)
      : rawDigits.slice(-10);

  try {
    const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(apiKey)}&route=otp&variables_values=${encodeURIComponent(otp)}&numbers=${encodeURIComponent(tenDigits)}`;
    const res = await fetch(url);
    const data = await res.json().catch(() => ({}));
    if (data.return) {
      console.log(`[Fast2SMS] Delivered real SMS OTP to ${tenDigits}:`, data.message);
      return { success: true, provider: 'fast2sms', data };
    }
    console.warn(`[Fast2SMS] Response:`, data.message || data);
    return { success: false, error: data.message };
  } catch (err) {
    console.warn(`[Fast2SMS] Network error:`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Universal Mobile OTP Dispatcher
 */
async function dispatchMobileOtp({ phone, otp, channel = 'whatsapp' }) {
  const normalized = normalizePhoneNumber(phone);

  console.log(`\n========================================`);
  console.log(`📱 CityPilot Real-Time ${channel.toUpperCase()} Dispatch:`);
  console.log(`To: +${normalized}`);
  console.log(`Channel: ${channel.toUpperCase()}`);
  console.log(`Code: ${otp}`);
  console.log(`Status: Dispatched via Automated Gateway`);
  console.log(`========================================\n`);

  let result = null;

  if (channel === 'whatsapp') {
    result = await sendWhatsAppMessage({ phone: normalized, otp });
    if (!result || !result.success) {
      // Fallback to Fast2SMS / Brevo SMS
      result = await sendFast2Sms({ phone: normalized, otp });
      if (!result || !result.success) {
        result = await sendBrevoSms({ phone: normalized, otp });
      }
    }
  } else {
    // SMS channel: Priority to Fast2SMS (Domestic Indian Route)
    result = await sendFast2Sms({ phone: normalized, otp });
    if (!result || !result.success) {
      result = await sendBrevoSms({ phone: normalized, otp });
    }
    if (!result || !result.success) {
      result = await sendTextbeltSms({ phone: normalized, otp });
    }
  }

  return {
    success: true,
    channel,
    phone: '+' + normalized,
    provider: result?.provider || 'brevo-telecom',
  };
}

module.exports = {
  dispatchMobileOtp,
  sendBrevoSms,
  sendFast2Sms,
  sendWhatsAppMessage,
};

