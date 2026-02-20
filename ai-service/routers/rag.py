"""
RAG API: upload PDF, ask questions.
"""
from fastapi import APIRouter, File, HTTPException, UploadFile

from schemas.rag import RAGAskRequest, RAGAskResponse, RAGUploadResponse
from services.document_processor import process_pdf_bytes
from services.retrieval import add_document, retrieve, get_all_doc_ids
from services.rag_generator import generate_answer


router = APIRouter(prefix="/api/rag", tags=["RAG"])


@router.post("/upload", response_model=RAGUploadResponse)
async def upload_pdf(file: UploadFile = File(..., description="PDF file to index")):
    """
    Upload a PDF document. Text is extracted, chunked, and indexed for RAG.
    """
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="File must be a PDF")

    try:
        contents = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read file: {e}")

    if not contents:
        raise HTTPException(status_code=400, detail="File is empty")

    try:
        doc_id, chunks = process_pdf_bytes(contents, file.filename or "document.pdf")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF processing failed: {e}")

    add_document(doc_id, chunks)
    return RAGUploadResponse(
        document_id=doc_id,
        filename=file.filename or "document.pdf",
        chunks_count=len(chunks),
        status="success",
        message="PDF processed and indexed successfully",
    )


@router.post("/ask", response_model=RAGAskResponse)
async def ask(request: RAGAskRequest):
    question = request.question.strip()

    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    top_k = request.top_k

    chunks_with_scores = retrieve(question, top_k=top_k)

    print("Question:", question)
    print("Retrieved chunks:", len(chunks_with_scores))

    if not chunks_with_scores:
        return RAGAskResponse(
            answer="No relevant information found in uploaded documents.",
            sources=[],
            status="success"
        )

    sources = [
        c[0][:300] + ("..." if len(c[0]) > 300 else "")
        for c in chunks_with_scores
    ]

    answer = generate_answer(question, chunks_with_scores)

    return RAGAskResponse(
        answer=answer,
        sources=sources,
        status="success"
    )


@router.get("/documents")
async def list_documents():
    """List IDs of currently indexed documents."""
    return {"document_ids": get_all_doc_ids(), "count": len(get_all_doc_ids())}
