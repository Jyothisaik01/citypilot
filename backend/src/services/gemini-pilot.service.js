/**
 * Gemini AI Pilot Chat Service
 * Uses Google Gemini (with Groq and smart local fallback) to simulate
 * a realistic, friendly, punctual Hyderabad CityPilot driver/rider.
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

/**
 * Generate a pilot response using Gemini
 */
async function generatePilotResponse({
  message,
  history = [],
  pilotName = 'Ramesh Kumar',
  vehicle = 'TVS Raider 125 (TS 09 UB 4821)',
  status = 'arriving',
  etaMinutes = 2,
  pickup = 'Gachibowli Junction',
  destination = 'Raidurg Metro Station',
}) {
  const cleanMsg = (message || '').trim();
  if (!cleanMsg) return 'Haan bhaiya, bolye!';

  // System instruction for the pilot persona
  const systemInstruction = `You are ${pilotName}, a verified bike taxi pilot on CityPilot in Hyderabad riding a ${vehicle}.
Current situation: You accepted a ride request for pickup at "${pickup}" going to "${destination}".
Your current status: ${status} (ETA: ~${etaMinutes} mins).
Persona:
- Polite, street-smart, punctual Hyderabad driver.
- Uses friendly respectful tone (e.g., "Bhaiya", "Sirji", "Haanji", "Madam").
- Speaks crisp English mixed naturally with occasional familiar Hindi/Telugu words (e.g., "Bhaiya reaching main gate in 2 mins", "Traffic clear hai", "Helmet ready hai").
- CRITICAL RULES:
  1. Reply in ONLY 1 or 2 short sentences. You are driving / navigating so you cannot type long essays.
  2. Never break character. Never mention you are an AI or bot.
  3. Respond directly to what the rider asked (e.g., location, helmet, delay, entrance gate).`;

  // Try 1: Google Gemini (gemini-3.5-flash-lite)
  try {
    const formattedContents = [];

    // Add prior history if provided
    if (Array.isArray(history) && history.length > 0) {
      history.slice(-4).forEach((h) => {
        formattedContents.push({
          role: h.sender === 'rider' ? 'user' : 'model',
          parts: [{ text: h.text }],
        });
      });
    }

    formattedContents.push({
      role: 'user',
      parts: [
        {
          text: `[Context: ${systemInstruction}]\nRider message: "${cleanMsg}"\nYour response:`,
        },
      ],
    });

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: formattedContents,
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 100,
          },
        }),
      }
    );

    if (res.ok) {
      const data = await res.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (reply) {
        return cleanReply(reply);
      }
    } else {
      console.warn('[GeminiPilot] Gemini API error status:', res.status);
    }
  } catch (err) {
    console.warn('[GeminiPilot] Gemini request error:', err.message);
  }

  // Try 2: Groq Fallback (ultra-fast)
  if (GROQ_API_KEY) {
    try {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: cleanMsg },
          ],
          max_tokens: 80,
          temperature: 0.6,
        }),
      });

      if (groqRes.ok) {
        const groqData = await groqRes.json();
        const reply = groqData.choices?.[0]?.message?.content?.trim();
        if (reply) return cleanReply(reply);
      }
    } catch (gErr) {
      console.warn('[GeminiPilot] Groq fallback error:', gErr.message);
    }
  }

  // Try 3: Context-aware Local Intelligent Fallback
  return getIntelligentFallback(cleanMsg, status, etaMinutes);
}

function cleanReply(text) {
  return text
    .replace(/^["']|["']$/g, '')
    .replace(/^Pilot:\s*/i, '')
    .replace(/^Ramesh:\s*/i, '')
    .trim();
}

function getIntelligentFallback(msg, status, eta) {
  const lower = msg.toLowerCase();
  if (lower.includes('where') || lower.includes('location') || lower.includes('kaha')) {
    return `Bhaiya, just took the turn near the signal, arriving in ${eta || 2} minutes!`;
  }
  if (lower.includes('helmet') || lower.includes('safety')) {
    return 'Ha bhaiya, sanitized extra helmet ready hai mere paas!';
  }
  if (lower.includes('gate') || lower.includes('waiting') || lower.includes('pillar')) {
    return 'Noted sirji, please wait near the main gate. I have my hazard lights on!';
  }
  if (lower.includes('late') || lower.includes('hurry') || lower.includes('fast')) {
    return 'Don’t worry bhaiya, traffic is moving smoothly now, will drop you right on time!';
  }
  if (lower.includes('otp')) {
    return 'Yes sir, please share the 4-digit OTP once I arrive at your spot!';
  }
  return 'Haanji bhaiya, I am on the way! See you in a minute.';
}

module.exports = {
  generatePilotResponse,
};

