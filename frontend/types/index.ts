export type Category = "tech" | "science" | "business" | "creative" | "soft_skills";
export type Level = "beginner" | "intermediate" | "advanced";


export interface Resource {
  title: string;
  url: string;
  type: string;
}

export interface SkillSummary {
  id: string;
  title: string;
  category: Category;
  career_tags: string[];
}

export interface SearchResult {
  id: string;
  title: string;
  category: Category;
  score: number;
  match_method: string;
}

export interface RoadmapNode {
  id: string;
  title: string;
  category: Category;
  description: string;
  resources: Resource[];
  career_tags: string[];
  prerequisites: string[];
  order: number;
  is_target: boolean;
}

export interface RoadmapEdge {
  source: string;
  target: string;
}

export interface Roadmap {
  skill_id: string;
  skill_title: string;
  level: Level;
  available_levels: Level[];
  total_steps: number;
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
}

export interface SkillDetail {
  id: string;
  title: string;
  category: Category;
  description: string;
  resources: Resource[];
  career_tags: string[];
  prerequisites: string[];
}
