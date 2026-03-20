"""
Database layer — SQLite storage for skills, roadmaps, and embeddings cache.
"""
import sqlite3
import json
import hashlib
from pathlib import Path
from typing import Any


DB_PATH = Path(__file__).parent.parent / "data" / "skillmap.db"


def get_connection() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db() -> None:
    """Initialize all tables."""
    conn = get_connection()
    with conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS skills (
                id          TEXT PRIMARY KEY,
                title       TEXT NOT NULL,
                category    TEXT NOT NULL,
                description TEXT NOT NULL,
                resources   TEXT NOT NULL,  -- JSON
                career_tags TEXT NOT NULL,  -- JSON
                prerequisites TEXT NOT NULL -- JSON
            );

            CREATE TABLE IF NOT EXISTS skill_edges (
                prereq_id   TEXT NOT NULL,
                skill_id    TEXT NOT NULL,
                PRIMARY KEY (prereq_id, skill_id),
                FOREIGN KEY (prereq_id) REFERENCES skills(id),
                FOREIGN KEY (skill_id)  REFERENCES skills(id)
            );

            CREATE TABLE IF NOT EXISTS roadmap_cache (
                cache_key   TEXT PRIMARY KEY,
                skill_id    TEXT NOT NULL,
                level       TEXT NOT NULL,
                roadmap_json TEXT NOT NULL,
                created_at  INTEGER NOT NULL DEFAULT (strftime('%s','now'))
            );

            CREATE TABLE IF NOT EXISTS embeddings (
                skill_id    TEXT PRIMARY KEY,
                embedding   BLOB NOT NULL,   -- numpy array bytes
                model_hash  TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
            CREATE INDEX IF NOT EXISTS idx_edges_skill ON skill_edges(skill_id);
            CREATE INDEX IF NOT EXISTS idx_edges_prereq ON skill_edges(prereq_id);
            CREATE INDEX IF NOT EXISTS idx_cache_skill ON roadmap_cache(skill_id);
        """)
    conn.close()


def load_skills_to_db(graph) -> None:
    """Populate DB from SkillGraph object."""
    conn = get_connection()
    with conn:
        conn.execute("DELETE FROM skill_edges")
        conn.execute("DELETE FROM skills")

        for node in graph.nodes.values():
            conn.execute(
                "INSERT OR REPLACE INTO skills VALUES (?,?,?,?,?,?,?)",
                (
                    node.id,
                    node.title,
                    node.category,
                    node.description,
                    json.dumps(node.resources),
                    json.dumps(node.career_tags),
                    json.dumps(node.prerequisites),
                )
            )

        for src, targets in graph.adj.items():
            for tgt in targets:
                conn.execute(
                    "INSERT OR IGNORE INTO skill_edges VALUES (?,?)",
                    (src, tgt)
                )
    conn.close()


def get_all_skills(conn: sqlite3.Connection) -> list[dict]:
    rows = conn.execute(
        "SELECT id, title, category, career_tags FROM skills ORDER BY category, title"
    ).fetchall()
    result = []
    for row in rows:
        result.append({
            "id": row["id"],
            "title": row["title"],
            "category": row["category"],
            "career_tags": json.loads(row["career_tags"]),
        })
    return result


def get_skill(conn: sqlite3.Connection, skill_id: str) -> dict | None:
    row = conn.execute("SELECT * FROM skills WHERE id=?", (skill_id,)).fetchone()
    if not row:
        return None
    return {
        "id": row["id"],
        "title": row["title"],
        "category": row["category"],
        "description": row["description"],
        "resources": json.loads(row["resources"]),
        "career_tags": json.loads(row["career_tags"]),
        "prerequisites": json.loads(row["prerequisites"]),
    }


def cache_roadmap(conn: sqlite3.Connection, skill_id: str, level: str, roadmap: dict) -> None:
    key = hashlib.sha256(f"{skill_id}:{level}".encode()).hexdigest()
    conn.execute(
        "INSERT OR REPLACE INTO roadmap_cache(cache_key, skill_id, level, roadmap_json) VALUES (?,?,?,?)",
        (key, skill_id, level, json.dumps(roadmap))
    )
    conn.commit()


def get_cached_roadmap(conn: sqlite3.Connection, skill_id: str, level: str) -> dict | None:
    key = hashlib.sha256(f"{skill_id}:{level}".encode()).hexdigest()
    row = conn.execute(
        "SELECT roadmap_json FROM roadmap_cache WHERE cache_key=?", (key,)
    ).fetchone()
    if row:
        return json.loads(row["roadmap_json"])
    return None


def store_embedding(conn: sqlite3.Connection, skill_id: str, embedding_bytes: bytes, model_hash: str) -> None:
    conn.execute(
        "INSERT OR REPLACE INTO embeddings(skill_id, embedding, model_hash) VALUES (?,?,?)",
        (skill_id, embedding_bytes, model_hash)
    )
    conn.commit()


def get_all_embeddings(conn: sqlite3.Connection, model_hash: str) -> dict[str, bytes]:
    rows = conn.execute(
        "SELECT skill_id, embedding FROM embeddings WHERE model_hash=?", (model_hash,)
    ).fetchall()
    return {row["skill_id"]: row["embedding"] for row in rows}
