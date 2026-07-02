import { useState, useEffect } from "react";
import { Ban, Moon, AlarmClock, Calendar, Ruler, Skull, Star, TrendingUp, TrendingDown, BarChart3, Trophy, Check, Lightbulb, Search, BrainCircuit } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

const severityColors = {
  high: "bg-danger-light border-danger text-danger",
  medium: "bg-warning-light border-warning text-warning",
  low: "bg-accent-light border-accent text-accent",
};

const typeIcons = {
  avoidance: Ban,
  fatigue: Moon,
  deadline_crunch: AlarmClock,
  day_pattern: Calendar,
  scope_creep: Ruler,
  abandonment: Skull,
  optimal_hours: Star,
};

const trendColors = {
  improving: "text-success bg-success-light border-success",
  declining: "text-danger bg-danger-light border-danger",
  stable: "text-text-muted bg-bg-secondary border-border",
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
        <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data || !data.analysis) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-3">
        <span className="text-5xl"><BrainCircuit size={48} /></span>
        <h1 className="page-heading">Pattern Insights</h1>
        <p className="page-subheading max-w-md">
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
          <h1 className="page-heading">Pattern Insights</h1>
          <p className="page-subheading">AI-detected work habits and suggestions</p>
        </div>
        <button onClick={loadInsights} className="btn btn-ghost text-xs">Refresh</button>
      </div>

      {analysis.summary && (
        <div className={`card border ${trendColors[analysis.weeklyTrend] || "border-border"}`}>
          <div className="flex items-start gap-3">
            <span className="text-2xl">{analysis.weeklyTrend === "improving" ? <TrendingUp size={24} /> : analysis.weeklyTrend === "declining" ? <TrendingDown size={24} /> : <BarChart3 size={24} />}</span>
            <div>
              <p className="text-sm font-medium">Trend: {analysis.weeklyTrend?.charAt(0).toUpperCase() + analysis.weeklyTrend?.slice(1)}</p>
              <p className="text-sm text-text-muted mt-1">{analysis.summary}</p>
            </div>
          </div>
        </div>
      )}

      {analysis.topStrengths?.length > 0 && (
        <div className="card border-success bg-success-light">
          <h2 className="text-sm font-semibold text-success mb-2"><Trophy size={16} className="inline-block mr-1" />Your Strengths</h2>
          <ul className="space-y-1">
            {analysis.topStrengths.map((s, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <Check size={16} className="text-success mt-0.5 shrink-0" />
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
            <div key={i} className={`card border ${severityColors[p.severity] || "border-border"}`}>
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">{(() => { const Icon = typeIcons[p.type] || Search; return <Icon size={20} />; })()}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-semibold">{p.title}</h3>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                      p.severity === "high" ? "bg-danger-light text-danger" :
                      p.severity === "medium" ? "bg-warning/20 text-warning" :
                      "bg-accent-light text-accent"
                    }`}>
                      {p.severity}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted">{p.description}</p>
                  {p.data && (
                    <div className="flex gap-3 mt-1.5 text-xs text-text-muted">
                      {p.data.affected !== undefined && <span>Affected: {p.data.affected} tasks</span>}
                      {p.data.rate !== undefined && <span>Rate: {Math.round(p.data.rate * 100)}%</span>}
                    </div>
                  )}
                </div>
              </div>
              {p.suggestion && (
                <div className="mt-2 p-2 rounded bg-bg-secondary border border-border">
                  <p className="text-xs font-medium text-accent"><Lightbulb size={14} className="inline-block mr-1" />Suggestion</p>
                  <p className="text-xs text-text-muted mt-0.5">{p.suggestion}</p>
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
              <p className="text-xs text-text-muted">Total Tasks</p>
              <p className="text-lg font-bold">{stats.totalTasks}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Completed</p>
              <p className="text-lg font-bold text-success">{stats.completedTasks}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Missed</p>
              <p className="text-lg font-bold text-danger">{stats.missedTasks}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Completion Rate</p>
              <p className={`text-lg font-bold ${stats.completionRate >= 70 ? "text-success" : "text-danger"}`}>{stats.completionRate}%</p>
            </div>
          </div>
          {stats.categoryStats && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs font-medium text-text-muted mb-1.5">By Category</p>
              <div className="space-y-1">
                {Object.entries(stats.categoryStats).map(([cat, val]) => (
                  <div key={cat} className="flex items-center gap-2 text-xs">
                    <span className="w-20 truncate">{cat}</span>
                    <div className="flex-1 h-1.5 bg-bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full" style={{ width: `${val.total > 0 ? (val.completed / val.total) * 100 : 0}%` }} />
                    </div>
                    <span className="text-text-muted w-16 text-right">{val.completed}/{val.total}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {data.logCount > 0 && (
        <p className="text-xs text-text-muted text-center">
          Based on {data.logCount} actions logged over the last 30 days
        </p>
      )}
    </div>
  );
}
