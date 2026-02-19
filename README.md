# Full-Stack AI Chatbot Project

A full-stack AI chatbot application with React frontend, Node.js Express backend, and Python FastAPI AI service.

## Project Structure

```
.
├── frontend/          # React frontend application
├── backend/           # Node.js Express backend API
├── ai-service/        # Python FastAPI AI service
└── README.md
```

## Architecture Overview

```
┌─────────────┐      HTTP/REST      ┌──────────────┐      HTTP/REST      ┌─────────────┐
│   React     │ ──────────────────> │   Express    │ ──────────────────> │   FastAPI   │
│  Frontend   │                      │   Backend    │                      │ AI Service  │
└─────────────┘                      └──────────────┘                      └─────────────┘
     Port 3000                            Port 5000                            Port 8000
```

## Setup Instructions

### 1. Frontend (React)

```bash
cd frontend
npm install
npm start
```

Runs on `http://localhost:3000`

### 2. Backend (Node.js Express)

```bash
cd backend
npm install
npm start
```

Runs on `http://localhost:5000`

### 3. AI Service (Python FastAPI)

```bash
cd ai-service
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

Runs on `http://localhost:8000`

## How They Connect

1. **Frontend → Backend**: React app makes HTTP requests to Express backend API (`http://localhost:5000/api/chat`)
2. **Backend → AI**: Express tries **Groq** (free cloud) → **Ollama** (free local) → FastAPI
3. **Response Flow**: Groq/Ollama/FastAPI → Express → React

### AI Options (All Free!)

**Option 1: Groq (Recommended - Fastest)**
- Free cloud API, very fast responses
- Get free API key: https://console.groq.com
- Add `GROQ_API_KEY` to `backend/.env`
- No installation needed!

**Option 2: Ollama (Local)**
- Free, runs on your computer
- Install: https://ollama.com
- Run: `ollama pull llama3.2`
- No API key needed

**Option 3: FastAPI (Fallback)**
- Python service with placeholder responses
- Works if neither Groq nor Ollama is configured

## Authentication

The app uses JWT-based authentication:

- **Sign up** at `/signup` to create an account
- **Log in** at `/login` with email and password
- Protected routes require a valid JWT token
- Chat history is stored per user in `localStorage`

### Auth API Endpoints
- `POST /api/auth/signup` - Register new user (email, password, optional name)
- `POST /api/auth/login` - Sign in (email, password)
- `GET /api/auth/me` - Get current user (requires Bearer token)

## API Endpoints

### Express Backend
- `POST /api/chat` - Send message to chatbot (requires auth)
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### FastAPI AI Service
- `POST /api/chat` - Process chat message with AI
- `GET /health` - Health check endpoint

## Environment Variables

### Backend (.env)
```
AI_SERVICE_URL=http://localhost:8000
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Groq - Free cloud AI (recommended)
GROQ_API_KEY=your-groq-api-key-here
GROQ_MODEL=llama-3.1-8b-instant

# Ollama - Free local AI (alternative)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

### AI Service (.env)
```
PORT=8000
```

## Development Notes

- Frontend uses Axios for HTTP requests
- Backend uses CORS middleware to allow frontend requests
- AI Service uses FastAPI with async support
- All services can run concurrently for development
