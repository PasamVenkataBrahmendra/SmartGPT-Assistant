from typing import List, Tuple


def build_rag_prompt(question: str, context_chunks: List[Tuple[str, float]]) -> str:
    if not context_chunks:
        return f"Answer this question:\n\n{question}"

    context = "\n\n".join([c[0] for c in context_chunks])

    return f"""
Use the following context to answer the question.

Context:
{context}

Question:
{question}

Answer:
"""


def generate_answer(question: str, context_chunks: List[Tuple[str, float]]) -> str:
    """
    Temporary working version (NO AI yet).
    This avoids crashes and confirms RAG pipeline works.
    """

    if not context_chunks:
        return "No relevant information found in the uploaded document."

    # Take top 2 chunks only (avoid overload)
    top_chunks = context_chunks[:2]

    context = "\n\n".join([c[0] for c in top_chunks])

    # Limit size to avoid slow response
    context = context[:500]

    return f"""
Answer (from document):

{context}

(Note: This is a basic response. Next step is to integrate Groq for intelligent answers.)
"""