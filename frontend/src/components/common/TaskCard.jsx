const priorityStyles = {
  critical: "border-l-[#6366F1] shadow-[inset_0_0_6px_-2px_#6366F1]",
  high: "border-l-[#FF5A76] shadow-[inset_0_0_6px_-2px_#FF5A76]",
  medium: "border-l-[#FBBF24] shadow-[inset_0_0_6px_-2px_#FBBF24]",
  low: "border-l-[#34D399] shadow-[inset_0_0_6px_-2px_#34D399]",
};

const priorityIcons = {
  critical: "🔵",
  high: "🔥",
  medium: "⚡",
  low: "🌱",
};

const priorityBadge = {
  critical: "bg-[#312E81] border-[#6366F1] text-[#C7D2FE]",
  high: "bg-[#7F1D1D] border-[#EF4444] text-[#FECACA]",
  medium: "bg-[#78350F] border-[#F59E0B] text-[#FDE68A]",
  low: "bg-[#14532D] border-[#22C55E] text-[#BBF7D0]",
};

const statusBadge = {
  pending: "bg-bg-elevated text-text-muted border border-border-default/50",
  "in-progress": "bg-[#1E3A5F] border-[#3B82F6] text-[#93C5FD]",
  completed: "bg-[#14532D] border-[#22C55E] text-[#BBF7D0]",
  missed: "bg-[#7F1D1D] border-[#EF4444] text-[#FECACA]",
};

const categoryColors = [
  { bg: "bg-blue-500/20", text: "text-blue-400" },
  { bg: "bg-violet-500/20", text: "text-violet-400" },
  { bg: "bg-pink-500/20", text: "text-pink-400" },
  { bg: "bg-teal-500/20", text: "text-teal-400" },
  { bg: "bg-orange-500/20", text: "text-orange-400" },
  { bg: "bg-indigo-500/20", text: "text-indigo-400" },
  { bg: "bg-lime-500/20", text: "text-lime-400" },
  { bg: "bg-cyan-500/20", text: "text-cyan-400" },
];

function getCategoryColor(category) {
  if (!category) return { bg: "bg-bg-elevated", text: "text-text-muted" };
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  return categoryColors[Math.abs(hash) % categoryColors.length];
}

export default function TaskCard({ task, onClick }) {
  const catColor = getCategoryColor(task.category);
  return (
    <div
      onClick={() => onClick?.(task)}
      className={`bg-bg-surface rounded-lg border border-border-default/30 border-l-[5px] p-3.5 cursor-pointer transition-all hover:bg-bg-elevated hover:border-border-default/60 ${priorityStyles[task.priority] || priorityStyles.medium}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate">{task.title}</h3>
          {task.description && (
            <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{task.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${priorityBadge[task.priority] || priorityBadge.medium}`}>
              {priorityIcons[task.priority] || "⚡"} {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : "Medium"}
            </span>
            <span className={`px-2.5 py-1 text-[11px] font-medium rounded-full ${statusBadge[task.status] || statusBadge.pending}`}>{task.status}</span>
            {task.category && (
              <span className={`px-2 py-0.5 text-[11px] font-medium rounded ${catColor.bg} ${catColor.text}`}>{task.category}</span>
            )}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[11px] text-slate-400">
            {new Date(task.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </p>
          {task.riskScore > 50 && <p className="text-[11px] font-medium text-accent mt-0.5">Risk: {task.riskScore}%</p>}
        </div>
      </div>
      {task.progress > 0 && (
        <div className="mt-2">
          <div className="w-full h-1 bg-bg-elevated rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${task.progress}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}
