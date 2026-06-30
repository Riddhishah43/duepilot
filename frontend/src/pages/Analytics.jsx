import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from "recharts";
import toast from "react-hot-toast";
import api from "../services/api";

const COLORS = ["#9CD5FF", "#7AAACE", "#355872", "#F7F8F0", "#ff6b6b"];
const PRIORITY_COLORS = { high: "#ff6b6b", medium: "#f0ad4e", low: "#5cb85c" };

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAnalytics(); }, []);

  const loadAnalytics = async () => {
    try {
      const { data: res } = await api.get("/analytics");
      setData(res);
    } catch {
      toast.error("Failed to load analytics");
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

  const categoryChartData = data?.categoryData
    ? Object.entries(data.categoryData).map(([name, val]) => ({
        name,
        completed: val.completed,
        missed: val.missed,
        total: val.total,
      }))
    : [];

  const priorityChartData = data?.priorityDist
    ? Object.entries(data.priorityDist).map(([name, val]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        total: val.total,
        completed: val.completed,
        rate: val.total > 0 ? Math.round((val.completed / val.total) * 100) : 0,
      }))
    : [];

  const dailyChartData = data?.dailyAnalytics?.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
    score: d.productivityScore,
    completed: d.completedTasks,
    missed: d.missedTasks,
    pending: d.pendingTasks,
  })) || [];

  const hoursChartData = data?.hoursByDay
    ? Object.entries(data.hoursByDay).map(([day, hours]) => ({ day, hours: Math.round(hours * 10) / 10 })).reverse()
    : [];

  const riskChartData = data?.riskTrend || [];

  const statsCards = [
    { label: "Total Tasks", value: data?.totalTasks || 0, icon: "📊", color: "text-primary" },
    { label: "Completed", value: data?.completedTasks || 0, icon: "✅", color: "text-green-600" },
    { label: "Missed", value: data?.missedTasks || 0, icon: "❌", color: "text-red-500" },
    { label: "Pending", value: data?.pendingTasks || 0, icon: "⏳", color: "text-yellow-500" },
    { label: "Completion", value: `${data?.completionRate || 0}%`, icon: "📈", color: data?.completionRate >= 70 ? "text-green-600" : "text-red-500" },
    { label: "Day Streak", value: `${data?.streak || 0}d`, icon: "🔥", color: "text-orange-500" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold">Analytics</h1>
        <p className="text-sm text-gray-500">Your productivity insights at a glance</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statsCards.map((s) => (
          <div key={s.label} className="card text-center p-3">
            <p className="text-lg mb-0.5">{s.icon}</p>
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      {data?.bestDay && (
        <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
          <p className="text-sm">
            <span className="font-semibold">Best Productivity Day:</span>{" "}
            {data.bestDay.day} ({data.bestDay.hours}h of work)
          </p>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card">
          <h2 className="font-semibold text-sm mb-3">Productivity Trend (7 Days)</h2>
          {dailyChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={dailyChartData}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9CD5FF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#9CD5FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#888" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#888" fontSize={11} />
                <Tooltip />
                <Area type="monotone" dataKey="score" stroke="#355872" fill="url(#scoreGrad)" strokeWidth={2} dot={{ r: 3, fill: "#355872" }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">No weekly data yet</p>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold text-sm mb-3">Completion by Priority</h2>
          {priorityChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={priorityChartData} barGap={-8}>
                <XAxis dataKey="name" stroke="#888" fontSize={11} />
                <YAxis stroke="#888" fontSize={11} />
                <Tooltip />
                <Bar dataKey="total" fill="#e5e7eb" radius={[2, 2, 0, 0]} name="Total" />
                <Bar dataKey="completed" fill="#355872" radius={[2, 2, 0, 0]} name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">No data yet</p>
          )}
          {priorityChartData.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {priorityChartData.map((p) => (
                <div key={p.name} className="text-center p-1.5 rounded bg-gray-50">
                  <p className="text-xs text-gray-500">{p.name}</p>
                  <p className="text-sm font-bold">{p.rate}%</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card">
          <h2 className="font-semibold text-sm mb-3">Daily Tasks</h2>
          {dailyChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={dailyChartData} stackOffset="sign">
                <XAxis dataKey="date" stroke="#888" fontSize={11} />
                <YAxis stroke="#888" fontSize={11} />
                <Tooltip />
                <Bar dataKey="completed" stackId="a" fill="#5cb85c" radius={[2, 2, 0, 0]} name="Completed" />
                <Bar dataKey="pending" stackId="a" fill="#f0ad4e" radius={[2, 2, 0, 0]} name="Pending" />
                <Bar dataKey="missed" stackId="a" fill="#ff6b6b" radius={[2, 2, 0, 0]} name="Missed" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">No daily data yet</p>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold text-sm mb-3">Category Breakdown</h2>
          {categoryChartData.length > 0 ? (
            <div className="space-y-2">
              {categoryChartData.map((cat, i) => (
                <div key={cat.name}>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="font-medium">{cat.name}</span>
                    <span className="text-gray-500">{cat.completed}/{cat.total}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${cat.total > 0 ? (cat.completed / cat.total) * 100 : 0}%`,
                        backgroundColor: COLORS[i % COLORS.length],
                      }}
                    />
                  </div>
                  {cat.missed > 0 && (
                    <p className="text-[10px] text-red-400 mt-0.5">{cat.missed} missed</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">No categories yet</p>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card">
          <h2 className="font-semibold text-sm mb-3">Focus Hours This Week</h2>
          {hoursChartData.some((d) => d.hours > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={hoursChartData}>
                <XAxis dataKey="day" stroke="#888" fontSize={11} />
                <YAxis stroke="#888" fontSize={11} />
                <Tooltip />
                <Bar dataKey="hours" fill="#7AAACE" radius={[2, 2, 0, 0]} name="Hours" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">No focus data yet</p>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold text-sm mb-3">Risk Overview</h2>
          {riskChartData.length > 0 ? (
            <div className="space-y-1.5">
              {riskChartData.slice(0, 8).map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="w-24 truncate text-gray-600">{r.title}</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${r.riskScore >= 70 ? "bg-red-500" : r.riskScore >= 40 ? "bg-yellow-500" : "bg-green-500"}`}
                      style={{ width: `${r.riskScore}%` }}
                    />
                  </div>
                  <span className={`font-medium w-8 text-right ${r.riskScore >= 70 ? "text-red-500" : r.riskScore >= 40 ? "text-yellow-600" : "text-green-600"}`}>
                    {r.riskScore}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">No risk data yet. Create tasks with deadlines.</p>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-sm mb-3">Tasks by Category</h2>
        {categoryChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={categoryChartData}>
              <XAxis dataKey="name" stroke="#888" fontSize={11} />
              <YAxis stroke="#888" fontSize={11} />
              <Tooltip />
              <Bar dataKey="total" fill="#e5e7eb" radius={[2, 2, 0, 0]} name="Total" />
              <Bar dataKey="completed" fill="#355872" radius={[2, 2, 0, 0]} name="Completed" />
              <Bar dataKey="missed" fill="#ff6b6b" radius={[2, 2, 0, 0]} name="Missed" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-gray-400 text-center py-8">No data yet</p>
        )}
      </div>
    </div>
  );
}
