import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import toast from "react-hot-toast";
import api from "../services/api";

const COLORS = ["#9CD5FF", "#7AAACE", "#355872", "#F7F8F0", "#ff6b6b"];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAnalytics(); }, []);

  const loadAnalytics = async () => {
    try { const { data: res } = await api.get("/analytics"); setData(res); }
    catch { toast.error("Failed to load analytics"); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div></div>;

  const categoryChartData = data?.categoryData ? Object.entries(data.categoryData).map(([name, val]) => ({ name, completed: val.completed, total: val.total })) : [];
  const weeklyData = data?.dailyAnalytics?.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", { weekday: "short" }),
    score: d.productivityScore, completed: d.completedTasks,
  })) || [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold">Analytics</h1>
        <p className="text-sm text-gray-500">Your productivity insights</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Total Tasks", value: data?.totalTasks || 0, icon: "📊" },
          { label: "Completed", value: data?.completedTasks || 0, icon: "✅" },
          { label: "Missed", value: data?.missedTasks || 0, icon: "❌" },
          { label: "Completion Rate", value: `${data?.completionRate || 0}%`, icon: "📈" },
          { label: "Focus Hours", value: `${data?.totalFocusHours || 0}h`, icon: "⏱️" },
        ].map((s) => (
          <div key={s.label} className="card text-center">
            <p className="text-xl mb-0.5">{s.icon}</p>
            <p className="text-base font-bold">{s.value}</p>
            <p className="text-[11px] text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card">
          <h2 className="font-semibold text-sm mb-3">Weekly Trend</h2>
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weeklyData}>
                <XAxis dataKey="date" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#9CD5FF" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="completed" stroke="#355872" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-8">No weekly data yet</p>}
        </div>

        <div className="card">
          <h2 className="font-semibold text-sm mb-3">Category Breakdown</h2>
          {categoryChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={categoryChartData} dataKey="total" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                  {categoryChartData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-8">No category data yet</p>}
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-sm mb-3">Tasks by Category</h2>
        {categoryChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryChartData}>
              <XAxis dataKey="name" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} />
              <Tooltip />
              <Bar dataKey="total" fill="#355872" radius={[2, 2, 0, 0]} />
              <Bar dataKey="completed" fill="#9CD5FF" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <p className="text-sm text-gray-400 text-center py-8">No data yet</p>}
      </div>
    </div>
  );
}
