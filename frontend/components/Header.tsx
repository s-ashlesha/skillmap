import { useStore } from "../hooks/useStore";
import SearchBar from "./SearchBar";

export default function Header() {
  const { roadmap, reset, goBack, history } = useStore();

  return (
    <header className="header-responsive" style={{
      background: "var(--surface-1)",
      borderBottom: "1px solid var(--border)",
      padding: "14px 24px",
      display: "flex",
      alignItems: "center",
      gap: 24,
      zIndex: 50,
      position: "relative",
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: "linear-gradient(135deg, #6c63ff, #8b85ff)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 12px rgba(108,99,255,0.4)",
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="3" cy="3" r="2" fill="white" fillOpacity="0.9"/>
            <circle cx="13" cy="3" r="2" fill="white" fillOpacity="0.7"/>
            <circle cx="8" cy="13" r="2" fill="white" fillOpacity="0.9"/>
            <circle cx="3" cy="9" r="1.5" fill="white" fillOpacity="0.5"/>
            <path d="M3 3L13 3" stroke="white" strokeWidth="1" strokeOpacity="0.4"/>
            <path d="M3 3L3 9" stroke="white" strokeWidth="1" strokeOpacity="0.4"/>
            <path d="M3 9L8 13" stroke="white" strokeWidth="1" strokeOpacity="0.4"/>
            <path d="M13 3L8 13" stroke="white" strokeWidth="1" strokeOpacity="0.4"/>
          </svg>
        </div>
        <div className="hide-mobile">
          <div style={{
            fontSize: 16, fontWeight: 700,
            fontFamily: "'Syne', sans-serif",
            color: "var(--text-primary)",
            lineHeight: 1,
          }}>
            SkillMap
          </div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.08em" }}>
            LEARNING ROADMAPS
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="search-responsive" style={{ flex: 1, minWidth: 200 }}>
        <SearchBar />
      </div>

      {/* Navigation & Controls */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>
        {/* Back Button */}
        <button
          onClick={goBack}
          disabled={history.length === 0}
          title="Go Back"
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            color: history.length === 0 ? "var(--text-muted)" : "var(--text-secondary)",
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: history.length === 0 ? "default" : "pointer",
            transition: "all 0.15s",
            opacity: history.length === 0 ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (history.length > 0) {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
              (e.currentTarget as HTMLElement).style.background = "var(--surface-3)";
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
            (e.currentTarget as HTMLElement).style.background = "var(--surface-2)";
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>

        {/* Home Button */}
        <button
          onClick={reset}
          title="Go Home"
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            color: "var(--text-secondary)",
            padding: "0 14px",
            height: 36,
            minWidth: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
            (e.currentTarget as HTMLElement).style.background = "var(--surface-3)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
            (e.currentTarget as HTMLElement).style.background = "var(--surface-2)";
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span className="hide-mobile">Home</span>
        </button>
      </div>
    </header>
  );
}
