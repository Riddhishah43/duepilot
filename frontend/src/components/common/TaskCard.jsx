const priorityStyles = {
  high: "border-l-priority-high bg-priority-high/5",
  medium: "border-l-priority-medium bg-priority-medium/10",
  low: "border-l-priority-low bg-priority-low/30",
};

const statusBadge = {
  pending: "badge-low",
  "in-progress": "badge-medium",
  completed: "badge-high",
  missed: "bg-red-100 text-red-600 px-2.5 py-0.5 text-xs font-medium rounded",
};

export default function TaskCard({ task, onClick }) {
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
            <span className={statusBadge[task.status] || statusBadge.pending}>{task.status}</span>
            {task.category && (
              <span className="px-2 py-0.5 text-[11px] rounded bg-gray-100 text-gray-600">{task.category}</span>
            )}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[11px] text-gray-400">{new Date(task.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
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
