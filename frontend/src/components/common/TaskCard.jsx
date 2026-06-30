const priorityStyles = {
  high: "border-l-red-500 bg-red-50",
  medium: "border-l-amber-500 bg-amber-50",
  low: "border-l-green-500 bg-green-50",
};

const priorityBadge = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-green-100 text-green-700",
};

const statusBadge = {
  pending: "badge-low",
  "in-progress": "badge-medium",
  completed: "badge-high",
  missed: "bg-red-100 text-red-600 px-2.5 py-0.5 text-xs font-medium rounded",
};

const categoryColors = [
  { bg: "bg-blue-100", text: "text-blue-700" },
  { bg: "bg-violet-100", text: "text-violet-700" },
  { bg: "bg-pink-100", text: "text-pink-700" },
  { bg: "bg-teal-100", text: "text-teal-700" },
  { bg: "bg-orange-100", text: "text-orange-700" },
  { bg: "bg-indigo-100", text: "text-indigo-700" },
  { bg: "bg-lime-100", text: "text-lime-700" },
  { bg: "bg-cyan-100", text: "text-cyan-700" },
];

function getCategoryColor(category) {
  if (!category) return { bg: "bg-gray-100", text: "text-gray-600" };
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
      className={`bg-white rounded-lg border border-gray-200 border-l-4 p-3.5 cursor-pointer transition-colors hover:border-gray-300 ${priorityStyles[task.priority] || priorityStyles.medium}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate">{task.title}</h3>
          {task.description && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{task.description}</p>
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
          <p className="text-[11px] text-gray-400">
            {new Date(task.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </p>
          {task.riskScore > 50 && <p className="text-[11px] font-medium text-red-500 mt-0.5">Risk: {task.riskScore}%</p>}
        </div>
      </div>
      {task.progress > 0 && (
        <div className="mt-2">
          <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-priority-high rounded-full transition-all" style={{ width: `${task.progress}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}
