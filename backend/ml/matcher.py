"""
Skill Matching Engine — SkillMap
Uses sentence embeddings (sentence-transformers/PyTorch) for semantic similarity matching.
Falls back to TF-IDF cosine similarity if torch is not available.
ML is ONLY used for search matching — NOT roadmap generation.
"""
from __future__ import annotations
import json
import math
import re
import hashlib
import sqlite3
from pathlib import Path
from collections import defaultdict
from typing import Any


# ──────────────────────────────────────────────
# TF-IDF fallback matcher (pure Python, no deps)
# ──────────────────────────────────────────────

def tokenize(text: str) -> list[str]:
    return re.findall(r"[a-z]+", text.lower())


def build_tfidf_index(skills: list[dict]) -> dict:
    """Build TF-IDF index for skill title+description+tags corpus."""
    docs = {}
    for s in skills:
        text = f"{s['title']} {s['title']} {s.get('description', '')} {' '.join(s.get('career_tags', []))}"
        docs[s["id"]] = tokenize(text)

    # IDF
    N = len(docs)
    df = defaultdict(int)
    for tokens in docs.values():
        for t in set(tokens):
            df[t] += 1
    idf = {t: math.log((N + 1) / (cnt + 1)) + 1 for t, cnt in df.items()}

    # TF-IDF vectors
    vectors = {}
    for doc_id, tokens in docs.items():
        tf = defaultdict(int)
        for t in tokens:
            tf[t] += 1
        vec = {t: (c / len(tokens)) * idf.get(t, 0) for t, c in tf.items()}
        # L2 normalize
        norm = math.sqrt(sum(v * v for v in vec.values())) or 1.0
        vectors[doc_id] = {t: v / norm for t, v in vec.items()}

    return {"idf": idf, "vectors": vectors, "skills": {s["id"]: s for s in skills}}


def tfidf_search(query: str, index: dict, top_k: int = 5) -> list[dict]:
    """Return top-k skills by TF-IDF cosine similarity."""
    idf = index["idf"]
    vectors = index["vectors"]
    skills_map = index["skills"]

    tokens = tokenize(query)
    tf = defaultdict(int)
    for t in tokens:
        tf[t] += 1
    norm = len(tokens) or 1
    q_vec = {t: (c / norm) * idf.get(t, 0) for t, c in tf.items()}
    q_norm = math.sqrt(sum(v * v for v in q_vec.values())) or 1.0
    q_vec = {t: v / q_norm for t, v in q_vec.items()}

    scores = []
    for doc_id, d_vec in vectors.items():
        score = sum(q_vec.get(t, 0) * d_vec.get(t, 0) for t in q_vec)
        scores.append((doc_id, score))

    scores.sort(key=lambda x: -x[1])
    results = []
    for doc_id, score in scores[:top_k]:
        skill = skills_map[doc_id]
        results.append({
            "id": doc_id,
            "title": skill["title"],
            "category": skill.get("category", ""),
            "score": round(score, 4),
            "match_method": "tfidf",
        })
    return results


# ──────────────────────────────────────────────
# PyTorch / sentence-transformers matcher
# ──────────────────────────────────────────────

class EmbeddingMatcher:
    """Semantic skill matcher using sentence embeddings.
    Falls back to TF-IDF if PyTorch is unavailable.
    """

    MODEL_NAME = "all-MiniLM-L6-v2"
    MODEL_HASH = hashlib.md5(MODEL_NAME.encode()).hexdigest()[:8]

    def __init__(self, skills: list[dict], db_conn: sqlite3.Connection | None = None):
        self.skills = skills
        self.db_conn = db_conn
        self._tfidf_index = None
        self._torch_available = False
        self._embeddings = None  # numpy array (N, dim)
        self._skill_ids = [s["id"] for s in skills]
        self._skill_map = {s["id"]: s for s in skills}

        self._init()

    def _init(self):
        try:
            import torch  # noqa: F401
            from sentence_transformers import SentenceTransformer
            import numpy as np

            self._torch_available = True
            self._model = SentenceTransformer(self.MODEL_NAME)
            self._np = np

            # Try to load cached embeddings
            if self.db_conn:
                from .database import get_all_embeddings
                cached = get_all_embeddings(self.db_conn, self.MODEL_HASH)
                if len(cached) == len(self.skills):
                    vecs = []
                    for sid in self._skill_ids:
                        vecs.append(np.frombuffer(cached[sid], dtype=np.float32))
                    self._embeddings = np.vstack(vecs)
                    return

            self._precompute_embeddings()

        except ImportError:
            # Fall back to TF-IDF
            self._tfidf_index = build_tfidf_index(self.skills)

    def _precompute_embeddings(self):
        import numpy as np
        texts = [
            f"{s['title']} {s.get('description', '')} {' '.join(s.get('career_tags', []))}"
            for s in self.skills
        ]
        self._embeddings = self._model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)

        # Cache to DB
        if self.db_conn:
            from .database import store_embedding
            for i, sid in enumerate(self._skill_ids):
                store_embedding(
                    self.db_conn, sid,
                    self._embeddings[i].astype(np.float32).tobytes(),
                    self.MODEL_HASH
                )

    def search(self, query: str, top_k: int = 5) -> list[dict]:
        if not self._torch_available or self._embeddings is None:
            return tfidf_search(query, self._tfidf_index, top_k)

        import numpy as np
        q_emb = self._model.encode([query], convert_to_numpy=True, normalize_embeddings=True)
        scores = (self._embeddings @ q_emb.T).flatten()
        top_indices = np.argsort(scores)[::-1][:top_k]

        results = []
        for idx in top_indices:
            sid = self._skill_ids[int(idx)]
            skill = self._skill_map[sid]
            results.append({
                "id": sid,
                "title": skill["title"],
                "category": skill.get("category", ""),
                "score": float(round(scores[int(idx)], 4)),
                "match_method": "embedding",
            })
        return results

    def exact_match(self, query: str) -> str | None:
        """Return exact skill ID if query matches a skill title exactly."""
        q = query.lower().strip()
        for skill in self.skills:
            if skill["title"].lower() == q or skill["id"].lower() == q:
                return skill["id"]
        return None
