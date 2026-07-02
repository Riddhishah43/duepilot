import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import api from "../services/api";
import { AlarmClock, Sparkles, BellRing, Target, Flame, AlertTriangle, ClipboardList, Coffee, Wand, PartyPopper, Lightbulb, Star, Calendar } from "lucide-react";

const subtypeMeta = {
  start_now: { icon: AlarmClock },
  best_time: { icon: Sparkles },
  rescue: { icon: BellRing },
  focus: { icon: Target },
  habit: { icon: Flame },
  overload: { icon: AlertTriangle },
  missed: { icon: ClipboardList },
  break: { icon: Coffee },
  prediction: { icon: Wand },
  reinforcement: { icon: PartyPopper },
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [smartNotif, setSmartNotif] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
    loadSmartNotif();
  }, []);

  const loadDashboard = async () => {
    try {
      const { data: res } = await api.get("/analytics/dashboard");
      setData(res);
    } catch (err) {
      console.error("Failed to load dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  const loadSmartNotif = async () => {
    try {
      const { data } = await api.get("/notifications/smart");
      const unread = data.notifications?.filter((n) => !n.read);
      if (unread?.length > 0) {
        setSmartNotif(unread[0]);
      }
    } catch {
      // silent
    }
  };

  const dismissNotif = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setSmartNotif(null);
    } catch {
      // silent
    }
  };

  if (loading) {
    return (
      <div className="space-y-5 page-enter">
        <div>
          <div className="skeleton h-7 w-32 mb-2" />
          <div className="skeleton h-4 w-48" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="skeleton h-64 rounded-2xl" />
          <div className="skeleton h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  const weeklyChartData = data?.weeklyAnalytics?.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", { weekday: "short" }),
    score: d.productivityScore,
    completed: d.completedTasks,
  })) || [];

  const smartMeta = smartNotif ? (subtypeMeta[smartNotif.subtype] || { icon: Lightbulb }) : null;
  const SmartIcon = smartMeta?.icon || Lightbulb;

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div>
        <h1 className="page-heading">Dashboard</h1>
        <p className="page-subheading">Here's your productivity overview</p>
      </div>

      {/* Smart Notification */}
      {smartNotif && (
        <div
          className="card p-5 flex items-start gap-4 cursor-pointer"
          onClick={() => { dismissNotif(smartNotif._id); if (smartNotif.actionUrl) navigate(smartNotif.actionUrl); }}
        >
          <span className="text-2xl mt-1"><SmartIcon size={24} /></span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm">{smartNotif.title}</h3>
              <span className="w-2 h-2 rounded-full bg-accent" />
            </div>
            <p className="text-sm text-text-secondary">{smartNotif.message}</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); dismissNotif(smartNotif._id); }}
            className="text-lg shrink-0 opacity-60 hover:opacity-100 transition-opacity text-text-muted"
            aria-label="Dismiss notification"
          >
            &times;
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { title: "Today's Tasks", value: data?.todayTasks || 0, icon: ClipboardList, bgClass: "bg-accent/15" },
          { title: "Productivity Score", value: `${data?.productivityScore || 0}%`, icon: Star, bgClass: "bg-success/15" },
          { title: "High Risk Tasks", value: data?.highRiskTasks?.length || 0, icon: AlertTriangle, bgClass: "bg-danger/15" },
          { title: "Upcoming", value: data?.upcomingDeadlines?.length || 0, icon: Calendar, bgClass: "bg-accent/15" },
        ].map((stat) => {
          const StatIcon = stat.icon;
          return (
          <div key={stat.title} className="card p-5">
            <div className="flex items-start gap-3">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0 ${stat.bgClass}`}
              >
                <StatIcon size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-text-muted">{stat.title}</p>
                <p className="stat-value mt-0.5">{stat.value}</p>
              </div>
            </div>
          </div>
        );
        })}
      </div>

      {/* Charts + Events */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Weekly Progress */}
        <div className="card p-6">
          <h2 className="font-semibold text-sm mb-4">Weekly Progress</h2>
          {weeklyChartData.length > 0 ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyChartData}>
                  <XAxis dataKey="date" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip contentStyle={{ background: "#1E293B", border: "1px solid #334155", borderRadius: "8px", color: "#F8FAFC" }} />
                  <Line type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--accent)" }} />
                  <Line type="monotone" dataKey="completed" stroke="#22C55E" strokeWidth={2.5} dot={{ r: 3, fill: "#22C55E" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-sm text-text-muted">
              No data yet this week
            </div>
          )}
        </div>

        {/* Today's Events */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">Today's Events</h2>
            <Link to="/notifications" className="text-xs font-medium text-accent">
              All Alerts →
            </Link>
          </div>
          <div className="space-y-2">
            {data?.todayEvents?.length > 0 ? (
              data.todayEvents.map((event) => (
                <div key={event._id} className="card p-4 flex items-center justify-between">
                  <span className="font-medium text-sm">{event.title}</span>
                  <span className="text-xs text-text-muted">
                    {new Date(event.start).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))
            ) : (
              <div className="card p-6 text-center">
                <p className="text-sm text-text-muted">No events scheduled today</p>
              </div>
            )}
          </div>
          <div className="mt-3">
            <Link
              to="/notifications"
              className="btn btn-ghost text-xs w-full justify-center"
            >
              View Smart Notifications →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
