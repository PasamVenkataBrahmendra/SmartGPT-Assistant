/**
 * Groq AI Service - Free cloud AI, very fast responses.
 * Get free API key: https://console.groq.com
 * No local installation needed!
 */

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const MAX_HISTORY_MESSAGES = 20;

function isAvailable() {
  return !!GROQ_API_KEY;
}

/**
 * Build messages array for multi-turn conversation.
 * Groq uses OpenAI-compatible format: { role: 'user'|'assistant', content: string }
 */
function buildMessages(history, currentMessage) {
  const messages = [];

  if (Array.isArray(history) && history.length > 0) {
    const recent = history.slice(-MAX_HISTORY_MESSAGES);
    for (const msg of recent) {
      const role = msg.role === 'assistant' ? 'assistant' : 'user';
      const content = typeof msg.content === 'string' ? msg.content : String(msg.content || '');
      if (content.trim()) {
        messages.push({ role, content });
      }
    }
  }

  messages.push({ role: 'user', content: currentMessage });
  return messages;
}

/**
 * Chat with Groq - free, fast, cloud-based.
 */
async function chat(message, history = []) {
  if (!isAvailable()) {
    throw new Error('Groq API key not configured. Get free key at https://console.groq.com');
  }

  const messages = buildMessages(history, message);

  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = err.error?.message || response.statusText;
    throw new Error(`Groq API error: ${msg}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;

  if (typeof text !== 'string') {
    throw new Error('Invalid response from Groq API');
  }
  return text.trim();
}

module.exports = {
  chat,
  isAvailable,
};
