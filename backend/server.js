const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth');
const groq = require('./services/groq');
const ollama = require('./services/ollama');

const app = express();
const PORT = process.env.PORT || 5000;
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Middleware
app.use(cors());
app.use(express.json());

// Auth routes (public)
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
  const ollamaOk = await ollama.checkHealth();
  res.json({
    status: 'ok',
    service: 'backend',
    ai: groq.isAvailable() ? 'Groq' : ollamaOk ? 'Ollama' : 'FastAPI fallback',
  });
});

// Test auth endpoint
app.get('/api/auth/test', (req, res) => {
  res.json({ message: 'Auth routes are working!' });
});

// Chat endpoint - protected, tries Groq → Ollama → FastAPI
app.post('/api/chat', authMiddleware, async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const safeHistory = Array.isArray(history) ? history : [];

    // Try Groq first (free cloud API - fastest, no installation)
    if (groq.isAvailable()) {
      try {
        const response = await groq.chat(message.trim(), safeHistory);
        return res.json({ response });
      } catch (groqError) {
        console.warn('Groq unavailable:', groqError.message);
      }
    }

    // Try Ollama (free, local - no API key needed)
    try {
      const response = await ollama.chat(message.trim(), safeHistory);
      return res.json({ response });
    } catch (ollamaError) {
      console.warn('Ollama unavailable:', ollamaError.message);
    }

    // Fallback to FastAPI AI service
    const response = await axios.post(`${AI_SERVICE_URL}/api/chat`, {
      message: message.trim(),
      history: safeHistory,
    });

    res.json({
      response: response.data.response || response.data.message,
    });
  } catch (error) {
    console.error('Chat error:', error.message);

    if (error.response) {
      return res.status(error.response.status).json({
        error: error.response.data?.error || error.response.data?.detail || 'AI service error',
      });
    }
    res.status(500).json({
      error: error.message || 'Internal server error',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  if (groq.isAvailable()) {
    console.log(`AI: Groq (free cloud) - https://console.groq.com`);
  } else {
    console.log(`AI: Ollama (free local) - https://ollama.com | Or set GROQ_API_KEY`);
  }
});
