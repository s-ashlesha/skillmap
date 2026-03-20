import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import type { RoadmapNode } from "../types";

const categoryColors: Record<string, string> = {
  tech: "#6c63ff",
  science: "#22d3ee",
  business: "#f59e0b",
  creative: "#ec4899",
  soft_skills: "#10b981",
};

interface SkillNodeData {
  skill: RoadmapNode;
  isSelected: boolean;
  onSelect: (node: RoadmapNode) => void;
}

function SkillNode({ data }: NodeProps<SkillNodeData>) {
  const { skill, isSelected, onSelect } = data;
  const color = categoryColors[skill.category] || "#6c63ff";

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: color, border: `2px solid ${color}`, width: 8, height: 8 }}
      />

      <button
        onClick={() => onSelect(skill)}
        style={{
          background: isSelected
            ? `linear-gradient(135deg, ${color}22, ${color}11)`
            : "var(--surface-2)",
          border: `1.5px solid ${isSelected ? color : "var(--border)"}`,
          borderRadius: "10px",
          padding: "10px 14px",
          cursor: "pointer",
          minWidth: "140px",
          maxWidth: "200px",
          textAlign: "left",
          transition: "all 0.18s ease",
          boxShadow: isSelected
            ? `0 0 0 1px ${color}60, 0 4px 20px ${color}30`
            : "0 2px 8px rgba(0,0,0,0.3)",
          position: "relative",
          outline: "none",
        }}
        className={isSelected ? "" : "skill-node-hover"}
      >
        {/* Target badge */}
        {skill.is_target && (
          <span style={{
            position: "absolute",
            top: -8,
            right: 8,
            background: color,
            color: "#fff",
            fontSize: "9px",
            fontWeight: 600,
            letterSpacing: "0.08em",
            padding: "2px 6px",
            borderRadius: "4px",
            textTransform: "uppercase",
          }}>
            GOAL
          </span>
        )}

        {/* Category indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: color,
            boxShadow: `0 0 6px ${color}`,
            flexShrink: 0,
          }} />
          <span style={{
            fontSize: "9px",
            color: color,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontWeight: 500,
          }}>
            {skill.category.replace("_", " ")}
          </span>
        </div>

        {/* Title */}
        <div style={{
          color: "var(--text-primary)",
          fontSize: "13px",
          fontWeight: 500,
          lineHeight: 1.3,
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {skill.title}
        </div>

        {/* Step badge */}
        <div style={{
          position: "absolute",
          bottom: 6,
          right: 8,
          fontSize: "9px",
          color: "var(--text-muted)",
          fontFamily: "monospace",
        }}>
          #{skill.order}
        </div>
      </button>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: color, border: `2px solid ${color}`, width: 8, height: 8 }}
      />

      <style jsx>{`
        .skill-node-hover:hover {
          border-color: ${color}80 !important;
          box-shadow: 0 0 0 1px ${color}30, 0 4px 16px rgba(0,0,0,0.4) !important;
          transform: translateY(-1px);
        }
      `}</style>
    </>
  );
}

export default memo(SkillNode);
