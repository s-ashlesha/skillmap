import { useStore } from "../hooks/useStore";
import { getRoadmap } from "../hooks/api";

const FEATURED = [
  { id: "machine_learning", label: "Machine Learning" },
  { id: "full_stack", label: "Full Stack Dev" },
  { id: "data_science", label: "Data Science" },
  { id: "devops", label: "DevOps" },
  { id: "kubernetes", label: "Kubernetes" },
  { id: "entrepreneurship", label: "Entrepreneurship" },
  { id: "ui_ux", label: "UI/UX Design" },
  { id: "system_design", label: "System Design" },
];

export default function EmptyState() {
  const { level, setRoadmap, setIsLoadingRoadmap, setRoadmapError, setQuery } = useStore();

  const loadSkill = async (id: string, title: string) => {
    setQuery(title);
    setIsLoadingRoadmap(true);
    setRoadmapError(null);
    try {
      const roadmap = await getRoadmap(id, level);
      setRoadmap(roadmap);
    } catch (err: any) {
      setRoadmapError(err.message);
    } finally {
      setIsLoadingRoadmap(false);
    }
  };



  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      padding: "40px 24px",
      overflowY: "auto",
    }}>
      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div style={{
          fontSize: 11, color: "var(--text-muted)",
          textTransform: "uppercase", letterSpacing: "0.2em",
          marginBottom: 16, fontFamily: "monospace",
        }}>
          Knowledge Graph Engine
        </div>
        <h1 className="hero-title" style={{
          fontSize: "clamp(32px, 5vw, 52px)",
          fontWeight: 800,
          fontFamily: "'Syne', sans-serif",
          color: "var(--text-primary)",
          lineHeight: 1.1,
          marginBottom: 16,
          textAlign: "center",
        }}>
          Map your learning<br />
          <span style={{
            background: "linear-gradient(135deg, #6c63ff, #22d3ee)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            path precisely
          </span>
        </h1>
        <p className="hero-subtitle" style={{
          fontSize: "clamp(14px, 2vw, 16px)",
          color: "var(--text-secondary)",
          maxWidth: 480,
          lineHeight: 1.6,
          margin: "0 auto",
          textAlign: "center",
        }}>
          Deterministic prerequisite graphs for 48 skills — no AI, no randomness.
          Every roadmap is reproducible, ordered by Kahn&apos;s topological sort.
        </p>
      </div>

      {/* Featured skills */}
      <div style={{ marginBottom: 40, width: "100%", maxWidth: 760 }}>
        <div style={{
          fontSize: 11, color: "var(--text-muted)",
          textTransform: "uppercase", letterSpacing: "0.12em",
          marginBottom: 12, textAlign: "center",
        }}>
          Popular paths
        </div>
        <div style={{
          display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center",
        }}>
          {FEATURED.map((f) => (
            <button
              key={f.id}
              onClick={() => loadSkill(f.id, f.label)}
              style={{
                padding: "8px 16px",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                color: "var(--text-secondary)",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "#6c63ff60";
                (e.currentTarget as HTMLElement).style.color = "#8b85ff";
                (e.currentTarget as HTMLElement).style.background = "rgba(108,99,255,0.08)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                (e.currentTarget as HTMLElement).style.background = "var(--surface-2)";
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>


    </div>
  );
}
