import { useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

const crisisColors = {
  low: "bg-yellow-100 border-yellow-300 text-yellow-700",
  medium: "bg-orange-100 border-orange-300 text-orange-700",
  high: "bg-red-100 border-red-300 text-red-700",
  critical: "bg-red-200 border-red-400 text-red-800",
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
        <span className="text-6xl">🚨</span>
        <h1 className="text-2xl font-bold text-gray-800">Rescue Mode</h1>
        <p className="text-sm text-gray-500 max-w-md">
          AI analyzes all your pending tasks and builds a complete survival plan —
          prioritizes, merges, reschedules, and tells you exactly what to do.
        </p>
        <button
          onClick={activateRescue}
          disabled={loading}
          className="bg-red-500 text-white px-8 py-3 rounded-lg text-base font-semibold hover:bg-red-600 transition-colors disabled:opacity-60 shadow-lg shadow-red-200"
        >
          {loading ? "Analyzing..." : "🚨 Activate Rescue Mode"}
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-3 border-red-500 border-t-transparent" />
        <p className="text-sm text-gray-500">AI is analyzing your tasks...</p>
      </div>
    );
  }

  if (!plan) return null;

  const { overview, categories, mergedTasks, extensionsToRequest, removedTasks, schedule, urgentActions } = plan;

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🚨</span>
          <div>
            <h1 className="text-lg font-bold text-red-600">Rescue Mode Activated</h1>
            <p className="text-xs text-gray-500">AI-generated survival plan</p>
          </div>
        </div>
        <button onClick={reset} className="btn-ghost text-xs">New Rescue</button>
      </div>

      {overview && (
        <div className="card border-red-200 bg-red-50/50">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div>
              <p className="text-xs text-gray-500">Total Tasks</p>
              <p className="text-xl font-bold">{overview.totalTasks}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Hours Available</p>
              <p className="text-xl font-bold">{overview.totalAvailableHours}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Hours Needed</p>
              <p className="text-xl font-bold">{overview.estimatedHoursNeeded}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Completion Odds</p>
              <p className={`text-xl font-bold ${overview.completionProbability >= 60 ? "text-green-600" : "text-red-600"}`}>
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
              <h2 className="text-sm font-semibold text-red-600 mb-1.5">🔴 High Priority</h2>
              <div className="space-y-1">
                {categories.critical.map((t, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm p-2 rounded bg-red-50 border border-red-100">
                    <span className="text-green-600 font-bold">✔</span>
                    <span className="flex-1 font-medium">{t.title}</span>
                    <span className="text-xs text-gray-500">{t.duration}min</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {categories.important?.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-orange-600 mb-1.5">🟡 Medium Priority</h2>
              <div className="space-y-1">
                {categories.important.map((t, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm p-2 rounded bg-orange-50 border border-orange-100">
                    <span className="text-gray-400">◻</span>
                    <span className="flex-1">{t.title}</span>
                    <span className="text-xs text-gray-500">{t.duration}min</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {categories.optional?.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 mb-1.5">⚪ Low Priority</h2>
              <div className="space-y-1">
                {categories.optional.map((t, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm p-2 rounded bg-gray-50 border border-gray-100 text-gray-500">
                    <span className="text-red-400 font-bold">✕</span>
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
        <div className="card border-blue-200 bg-blue-50/50">
          <h2 className="text-sm font-semibold text-blue-700 mb-2">🔗 Merged Tasks</h2>
          <div className="space-y-1.5">
            {mergedTasks.map((m, i) => (
              <div key={i} className="text-xs">
                <p className="font-medium">{m.into}</p>
                <p className="text-gray-500">Merged: {m.originalTasks?.join(", ")}</p>
                <p className="text-gray-400 italic">{m.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {extensionsToRequest?.length > 0 && (
        <div className="card border-purple-200 bg-purple-50/50">
          <h2 className="text-sm font-semibold text-purple-700 mb-2">📅 Suggested Extensions</h2>
          <div className="space-y-1">
            {extensionsToRequest.map((e, i) => (
              <div key={i} className="text-xs flex items-center gap-2">
                <span>📌</span>
                <span className="flex-1">{e.task}</span>
                <span className="text-gray-400 line-through">{e.currentDeadline?.slice(0, 10)}</span>
                <span className="text-green-600 font-medium">→ {e.suggestedDeadline?.slice(0, 10)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {removedTasks?.length > 0 && (
        <div className="card border-gray-200 bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-600 mb-2">🗑 Removed / Deferred</h2>
          <div className="space-y-1">
            {removedTasks.map((r, i) => (
              <div key={i} className="text-xs text-gray-500 flex items-center gap-1">
                <span>✕</span>
                <span className="flex-1">{r.task}</span>
                <span className="italic">{r.reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {schedule?.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-2">📋 Recommended Plan</h2>
          <div className="space-y-3">
            {schedule.map((day, i) => (
              <div key={i} className="card">
                <h3 className="text-sm font-medium text-primary mb-2">{day.day} — {day.date}</h3>
                <div className="space-y-1.5">
                  {day.sessions?.map((s, j) => (
                    <div key={j} className={`flex items-center gap-3 text-sm p-2 rounded ${
                      s.type === "critical" ? "bg-red-50 border-l-4 border-red-400" : "bg-gray-50 border-l-4 border-gray-300"
                    }`}>
                      <span className="text-xs font-medium text-gray-500 w-28 shrink-0">{s.time}</span>
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
        <div className="card border-red-200 bg-red-50">
          <h2 className="text-sm font-semibold text-red-600 mb-2">⚡ Urgent Actions</h2>
          <ul className="space-y-1">
            {urgentActions.map((a, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-red-500 mt-0.5">▸</span>
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
