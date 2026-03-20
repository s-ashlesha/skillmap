import { useEffect, useRef } from "react";
import type { RoadmapNode } from "../types";
import { useStore } from "../hooks/useStore";

const categoryColors: Record<string, string> = {
  tech: "#6c63ff",
  science: "#22d3ee",
  business: "#f59e0b",
  creative: "#ec4899",
  soft_skills: "#10b981",
};

const resourceIcons: Record<string, string> = {
  docs: "📄",
  tutorial: "🎓",
  book: "📚",
  course: "🎯",
  video: "▶",
  reference: "🔗",
  roadmap: "🗺",
  tool: "🔧",
  practice: "⚡",
  community: "👥",
  guide: "📖",
};

interface Props {
  node: RoadmapNode;
}

export default function Sidebar({ node }: Props) {
  const { setSelectedNode, isSpeaking, setIsSpeaking } = useStore();
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const color = categoryColors[node.category] || "#6c63ff";

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        window.speechSynthesis?.cancel();
        setIsSpeaking(false);
      }
    };
  }, [node.id, setIsSpeaking]);

  const handleTTS = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const text = `${node.title}. ${node.description} This skill has ${node.resources.length} learning resources.`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    utteranceRef.current = utterance;
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const groupedByType: Record<string, typeof node.resources> = {};
  for (const r of node.resources) {
    if (!groupedByType[r.type]) groupedByType[r.type] = [];
    groupedByType[r.type].push(r);
  }

  return (
    <aside
      className="animate-slide-up"
      style={{
        width: "100%",
        height: "100%",
        background: "var(--surface-1)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div style={{
        padding: "16px 20px",
        borderBottom: "1px solid var(--border)",
        background: `linear-gradient(135deg, ${color}10, transparent)`,
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <div>
            {/* Category */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              marginBottom: 8,
              padding: "3px 8px",
              borderRadius: 6,
              border: `1px solid ${color}40`,
              background: `${color}12`,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: color, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
                {node.category.replace("_", " ")}
              </span>
            </div>

            {/* Title */}
            <h2 style={{
              fontSize: 18,
              fontWeight: 700,
              color: "var(--text-primary)",
              fontFamily: "'Syne', sans-serif",
              lineHeight: 1.2,
            }}>
              {node.title}
            </h2>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, fontFamily: "monospace" }}>
              Step {node.order} {node.is_target && "— Goal"}
            </div>
          </div>

          {/* Close + TTS */}
          <div style={{ display: "flex", gap: 6, flexShrink: 0, marginTop: 2 }}>
            <button
              onClick={handleTTS}
              title={isSpeaking ? "Stop reading" : "Read aloud"}
              style={{
                background: isSpeaking ? `${color}25` : "var(--surface-3)",
                border: `1px solid ${isSpeaking ? color : "var(--border)"}`,
                borderRadius: 7,
                color: isSpeaking ? color : "var(--text-muted)",
                cursor: "pointer",
                width: 30, height: 30,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s",
              }}
            >
              {isSpeaking ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                </svg>
              )}
            </button>

            <button
              onClick={() => setSelectedNode(null)}
              style={{
                background: "var(--surface-3)",
                border: "1px solid var(--border)",
                borderRadius: 7,
                color: "var(--text-muted)",
                cursor: "pointer",
                width: 30, height: 30,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflow: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Description */}
        <section>
          <p style={{
            fontSize: 13.5,
            color: "var(--text-secondary)",
            lineHeight: 1.65,
          }}>
            {node.description}
          </p>
        </section>

        {/* Prerequisites */}
        {node.prerequisites.length > 0 && (
          <section>
            <h3 style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, fontWeight: 600 }}>
              Prerequisites
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {node.prerequisites.map((p) => (
                <span key={p} style={{
                  padding: "3px 8px",
                  background: "var(--surface-3)",
                  border: "1px solid var(--border)",
                  borderRadius: 5,
                  fontSize: 12,
                  color: "var(--text-secondary)",
                  fontFamily: "monospace",
                }}>
                  {p.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Career Alignment */}
        {node.career_tags.length > 0 && (
          <section>
            <h3 style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, fontWeight: 600 }}>
              Career Paths
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {node.career_tags.map((tag) => (
                <span key={tag} style={{
                  padding: "3px 10px",
                  background: `${color}12`,
                  border: `1px solid ${color}30`,
                  borderRadius: 5,
                  fontSize: 12,
                  color,
                  textTransform: "capitalize",
                }}>
                  {tag.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Resources */}
        {node.resources.length > 0 && (
          <section>
            <h3 style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
              Learning Resources
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {node.resources.map((r) => (
                <a
                  key={r.url}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 12px",
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    textDecoration: "none",
                    transition: "all 0.15s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = `${color}60`;
                    (e.currentTarget as HTMLElement).style.background = "var(--surface-3)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                    (e.currentTarget as HTMLElement).style.background = "var(--surface-2)";
                  }}
                >
                  <span style={{ fontSize: 14, flexShrink: 0 }}>
                    {resourceIcons[r.type] || "🔗"}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {r.title}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 1 }}>
                      {r.type}
                    </div>
                  </div>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ color: "var(--text-muted)", flexShrink: 0 }}>
                    <path d="M2 8L8 2M8 2H4M8 2V6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </aside>
  );
}
