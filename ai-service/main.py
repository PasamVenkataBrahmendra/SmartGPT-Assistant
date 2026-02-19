from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="AI Chatbot Service", version="1.0.0")

# CORS middleware to allow requests from frontend and backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response models
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []

class ChatResponse(BaseModel):
    response: str
    status: str = "success"

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "ai-service"}

# Chat endpoint - processes messages with AI
@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Process chat message and return AI response.
    
    This is a placeholder implementation. Replace with actual AI model integration:
    - OpenAI API
    - Hugging Face models
    - Custom ML models
    - etc.
    """
    try:
        user_message = request.message.strip()
        
        if not user_message:
            raise HTTPException(status_code=400, detail="Message cannot be empty")

        # Pass conversation history for multi-turn context
        history = [{"role": m.role, "content": m.content} for m in request.history] if request.history else []
        ai_response = generate_ai_response(user_message, history)
        
        return ChatResponse(
            response=ai_response,
            status="success"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing message: {str(e)}")

def generate_ai_response(message: str, history: list[dict] = None) -> str:
    """
    Placeholder function for AI response generation.
    
    Receives full conversation history for multi-turn context.
    Replace with actual AI model calls:
    - OpenAI: openai.ChatCompletion.create(messages=[...])
    - Hugging Face: pipeline with conversation context
    - Custom models: your_model.predict(history + message)
    """
    history = history or []
    message_lower = message.lower()
    
    # Multi-turn: reference prior context from history
    prior_topics = []
    if history:
        for msg in history[-6:]:  # last 6 messages for context
            prior_topics.append(msg.get("content", "")[:100])
    context = " ".join(prior_topics).lower() if prior_topics else ""
    
    if "hello" in message_lower or "hi" in message_lower:
        return "Hello! How can I help you today?"
    elif "how are you" in message_lower:
        return "I'm doing well, thank you for asking! How can I assist you?"
    elif "bye" in message_lower or "goodbye" in message_lower:
        return "Goodbye! Have a great day!"
    elif "remember" in message_lower or "what did i say" in message_lower or "earlier" in message_lower:
        if context:
            return f"From our conversation, you mentioned: \"{prior_topics[-1][:80]}...\" I'll keep that in mind!"
        return "I don't have any prior context from this chat yet. Tell me something and I'll remember it!"
    else:
        return f"I received your message: '{message}'. This is a placeholder response. Please integrate an actual AI model to generate intelligent responses."

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
