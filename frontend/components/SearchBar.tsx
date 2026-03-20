import { useState, useRef, useEffect, useCallback } from "react";
import { useStore } from "../hooks/useStore";
import { searchSkills, getRoadmap } from "../hooks/api";
import type { SearchResult } from "../types";

export default function SearchBar() {
  const {
    query, setQuery,
    searchResults, setSearchResults,
    isSearching, setIsSearching,
    level,
    setRoadmap, setIsLoadingRoadmap, setRoadmapError,
    setSelectedNode, reset,
  } = useStore();

  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setSearchResults([]);
      setOpen(false);
      return;
    }
    setIsSearching(true);
    try {
      const results = await searchSkills(q, 8);
      setSearchResults(results);
      setOpen(results.length > 0);
      setActiveIdx(-1);
    } catch {
      setSearchResults([]);
      setOpen(false);
    } finally {
      setIsSearching(false);
    }
  }, [setSearchResults, setIsSearching]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleSearch(val), 180);
  };

  const selectSkill = useCallback(async (result: SearchResult) => {
    setQuery(result.title);
    setOpen(false);
    setSelectedNode(null);
    setIsLoadingRoadmap(true);
    setRoadmapError(null);
    try {
      const roadmap = await getRoadmap(result.id, level);
      setRoadmap(roadmap);
    } catch (err: any) {
      setRoadmapError(err.message || "Failed to load roadmap");
      setRoadmap(null);
    } finally {
      setIsLoadingRoadmap(false);
    }
  }, [level, setQuery, setSelectedNode, setIsLoadingRoadmap, setRoadmapError, setRoadmap]);

  const handleDone = useCallback(() => {
    if (activeIdx >= 0 && searchResults[activeIdx]) {
      selectSkill(searchResults[activeIdx]);
    } else if (searchResults.length > 0) {
      selectSkill(searchResults[0]);
    }
  }, [activeIdx, searchResults, selectSkill]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "Enter") {
        e.preventDefault();
        handleDone();
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, searchResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleDone();
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIdx(-1);
    }
  };

  const handleClear = () => {
    reset();
    inputRef.current?.focus();
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const categoryColors: Record<string, string> = {
    tech: "#6c63ff",
    science: "#22d3ee",
    business: "#f59e0b",
    creative: "#ec4899",
    soft_skills: "#10b981",
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Input */}
      <div
        style={{
          background: "var(--surface-2)",
          border: `1px solid ${open ? "var(--accent)" : "var(--border)"}`,
          borderRadius: open ? "12px 12px 0 0" : "12px",
          transition: "border-color 0.2s, border-radius 0.1s",
          boxShadow: open ? "var(--shadow-glow)" : "none",
        }}
        className="flex items-center gap-3 px-4 py-3"
      >
        {/* Search icon */}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: "var(--text-muted)", flexShrink: 0 }}>
          <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>

        <input
          ref={inputRef}
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query && searchResults.length > 0 && setOpen(true)}
          placeholder="Search a skill — Python, Machine Learning, Product Management..."
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            color: "var(--text-primary)",
            fontSize: "15px",
            flex: 1,
            fontFamily: "inherit",
          }}
          spellCheck={false}
          autoComplete="off"
          aria-label="Search skills"
          aria-expanded={open}
          aria-autocomplete="list"
        />

        {/* Loading spinner */}
        {isSearching && (
          <svg width="16" height="16" viewBox="0 0 24 24" style={{ color: "var(--accent)", flexShrink: 0, animation: "spin 0.8s linear infinite" }}>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="60" strokeDashoffset="15"/>
          </svg>
        )}

        {/* Right arrow (Go/Enter) button */}
        {query && !isSearching && (
          <button
            onClick={handleDone}
            title="Go to roadmap"
            style={{
              background: "var(--surface-3)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              color: "var(--text-secondary)",
              cursor: "pointer",
              padding: "4px 8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
              (e.currentTarget as HTMLElement).style.background = "var(--surface-1)";
              (e.currentTarget as HTMLElement).style.color = "var(--accent)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
              (e.currentTarget as HTMLElement).style.background = "var(--surface-3)";
              (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && searchResults.length > 0 && (
        <div
          ref={dropdownRef}
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "var(--surface-2)",
            border: "1px solid var(--accent)",
            borderTop: "1px solid var(--border)",
            borderRadius: "0 0 12px 12px",
            zIndex: 100,
            overflow: "hidden",
            boxShadow: "0 16px 40px rgba(0,0,0,0.4)",
          }}
          role="listbox"
        >
          {searchResults.map((result, idx) => (
            <button
              key={result.id}
              role="option"
              aria-selected={idx === activeIdx}
              onClick={() => selectSkill(result)}
              onMouseEnter={() => setActiveIdx(idx)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                width: "100%",
                padding: "10px 16px",
                background: idx === activeIdx ? "var(--surface-3)" : "transparent",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                transition: "background 0.12s",
                borderBottom: idx < searchResults.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              {/* Category dot */}
              <span style={{
                width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                background: categoryColors[result.category] || "#fff",
                boxShadow: `0 0 6px ${categoryColors[result.category] || "#fff"}80`,
              }} />
              <span style={{ color: "var(--text-primary)", fontSize: "14px", flex: 1 }}>
                {result.title}
              </span>
              <span style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                textTransform: "capitalize",
                fontFamily: "monospace",
              }}>
                {result.category.replace("_", " ")}
              </span>
              {result.score >= 0.98 && (
                <span style={{
                  fontSize: "10px",
                  padding: "2px 6px",
                  background: "rgba(108,99,255,0.15)",
                  color: "#8b85ff",
                  borderRadius: "4px",
                  border: "1px solid rgba(108,99,255,0.2)",
                }}>
                  exact
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
