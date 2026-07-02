import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { AlarmClock, Sparkles, BellRing, Target, Flame, AlertTriangle, ClipboardList, Coffee, PartyPopper, Bot, Lightbulb } from "lucide-react";

const subtypeMeta = {
  start_now: { icon: AlarmClock, label: "Start Now", color: "bg-accent-light border-accent" },
  best_time: { icon: Sparkles, label: "Best Time", color: "bg-warning-light border-warning" },
  rescue: { icon: BellRing, label: "Rescue", color: "bg-danger-light border-danger" },
  focus: { icon: Target, label: "Focus", color: "bg-success-light border-success" },
  habit: { icon: Flame, label: "Streak", color: "bg-warning-light border-warning" },
  overload: { icon: AlertTriangle, label: "Overload", color: "bg-danger-light border-danger" },
  missed: { icon: ClipboardList, label: "Missed", color: "bg-accent-light border-accent" },
  break: { icon: Coffee, label: "Break", color: "bg-success-light border-success" },
  prediction: { icon: Sparkles, label: "Prediction", color: "bg-accent-light border-accent" },
  reinforcement: { icon: PartyPopper, label: "Great Work", color: "bg-success-light border-success" },
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
      const { data } = await api.post("/notifications/generate-smart");
      const count = (data.notifications || []).length;
      if (count > 0) {
        toast.success(`Generated ${count} smart notification${count !== 1 ? "s" : ""}`);
      }
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
          <h1 className="page-heading">Smart AI Notifications</h1>
          <p className="page-subheading">Context-aware reminders that help you act</p>
        </div>
        <div className="flex gap-2">
          <button onClick={markAllRead} className="btn btn-ghost text-xs">Mark All Read</button>
          <button onClick={generateNow} disabled={generating} className="btn btn-primary text-sm">
            {generating ? "Analyzing..." : "Generate Now"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-3xl mb-2"><Bot size={36} /></p>
          <p className="font-semibold text-sm">No smart notifications yet</p>
          <p className="text-xs text-text-muted mt-1 mb-4">
            Click "Generate Now" to get AI-powered personalized reminders
          </p>
          <button onClick={generateNow} disabled={generating} className="btn btn-primary text-sm">
            {generating ? "Analyzing..." : "Generate Smart Notifications"}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const meta = subtypeMeta[n.subtype] || { icon: Lightbulb, label: n.subtype, color: "bg-bg-secondary border-border" };
            return (
              <div
                key={n._id}
                className={`card border transition-all ${n.read ? "opacity-60" : ""} ${meta.color} cursor-pointer hover:shadow-sm`}
                onClick={() => handleAction(n)}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5"><meta.icon size={24} /></span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-semibold">{n.title}</h3>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-secondary text-text-muted border border-border">
                        {meta.label}
                      </span>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-accent shrink-0" />}
                    </div>
                    <p className="text-xs text-text-muted">{n.message}</p>
                    {n.actionUrl && (
                      <p className="text-[11px] text-accent font-medium mt-1">
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
                    className="text-text-secondary hover:text-text-primary text-lg shrink-0"
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
