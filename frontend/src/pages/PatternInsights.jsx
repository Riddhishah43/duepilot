import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

const severityColors = {
  high: "bg-red-50 border-red-200 text-red-700",
  medium: "bg-yellow-50 border-yellow-200 text-yellow-700",
  low: "bg-blue-50 border-blue-200 text-blue-700",
};

const typeIcons = {
  avoidance: "🚫",
  fatigue: "😴",
  deadline_crunch: "⏰",
  day_pattern: "📅",
  scope_creep: "📏",
  abandonment: "💀",
  optimal_hours: "⭐",
};

const trendColors = {
  improving: "text-green-600 bg-green-50",
  declining: "text-red-600 bg-red-50",
  stable: "text-gray-600 bg-gray-50",
};

export default function PatternInsights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadInsights(); }, []);

  const loadInsights = async () => {
    try {
      const { data: res } = await api.get("/patterns/insights");
      setData(res);
    } catch {
      toast.error("Not enough data yet. Keep using the app!");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!data || !data.analysis) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-3">
        <span className="text-5xl">🧠</span>
        <h1 className="text-lg font-semibold">Pattern Insights</h1>
        <p className="text-sm text-gray-500 max-w-md">
          This feature learns your work habits over time. Create and complete some tasks to unlock personalized productivity insights.
        </p>
      </div>
    );
  }

  const { analysis, stats } = data;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Pattern Insights</h1>
          <p className="text-sm text-gray-500">AI-detected work habits and suggestions</p>
        </div>
        <button onClick={loadInsights} className="btn-ghost text-xs">Refresh</button>
      </div>

      {analysis.summary && (
        <div className={`card border ${trendColors[analysis.weeklyTrend] || "border-gray-200"}`}>
          <div className="flex items-start gap-3">
            <span className="text-2xl">{analysis.weeklyTrend === "improving" ? "📈" : analysis.weeklyTrend === "declining" ? "📉" : "📊"}</span>
            <div>
              <p className="text-sm font-medium">Trend: {analysis.weeklyTrend?.charAt(0).toUpperCase() + analysis.weeklyTrend?.slice(1)}</p>
              <p className="text-sm text-gray-600 mt-1">{analysis.summary}</p>
            </div>
          </div>
        </div>
      )}

      {analysis.topStrengths?.length > 0 && (
        <div className="card border-green-200 bg-green-50/50">
          <h2 className="text-sm font-semibold text-green-700 mb-2">💪 Your Strengths</h2>
          <ul className="space-y-1">
            {analysis.topStrengths.map((s, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {analysis.patterns?.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Detected Patterns</h2>
          {analysis.patterns.map((p, i) => (
            <div key={i} className={`card border ${severityColors[p.severity] || "border-gray-200"}`}>
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">{typeIcons[p.type] || "🔍"}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-semibold">{p.title}</h3>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                      p.severity === "high" ? "bg-red-100 text-red-600" :
                      p.severity === "medium" ? "bg-yellow-100 text-yellow-600" :
                      "bg-blue-100 text-blue-600"
                    }`}>
                      {p.severity}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{p.description}</p>
                  {p.data && (
                    <div className="flex gap-3 mt-1.5 text-xs text-gray-500">
                      {p.data.affected !== undefined && <span>Affected: {p.data.affected} tasks</span>}
                      {p.data.rate !== undefined && <span>Rate: {Math.round(p.data.rate * 100)}%</span>}
                    </div>
                  )}
                </div>
              </div>
              {p.suggestion && (
                <div className="mt-2 p-2 rounded bg-white/80 border border-gray-100">
                  <p className="text-xs font-medium text-primary">💡 Suggestion</p>
                  <p className="text-xs text-gray-600 mt-0.5">{p.suggestion}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {stats && (
        <div className="card">
          <h2 className="text-sm font-semibold mb-3">Overview</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div>
              <p className="text-xs text-gray-500">Total Tasks</p>
              <p className="text-lg font-bold">{stats.totalTasks}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Completed</p>
              <p className="text-lg font-bold text-green-600">{stats.completedTasks}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Missed</p>
              <p className="text-lg font-bold text-red-500">{stats.missedTasks}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Completion Rate</p>
              <p className={`text-lg font-bold ${stats.completionRate >= 70 ? "text-green-600" : "text-red-500"}`}>{stats.completionRate}%</p>
            </div>
          </div>
          {stats.categoryStats && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 mb-1.5">By Category</p>
              <div className="space-y-1">
                {Object.entries(stats.categoryStats).map(([cat, val]) => (
                  <div key={cat} className="flex items-center gap-2 text-xs">
                    <span className="w-20 truncate">{cat}</span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${val.total > 0 ? (val.completed / val.total) * 100 : 0}%` }} />
                    </div>
                    <span className="text-gray-500 w-16 text-right">{val.completed}/{val.total}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {data.logCount > 0 && (
        <p className="text-xs text-gray-400 text-center">
          Based on {data.logCount} actions logged over the last 30 days
        </p>
      )}
    </div>
  );
}
