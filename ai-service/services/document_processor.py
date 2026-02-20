"""
Document processing: PDF loading, text extraction, chunking.
"""
import re
import uuid
from pathlib import Path
from typing import List, Tuple

from pypdf import PdfReader


CHUNK_SIZE = 500
CHUNK_OVERLAP = 100


def extract_text_from_pdf(file_path: str) -> str:
    """Extract raw text from a PDF file."""
    reader = PdfReader(file_path)
    parts = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            parts.append(text)
    return "\n".join(parts)


def extract_text_from_bytes(pdf_bytes: bytes) -> str:
    """Extract raw text from PDF bytes (in-memory)."""
    from io import BytesIO
    reader = PdfReader(BytesIO(pdf_bytes))
    parts = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            parts.append(text)
    return "\n".join(parts)


def normalize_text(text: str) -> str:
    text = re.sub(r"\s+", " ", text)
    text = text.replace("\x00", "")
    return text.strip()


def chunk_text(
    text: str,
    chunk_size: int = CHUNK_SIZE,
    overlap: int = CHUNK_OVERLAP,
) -> List[str]:
    """
    Split text into overlapping chunks for retrieval.
    Tries to break on sentence boundaries when possible.
    """
    text = normalize_text(text)
    if not text:
        return []

    chunks = []
    start = 0
    text_len = len(text)

    while start < text_len:
        end = start + chunk_size
        if end >= text_len:
            chunk = text[start:].strip()
            if chunk:
                chunks.append(chunk)
            break

        # Prefer breaking at sentence end
        segment = text[start:end]
        last_period = segment.rfind(". ")
        last_newline = segment.rfind("\n")
        break_at = max(last_period, last_newline)
        if break_at > chunk_size // 2:
            end = start + break_at + 1
            chunk = text[start:end].strip()
        else:
            chunk = segment.strip()

        if chunk:
            chunks.append(chunk)
        start = end - overlap

    return chunks


def process_pdf_bytes(pdf_bytes: bytes, filename: str) -> Tuple[str, List[str]]:
    """
    Process PDF bytes: extract text and chunk.
    Returns (document_id, list of chunk texts).
    """
    raw = extract_text_from_bytes(pdf_bytes)
    if not raw or not raw.strip():
        raise ValueError("PDF contains no extractable text")
    chunks = chunk_text(raw)
    if not chunks:
        raise ValueError("PDF produced no text chunks")
    doc_id = str(uuid.uuid4())
    return doc_id, chunks
