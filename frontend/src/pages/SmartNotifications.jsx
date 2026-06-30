import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";

const subtypeMeta = {
  start_now: { emoji: "⏰", label: "Start Now", color: "bg-blue-50 border-blue-200" },
  best_time: { emoji: "🌟", label: "Best Time", color: "bg-yellow-50 border-yellow-200" },
  rescue: { emoji: "🚨", label: "Rescue", color: "bg-red-50 border-red-200" },
  focus: { emoji: "🎯", label: "Focus", color: "bg-green-50 border-green-200" },
  habit: { emoji: "🔥", label: "Streak", color: "bg-orange-50 border-orange-200" },
  overload: { emoji: "⚠️", label: "Overload", color: "bg-red-50 border-red-200" },
  missed: { emoji: "📋", label: "Missed", color: "bg-purple-50 border-purple-200" },
  break: { emoji: "☕", label: "Break", color: "bg-teal-50 border-teal-200" },
  prediction: { emoji: "🔮", label: "Prediction", color: "bg-indigo-50 border-indigo-200" },
  reinforcement: { emoji: "🎉", label: "Great Work", color: "bg-green-50 border-green-200" },
};

export default function SmartNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { loadNotifications(); }, []);

  const loadNotifications = async () => {
    try {
      const { data } = await api.get("/notifications/smart");
      setNotifications(data.notifications || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const generateNow = async () => {
    setGenerating(true);
    try {
      await api.post("/notifications/generate-smart");
      toast.success("AI analyzed your tasks!");
      loadNotifications();
    } catch {
      toast.error("Failed to generate insights");
    } finally {
      setGenerating(false);
    }
  };

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch {
      // silent
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("All marked as read");
    } catch {
      // silent
    }
  };

  const handleAction = (n) => {
    markRead(n._id);
    if (n.actionUrl) navigate(n.actionUrl);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Smart AI Notifications</h1>
          <p className="text-sm text-gray-500">Context-aware reminders that help you act</p>
        </div>
        <div className="flex gap-2">
          <button onClick={markAllRead} className="btn-ghost text-xs">Mark All Read</button>
          <button onClick={generateNow} disabled={generating} className="btn-primary text-sm">
            {generating ? "Analyzing..." : "Generate Now"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-3xl mb-2">🤖</p>
          <p className="font-semibold text-sm">No smart notifications yet</p>
          <p className="text-xs text-gray-400 mt-1 mb-4">
            Click "Generate Now" to get AI-powered personalized reminders
          </p>
          <button onClick={generateNow} disabled={generating} className="btn-primary text-sm">
            {generating ? "Analyzing..." : "Generate Smart Notifications"}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const meta = subtypeMeta[n.subtype] || { emoji: "💡", label: n.subtype, color: "bg-gray-50 border-gray-200" };
            return (
              <div
                key={n._id}
                className={`card border transition-all ${n.read ? "opacity-60" : ""} ${meta.color} cursor-pointer hover:shadow-sm`}
                onClick={() => handleAction(n)}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">{meta.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-semibold">{n.title}</h3>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/70 text-gray-500 border">
                        {meta.label}
                      </span>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                    </div>
                    <p className="text-xs text-gray-600">{n.message}</p>
                    {n.actionUrl && (
                      <p className="text-[11px] text-primary font-medium mt-1">
                        {n.actionUrl === "/focus" ? "Start Focus Session →" :
                         n.actionUrl === "/rescue" ? "Activate Rescue Mode →" :
                         n.actionUrl === "/tasks" ? "View Tasks →" :
                         n.actionUrl === "/study-planner" ? "Open Study Planner →" :
                         n.actionUrl === "/insights" ? "View Insights →" :
                         "Take Action →"}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); markRead(n._id); }}
                    className="text-gray-300 hover:text-gray-500 text-lg shrink-0"
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
