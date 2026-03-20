import { create } from "zustand";
import type { Roadmap, RoadmapNode, Level, SearchResult } from "../types";

interface SkillMapStore {
  // Search
  query: string;
  searchResults: SearchResult[];
  isSearching: boolean;
  setQuery: (q: string) => void;
  setSearchResults: (r: SearchResult[]) => void;
  setIsSearching: (v: boolean) => void;

  // Roadmap
  roadmap: Roadmap | null;
  history: (Roadmap | null)[];
  isLoadingRoadmap: boolean;
  roadmapError: string | null;
  setRoadmap: (r: Roadmap | null) => void;
  goBack: () => void;
  setIsLoadingRoadmap: (v: boolean) => void;
  setRoadmapError: (e: string | null) => void;

  // Selected node (sidebar)
  selectedNode: RoadmapNode | null;
  setSelectedNode: (n: RoadmapNode | null) => void;

  level: Level;
  setLevel: (l: Level) => void;


  // TTS
  isSpeaking: boolean;
  setIsSpeaking: (v: boolean) => void;

  // Reset
  reset: () => void;
}

export const useStore = create<SkillMapStore>((set, get) => ({
  query: "",
  searchResults: [],
  isSearching: false,
  setQuery: (q) => set({ query: q }),
  setSearchResults: (r) => set({ searchResults: r }),
  setIsSearching: (v) => set({ isSearching: v }),

  roadmap: null,
  history: [],
  isLoadingRoadmap: false,
  roadmapError: null,
  setRoadmap: (r) => {
    const current = get().roadmap;
    if (r?.skill_id === current?.skill_id && r?.level === current?.level) return;
    set((s) => ({
      roadmap: r,
      level: r?.level || "beginner",
      history: [...s.history, current],
      selectedNode: null,
    }));
  },
  goBack: () => {
    const history = get().history;
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    set({
      roadmap: prev,
      history: history.slice(0, -1),
      selectedNode: null,
      query: prev ? prev.skill_title : "",
    });
  },
  setIsLoadingRoadmap: (v) => set({ isLoadingRoadmap: v }),
  setRoadmapError: (e) => set({ roadmapError: e }),

  selectedNode: null,
  setSelectedNode: (n) => set({ selectedNode: n }),

  level: "beginner",
  setLevel: (l) => set({ level: l }),


  isSpeaking: false,
  setIsSpeaking: (v) => set({ isSpeaking: v }),

  reset: () => set({
    query: "",
    searchResults: [],
    roadmap: null,
    history: [],
    selectedNode: null,
    roadmapError: null,
  }),
}));
