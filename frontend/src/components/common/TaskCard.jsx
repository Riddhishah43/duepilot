import { Shield, Flame, Zap, Sprout } from "lucide-react";

const priorityIcons = {
  critical: Shield,
  high: Flame,
  medium: Zap,
  low: Sprout,
};

const statusBadgeMap = {
  pending: "badge",
  "in-progress": "badge badge-accent",
  completed: "badge badge-success",
  missed: "badge badge-danger",
};

const priorityBorderMap = {
  critical: "border-l-accent",
  high: "border-l-danger",
  medium: "border-l-warning",
  low: "border-l-success",
};

export default function TaskCard({ task, onClick }) {
  const priority = task.priority || "medium";
  const PriorityIcon = priorityIcons[priority] || Zap;
  const statusBadge = statusBadgeMap[task.status] || "badge";
  const borderClass = priorityBorderMap[priority] || priorityBorderMap.medium;

  return (
    <div
      onClick={() => onClick?.(task)}
      className={`card p-4 cursor-pointer border-l-4 ${borderClass}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate text-text-primary">
            {task.title}
          </h3>
          {task.description && (
            <p className="text-xs mt-1 line-clamp-2 text-text-secondary">
              {task.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            <span className="badge text-xs">
              <PriorityIcon size={12} className="inline" /> {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : "Medium"}
            </span>
            <span className={`${statusBadge} text-xs`}>
              {task.status}
            </span>
            {task.category && (
              <span className="badge text-xs">
                {task.category}
              </span>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs font-medium text-text-muted">
            {task.deadline ? new Date(task.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
          </p>
          {task.riskScore > 50 && (
            <p className="text-xs font-semibold mt-1 text-danger">
              Risk: {task.riskScore}%
            </p>
          )}
        </div>
      </div>
      {task.progress > 0 && (
        <div className="mt-3">
          <div className="progress">
            <div className="progress-fill" style={{ width: `${task.progress}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}
