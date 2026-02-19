const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';

function isAvailable() {
  return !!GEMINI_API_KEY;
}

const MAX_HISTORY_MESSAGES = 20;

/**
 * Build contents array for multi-turn conversation.
 * Maps frontend format {role: 'user'|'assistant', content} to Gemini format.
 * Limits history for faster responses.
 */
function buildContents(history, currentMessage) {
  const contents = [];

  if (Array.isArray(history) && history.length > 0) {
    const recent = history.slice(-MAX_HISTORY_MESSAGES);
    for (const msg of recent) {
      const role = msg.role === 'assistant' ? 'model' : 'user';
      const text = typeof msg.content === 'string' ? msg.content : String(msg.content || '');
      if (text.trim()) {
        contents.push({ role, parts: [{ text }] });
      }
    }
  }

  contents.push({ role: 'user', parts: [{ text: currentMessage }] });
  return contents;
}

/**
 * Send message to Gemini via REST API and return response.
 * Optimized for fast responses using flash model.
 */
async function chat(message, history = []) {
  if (!isAvailable()) {
    throw new Error('Gemini API key not configured. Set GEMINI_API_KEY in .env');
  }

  const contents = buildContents(history, message);
  const body = {
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
      topP: 0.95,
    },
  };

  const url = `${GEMINI_BASE}/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = err.error?.message || response.statusText;
    throw new Error(`Gemini API error: ${msg}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (typeof text !== 'string') {
    throw new Error('Invalid response from Gemini API');
  }
  return text.trim();
}

module.exports = {
  chat,
  isAvailable,
};
