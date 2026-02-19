/**
 * Ollama AI Service - Free, local AI. No API key required.
 * Install: https://ollama.com
 * Run: ollama pull llama3.2
 */

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

const MAX_HISTORY_MESSAGES = 20;

function isAvailable() {
  return true;
}

/**
 * Build messages array for multi-turn conversation.
 * Ollama uses { role: 'user'|'assistant', content: string }
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
 * Chat with Ollama. Free, runs locally.
 */
async function chat(message, history = []) {
  const messages = buildMessages(history, message);

  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages,
      stream: false,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      response.status === 404
        ? `Ollama model "${OLLAMA_MODEL}" not found. Run: ollama pull ${OLLAMA_MODEL}`
        : `Ollama error: ${text || response.statusText}`
    );
  }

  const data = await response.json();
  const text = data?.message?.content;

  if (typeof text !== 'string') {
    throw new Error('Invalid response from Ollama');
  }
  return text.trim();
}

/**
 * Check if Ollama is running and model is available
 */
async function checkHealth() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${OLLAMA_URL}/api/tags`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return false;
    const data = await res.json();
    return data.models?.some((m) => m.name?.startsWith(OLLAMA_MODEL));
  } catch {
    return false;
  }
}

module.exports = {
  chat,
  isAvailable,
  checkHealth,
};
