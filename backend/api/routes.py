"""
API Routes — SkillMap
"""
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Any, Literal
import json

from engine.database import get_skill, cache_roadmap, get_cached_roadmap
from engine.state import state

router = APIRouter()


# ──────────────────────────────────────────────
# Response Models
# ──────────────────────────────────────────────

class SkillSummary(BaseModel):
    id: str
    title: str
    category: str
    career_tags: list[str]


class SearchResult(BaseModel):
    id: str
    title: str
    category: str
    score: float
    match_method: str


class ResourceItem(BaseModel):
    title: str
    url: str
    type: str


class RoadmapNode(BaseModel):
    id: str
    title: str
    category: str
    description: str
    resources: list[ResourceItem]
    career_tags: list[str]
    prerequisites: list[str]
    order: int
    is_target: bool


class RoadmapEdge(BaseModel):
    source: str
    target: str


class RoadmapResponse(BaseModel):
    skill_id: str
    skill_title: str
    level: str
    available_levels: list[str]
    total_steps: int
    nodes: list[RoadmapNode]
    edges: list[RoadmapEdge]


# ──────────────────────────────────────────────
# Endpoints
# ──────────────────────────────────────────────

@router.get("/skills/all", response_model=list[SkillSummary])
def get_all_skills_endpoint():
    """Return all supported skills, grouped by category."""
    if not state.graph:
        raise HTTPException(503, "Engine not ready")

    skills = []
    for node in state.graph.nodes.values():
        skills.append(SkillSummary(
            id=node.id,
            title=node.title,
            category=node.category,
            career_tags=node.career_tags,
        ))

    # Sort deterministically: category, then title
    skills.sort(key=lambda s: (s.category, s.title))
    return skills


@router.get("/skills/search", response_model=list[SearchResult])
def search_skills(
    q: str = Query(..., min_length=1, max_length=200, description="Search query"),
    limit: int = Query(5, ge=1, le=20),
):
    """Semantic skill search. Returns top-k matching skills."""
    if not state.matcher:
        raise HTTPException(503, "Matcher not ready")

    # Sanitize input
    q = q.strip()

    # Check for exact match first
    exact_id = state.matcher.exact_match(q)
    if exact_id:
        node = state.graph.nodes[exact_id]
        return [SearchResult(
            id=exact_id,
            title=node.title,
            category=node.category,
            score=1.0,
            match_method="exact",
        )]

    results = state.matcher.search(q, top_k=limit)
    return [SearchResult(**r) for r in results]


@router.get("/roadmap/{skill_id}", response_model=RoadmapResponse)
def get_roadmap(
    skill_id: str,
    level: Literal["beginner", "intermediate", "advanced"] = "advanced",
):
    """Generate deterministic learning roadmap for the given skill."""
    if not state.roadmap_engine:
        raise HTTPException(503, "Engine not ready")

    # Validate skill_id (prevent injection)
    skill_id = skill_id.strip().lower().replace(" ", "_")
    if not skill_id.replace("_", "").isalnum():
        raise HTTPException(400, "Invalid skill ID")

    if skill_id not in state.graph.nodes:
        raise HTTPException(404, f"Skill '{skill_id}' not found")

    # Check cache
    cached = get_cached_roadmap(state.db, skill_id, level)
    if cached:
        return RoadmapResponse(**cached)

    # Generate roadmap (deterministic)
    roadmap = state.roadmap_engine.generate(skill_id, level)

    # Cache result
    cache_roadmap(state.db, skill_id, level, roadmap)

    return RoadmapResponse(**roadmap)


@router.get("/skills/{skill_id}")
def get_skill_detail(skill_id: str):
    """Get detailed information about a single skill."""
    skill_id = skill_id.strip().lower()
    if skill_id not in state.graph.nodes:
        raise HTTPException(404, f"Skill '{skill_id}' not found")

    node = state.graph.nodes[skill_id]
    return node.to_dict()


@router.get("/skills/{skill_id}/prerequisites")
def get_prerequisites(skill_id: str):
    """Get all prerequisites for a skill (direct and transitive)."""
    skill_id = skill_id.strip().lower()
    if skill_id not in state.graph.nodes:
        raise HTTPException(404, f"Skill '{skill_id}' not found")

    subgraph = state.graph.get_subgraph(skill_id)
    ordered = subgraph.topological_sort()
    # Exclude the target itself
    prereqs = [nid for nid in ordered if nid != skill_id]

    return {
        "skill_id": skill_id,
        "prerequisites_count": len(prereqs),
        "prerequisites": prereqs,
    }
