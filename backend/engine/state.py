"""
Application state — shared singletons initialized at startup.
"""
from __future__ import annotations
import sqlite3
from pathlib import Path
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from graph.engine import SkillGraph, RoadmapEngine
    from ml.matcher import EmbeddingMatcher


class AppState:
    graph: "SkillGraph" = None
    roadmap_engine: "RoadmapEngine" = None
    matcher: "EmbeddingMatcher" = None
    db: sqlite3.Connection = None


state = AppState()
