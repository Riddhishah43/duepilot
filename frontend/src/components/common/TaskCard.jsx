const priorityStyles = {
  high: "border-l-accent",
  medium: "border-l-warning",
  low: "border-l-success",
};

const priorityBadge = {
  high: "badge-high",
  medium: "badge-medium",
  low: "badge-low",
};

const statusBadge = {
  pending: "badge-low",
  "in-progress": "badge-medium",
  completed: "badge-high",
  missed: "badge-high",
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
      className={`bg-bg-surface rounded-lg border border-default/50 border-l-4 p-3.5 cursor-pointer transition-colors hover:border-default ${priorityStyles[task.priority] || priorityStyles.medium}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate">{task.title}</h3>
          {task.description && (
            <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{task.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className={`px-2 py-0.5 text-[11px] font-medium rounded ${priorityBadge[task.priority] || priorityBadge.medium}`}>
              {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : "Medium"}
            </span>
            <span className={statusBadge[task.status] || statusBadge.pending}>{task.status}</span>
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
