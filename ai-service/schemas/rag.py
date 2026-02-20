from pydantic import BaseModel, Field
from typing import List, Optional


class RAGAskRequest(BaseModel):
    question: str = Field(..., min_length=1, description="Question to answer from uploaded documents")
    top_k: int = Field(default=5, ge=1, le=20, description="Number of document chunks to use as context")


class RAGAskResponse(BaseModel):
    answer: str
    sources: List[str] = Field(default_factory=list, description="Relevant text snippets used")
    status: str = "success"


class RAGUploadResponse(BaseModel):
    document_id: str
    filename: str
    chunks_count: int
    status: str = "success"
    message: str = "PDF processed and indexed successfully"
