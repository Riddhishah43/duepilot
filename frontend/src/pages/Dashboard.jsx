import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import api from "../services/api";
import StatCard from "../components/common/StatCard";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    try {
      const { data: res } = await api.get("/analytics/dashboard");
      setData(res);
    } catch (err) {
      console.error("Failed to load dashboard", err);
    } finally { setLoading(false); }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div></div>;
  }

  const weeklyChartData = data?.weeklyAnalytics?.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", { weekday: "short" }),
    score: d.productivityScore,
    completed: d.completedTasks,
  })) || [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <p className="text-sm text-gray-500">Here's your productivity overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Today's Tasks" value={data?.todayTasks || 0} icon="📋" />
        <StatCard title="Productivity Score" value={`${data?.productivityScore || 0}%`} icon="⭐" />
        <StatCard title="High Risk Tasks" value={data?.highRiskTasks?.length || 0} icon="⚠️" />
        <StatCard title="Upcoming" value={data?.upcomingDeadlines?.length || 0} icon="📅" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card">
          <h2 className="font-semibold text-sm mb-3">Weekly Progress</h2>
          {weeklyChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weeklyChartData}>
                <XAxis dataKey="date" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#9CD5FF" strokeWidth={2} dot={{ r: 3, fill: "#9CD5FF" }} />
                <Line type="monotone" dataKey="completed" stroke="#355872" strokeWidth={2} dot={{ r: 3, fill: "#355872" }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400">No data yet this week</p>}
        </div>

        <div>
          <h2 className="font-semibold text-sm mb-3">Today's Events</h2>
          <div className="space-y-2">
            {data?.todayEvents?.length > 0 ? (
              data.todayEvents.map((event) => (
                <div key={event._id} className="card py-2.5 px-3 flex items-center justify-between">
                  <span className="font-medium text-sm">{event.title}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(event.start).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))
            ) : <p className="text-sm text-gray-400">No events scheduled today</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
