import { BellRing, Check, X, Link, Calendar, Pin, Trash2, ClipboardList, Zap } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

const crisisColors = {
  low: "bg-warning-light border-warning text-warning",
  medium: "bg-warning-light border-warning text-warning",
  high: "bg-danger-light border-danger text-danger",
  critical: "bg-danger-light border-danger text-danger",
};

export default function RescueMode() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activated, setActivated] = useState(false);

  const activateRescue = async () => {
    setLoading(true);
    setActivated(true);
    try {
      const { data } = await api.post("/ai/rescue");
      setPlan(data.rescuePlan);
    } catch (err) {
      toast.error(err.response?.data?.message || "No tasks to rescue. Create some tasks first!");
      setActivated(false);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPlan(null);
    setActivated(false);
  };

  if (!activated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-5">
        <BellRing size={64} />
        <h1 className="text-2xl font-bold">Rescue Mode</h1>
        <p className="text-sm text-text-muted max-w-md">
          AI analyzes all your pending tasks and builds a complete survival plan —
          prioritizes, merges, reschedules, and tells you exactly what to do.
        </p>
        <button
          onClick={activateRescue}
          disabled={loading}
          className="btn btn-primary px-8 py-3 rounded-lg text-base font-semibold transition-colors disabled:opacity-60"
        >
          {loading ? "Analyzing..." : <><BellRing size={20} className="inline" /> Activate Rescue Mode</>}
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="w-10 h-10 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        <p className="text-sm text-text-muted">AI is analyzing your tasks...</p>
      </div>
    );
  }

  if (!plan) return null;

  const { overview, categories, mergedTasks, extensionsToRequest, removedTasks, schedule, urgentActions } = plan;

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BellRing size={24} />
          <div>
            <h1 className="text-lg font-bold text-accent">Rescue Mode Activated</h1>
            <p className="text-xs text-text-muted">AI-generated survival plan</p>
          </div>
        </div>
        <button onClick={reset} className="btn btn-ghost text-xs">New Rescue</button>
      </div>

      {overview && (
        <div className="card border-danger bg-danger-light">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div>
              <p className="text-xs text-text-muted">Total Tasks</p>
              <p className="text-xl font-bold">{overview.totalTasks}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Hours Available</p>
              <p className="text-xl font-bold">{overview.totalAvailableHours}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Hours Needed</p>
              <p className="text-xl font-bold">{overview.estimatedHoursNeeded}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Completion Odds</p>
              <p className={`text-xl font-bold ${overview.completionProbability >= 60 ? "text-success" : "text-danger"}`}>
                {overview.completionProbability}%
              </p>
            </div>
          </div>
          {overview.crisisLevel && (
            <div className={`mt-3 px-3 py-1.5 rounded text-xs font-medium text-center border ${crisisColors[overview.crisisLevel] || crisisColors.high}`}>
              Crisis Level: {overview.crisisLevel.toUpperCase()}
            </div>
          )}
        </div>
      )}

      {categories && (
        <div className="space-y-3">
          {categories.critical?.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-danger mb-1.5">High Priority</h2>
              <div className="space-y-1">
                {categories.critical.map((t, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm p-2 rounded bg-danger-light border border-danger">
                    <Check size={16} className="text-success shrink-0" />
                    <span className="flex-1 font-medium">{t.title}</span>
                    <span className="text-xs text-text-muted">{t.duration}min</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {categories.important?.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-warning mb-1.5">Medium Priority</h2>
              <div className="space-y-1">
                {categories.important.map((t, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm p-2 rounded bg-warning/10 border border-warning/20">
                    <span className="flex-1">{t.title}</span>
                    <span className="text-xs text-text-muted">{t.duration}min</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {categories.optional?.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-text-muted mb-1.5">Low Priority</h2>
              <div className="space-y-1">
                {categories.optional.map((t, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm p-2 rounded bg-bg-secondary border border-border text-text-muted">
                    <X size={16} className="text-danger shrink-0" />
                    <span className="flex-1">{t.title}</span>
                    <span className="text-xs">{t.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {mergedTasks?.length > 0 && (
        <div className="card border-accent bg-accent-light">
          <h2 className="text-sm font-semibold text-accent mb-2"><Link size={16} className="inline-block mr-1" />Merged Tasks</h2>
          <div className="space-y-1.5">
            {mergedTasks.map((m, i) => (
              <div key={i} className="text-xs">
                <p className="font-medium">{m.into}</p>
                <p className="text-text-muted">Merged: {m.originalTasks?.join(", ")}</p>
                <p className="text-text-muted italic">{m.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {extensionsToRequest?.length > 0 && (
        <div className="card border-accent bg-accent-light">
          <h2 className="text-sm font-semibold text-accent mb-2"><Calendar size={16} className="inline-block mr-1" />Suggested Extensions</h2>
          <div className="space-y-1">
            {extensionsToRequest.map((e, i) => (
              <div key={i} className="text-xs flex items-center gap-2">
                <Pin size={14} className="shrink-0" />
                <span className="flex-1">{e.task}</span>
                <span className="text-text-muted line-through">{e.currentDeadline?.slice(0, 10)}</span>
                <span className="text-success font-medium">→ {e.suggestedDeadline?.slice(0, 10)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {removedTasks?.length > 0 && (
        <div className="card border-border bg-bg-secondary">
          <h2 className="text-sm font-semibold text-text-muted mb-2"><Trash2 size={16} className="inline-block mr-1" />Removed / Deferred</h2>
          <div className="space-y-1">
            {removedTasks.map((r, i) => (
              <div key={i} className="text-xs text-text-muted flex items-center gap-1">
                <X size={14} className="shrink-0" />
                <span className="flex-1">{r.task}</span>
                <span className="italic">{r.reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {schedule?.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-2"><ClipboardList size={16} className="inline-block mr-1" />Recommended Plan</h2>
          <div className="space-y-3">
            {schedule.map((day, i) => (
              <div key={i} className="card">
                <h3 className="text-sm font-medium text-accent mb-2">{day.day} — {day.date}</h3>
                <div className="space-y-1.5">
                  {day.sessions?.map((s, j) => (
                    <div key={j} className={`flex items-center gap-3 text-sm p-2 rounded ${
                      s.type === "critical" ? "bg-danger-light border-l-4 border-danger" : "bg-bg-secondary border-l-4 border-border"
                    }`}>
                      <span className="text-xs font-medium text-text-muted w-28 shrink-0">{s.time}</span>
                      <span className="font-medium">{s.task}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {urgentActions?.length > 0 && (
        <div className="card border-danger bg-danger-light">
          <h2 className="text-sm font-semibold text-danger mb-2"><Zap size={16} className="inline-block mr-1" />Urgent Actions</h2>
          <ul className="space-y-1">
            {urgentActions.map((a, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <span className="text-danger mt-0.5">▸</span>
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
