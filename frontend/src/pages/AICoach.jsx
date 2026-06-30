import { useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

export default function AICoach() {
  const [report, setReport] = useState(null);
  const [weeklyReport, setWeeklyReport] = useState(null);
  const [loading, setLoading] = useState({ daily: false, weekly: false });

  const getDailyReport = async () => {
    setLoading({ ...loading, daily: true });
    try { const { data } = await api.get("/ai/daily-report"); setReport(data.report); }
    catch { toast.error("Failed to generate daily report"); }
    finally { setLoading({ ...loading, daily: false }); }
  };

  const getWeeklyReport = async () => {
    setLoading({ ...loading, weekly: true });
    try { const { data } = await api.get("/ai/weekly-report"); setWeeklyReport(data.report); }
    catch { toast.error("Failed to generate weekly report"); }
    finally { setLoading({ ...loading, weekly: false }); }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold">AI Coach</h1>
        <p className="text-sm text-gray-500">Personal productivity insights and coaching</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card">
          <h2 className="font-semibold text-sm mb-3">Daily Report</h2>
          <p className="text-xs text-gray-400 mb-3">Get AI insights about your day</p>
          <button onClick={getDailyReport} disabled={loading.daily} className="btn-primary text-sm mb-3">
            {loading.daily ? "Generating..." : "Generate Daily Report"}
          </button>
          {report && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{report.score >= 70 ? "🌟" : report.score >= 40 ? "👍" : "💪"}</span>
                <div>
                  <p className="font-semibold text-sm">Score: {report.score}/100</p>
                  <p className="text-xs text-gray-400">{report.completedTasks} completed • {report.missedTasks} missed</p>
                </div>
              </div>
              {report.bestHours && (
                <div className="p-2.5 rounded bg-priority-high/15 text-sm"><span className="font-medium">Best Hours:</span> {report.bestHours}</div>
              )}
              {report.suggestions?.length > 0 && (
                <div>
                  <p className="text-xs font-medium mb-1">Suggestions</p>
                  <ul className="space-y-0.5">{report.suggestions.map((s, i) => <li key={i} className="text-xs text-gray-600">• {s}</li>)}</ul>
                </div>
              )}
              {report.encouragement && <p className="text-xs italic text-gray-400 border-t border-gray-200 pt-2">"{report.encouragement}"</p>}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold text-sm mb-3">Weekly Report</h2>
          <p className="text-xs text-gray-400 mb-3">Weekly productivity analysis</p>
          <button onClick={getWeeklyReport} disabled={loading.weekly} className="btn-primary text-sm mb-3">
            {loading.weekly ? "Generating..." : "Generate Weekly Report"}
          </button>
          {weeklyReport && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{weeklyReport.trend === "up" ? "📈" : weeklyReport.trend === "down" ? "📉" : "📊"}</span>
                <div>
                  <p className="font-semibold text-sm">Avg Score: {weeklyReport.averageScore}/100</p>
                  <p className="text-xs text-gray-400">{weeklyReport.tasksCompleted} completed • {weeklyReport.missedDeadlines} missed</p>
                </div>
              </div>
              {weeklyReport.topCategory && (
                <div className="p-2.5 rounded bg-primary/10 text-sm"><span className="font-medium">Top Category:</span> {weeklyReport.topCategory}</div>
              )}
              {weeklyReport.suggestions?.length > 0 && (
                <div>
                  <p className="text-xs font-medium mb-1">Suggestions</p>
                  <ul className="space-y-0.5">{weeklyReport.suggestions.map((s, i) => <li key={i} className="text-xs text-gray-600">• {s}</li>)}</ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
