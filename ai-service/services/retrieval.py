"""
Retrieval: store document chunks and retrieve by relevance (BM25).
"""
from typing import List, Dict, Tuple
from rank_bm25 import BM25Okapi

# In-memory store: doc_id -> list of chunks
_doc_chunks: Dict[str, List[str]] = {}

# Flat corpus for BM25
_corpus: List[str] = []
_corpus_meta: List[Tuple[str, int]] = []  # (doc_id, chunk_index)

_bm25 = None


def _rebuild_bm25():
    """Rebuild BM25 index from corpus."""
    global _bm25

    if not _corpus:
        _bm25 = None
        return

    tokenized = [doc.split() for doc in _corpus]
    _bm25 = BM25Okapi(tokenized)


def add_document(doc_id: str, chunks: List[str]) -> None:
    """Index a document's chunks for retrieval."""
    global _corpus, _corpus_meta

    _doc_chunks[doc_id] = chunks

    for i, c in enumerate(chunks):
        _corpus.append(c)
        _corpus_meta.append((doc_id, i))

    _rebuild_bm25()


def remove_document(doc_id: str) -> None:
    """Remove a document from the index."""
    global _corpus, _corpus_meta

    if doc_id not in _doc_chunks:
        return

    _doc_chunks.pop(doc_id)

    # rebuild corpus
    _corpus = []
    _corpus_meta = []

    for did, chunks_list in _doc_chunks.items():
        for i, c in enumerate(chunks_list):
            _corpus.append(c)
            _corpus_meta.append((did, i))

    _rebuild_bm25()


def retrieve(question: str, top_k: int = 5):
    """Retrieve top-k relevant chunks."""
    global _bm25

    if not _corpus:
        print("No corpus available")
        return []

    if _bm25 is None:
        _rebuild_bm25()

    tokenized_query = question.split()
    scores = _bm25.get_scores(tokenized_query)

    top_indices = sorted(range(len(scores)), key=lambda i: -scores[i])[:top_k]

    print("Corpus size:", len(_corpus))
    print("Top scores:", [scores[i] for i in top_indices])

    return [(_corpus[i], float(scores[i])) for i in top_indices]


def get_all_doc_ids() -> List[str]:
    return list(_doc_chunks.keys())