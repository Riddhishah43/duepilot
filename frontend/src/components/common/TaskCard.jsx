const priorityStyles = {
  critical: { borderColor: "var(--accent-3)", glow: "rgba(99,102,241,0.15)" },
  high: { borderColor: "#EF4444", glow: "rgba(239,68,68,0.15)" },
  medium: { borderColor: "#F59E0B", glow: "rgba(245,158,11,0.15)" },
  low: { borderColor: "#10B981", glow: "rgba(16,185,129,0.15)" },
};

const priorityIcons = {
  critical: "🔵",
  high: "🔥",
  medium: "⚡",
  low: "🌱",
};

const statusStyles = {
  pending: { bg: "rgba(148,163,184,0.1)", color: "var(--text-muted)" },
  "in-progress": { bg: "rgba(59,130,246,0.1)", color: "#93C5FD" },
  completed: { bg: "rgba(16,185,129,0.1)", color: "#6EE7B7" },
  missed: { bg: "rgba(239,68,68,0.1)", color: "#FCA5A5" },
};

const categoryColors = [
  { bg: "rgba(59,130,246,0.15)", text: "#93C5FD" },
  { bg: "rgba(139,92,246,0.15)", text: "#C4B5FD" },
  { bg: "rgba(236,72,153,0.15)", text: "#F9A8D4" },
  { bg: "rgba(20,184,166,0.15)", text: "#5EEAD4" },
  { bg: "rgba(249,115,22,0.15)", text: "#FDBA74" },
  { bg: "rgba(99,102,241,0.15)", text: "#A5B4FC" },
  { bg: "rgba(132,204,22,0.15)", text: "#BEF264" },
  { bg: "rgba(6,182,212,0.15)", text: "#67E8F9" },
];

function getCategoryColor(category) {
  if (!category) return { bg: "rgba(148,163,184,0.1)", text: "var(--text-muted)" };
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  return categoryColors[Math.abs(hash) % categoryColors.length];
}

export default function TaskCard({ task, onClick }) {
  const style = priorityStyles[task.priority] || priorityStyles.medium;
  const catColor = getCategoryColor(task.category);
  const sStyle = statusStyles[task.status] || statusStyles.pending;

  return (
    <div
      onClick={() => onClick?.(task)}
      className="glass-card p-4 cursor-pointer"
      style={{
        borderLeft: `4px solid ${style.borderColor}`,
        boxShadow: `0 4px 16px ${style.glow}, var(--glass-shadow)`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
            {task.title}
          </h3>
          {task.description && (
            <p className="text-xs mt-1 line-clamp-2" style={{ color: "var(--text-secondary)" }}>
              {task.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            <span className="badge-glass text-xs">
              {priorityIcons[task.priority] || "⚡"} {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : "Medium"}
            </span>
            <span className="badge-glass text-xs" style={{ background: sStyle.bg, color: sStyle.color, borderColor: "transparent" }}>
              {task.status}
            </span>
            {task.category && (
              <span className="badge-glass text-xs" style={{ background: catColor.bg, color: catColor.text, borderColor: "transparent" }}>
                {task.category}
              </span>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
            {task.deadline ? new Date(task.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
          </p>
          {task.riskScore > 50 && (
            <p className="text-xs font-semibold mt-1" style={{ color: "#FCA5A5" }}>
              Risk: {task.riskScore}%
            </p>
          )}
        </div>
      </div>
      {task.progress > 0 && (
        <div className="mt-3">
          <div className="progress-glass">
            <div className="progress-glass-fill" style={{ width: `${task.progress}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}
