import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const notifLabels = {
  startNow: "Start Now — task due soon & you're free",
  bestTime: "Best Time — you're in your peak window",
  rescue: "Rescue — multiple deadlines approaching",
  focus: "Focus — no activity today",
  habit: "Streak — keep your momentum going",
  overload: "Overload — too many tasks scheduled",
  missed: "Missed — a task was skipped",
  break: "Break — working too long",
  prediction: "Prediction — AI predicts a missed deadline",
  reinforcement: "Reinforcement — positive encouragement",
};

export default function Settings() {
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [prefs, setPrefs] = useState({
    theme: "dark",
    preferredStudyTime: "morning",
    defaultView: "list",
    pomodoroDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4,
    notificationPreferences: {
      startNow: true, bestTime: true, rescue: true,
      focus: true, habit: true, overload: true,
      missed: true, break: false, prediction: true, reinforcement: true,
    },
  });

  useEffect(() => {
    api.get("/auth/profile").then(({ data }) => {
      const u = data.user;
      setPrefs({
        theme: u.theme || "dark",
        preferredStudyTime: u.preferredStudyTime || "morning",
        defaultView: u.defaultView || "list",
        pomodoroDuration: u.focusPreferences?.pomodoroDuration || 25,
        breakDuration: u.focusPreferences?.breakDuration || 5,
        longBreakDuration: u.focusPreferences?.longBreakDuration || 15,
        sessionsBeforeLongBreak: u.focusPreferences?.sessionsBeforeLongBreak || 4,
        notificationPreferences: {
          startNow: true, bestTime: true, rescue: true,
          focus: true, habit: true, overload: true,
          missed: true, break: false, prediction: true, reinforcement: true,
          ...(u.notificationPreferences || {}),
        },
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const toggleNotif = (key) => {
    setPrefs((p) => ({
      ...p,
      notificationPreferences: {
        ...p.notificationPreferences,
        [key]: !p.notificationPreferences[key],
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/auth/profile", {
        theme: prefs.theme,
        preferredStudyTime: prefs.preferredStudyTime,
        defaultView: prefs.defaultView,
        notificationPreferences: prefs.notificationPreferences,
        focusPreferences: {
          pomodoroDuration: prefs.pomodoroDuration,
          breakDuration: prefs.breakDuration,
          longBreakDuration: prefs.longBreakDuration,
          sessionsBeforeLongBreak: prefs.sessionsBeforeLongBreak,
        },
      });
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async () => {
    try {
      await api.delete("/auth/account");
      toast.success("Account deleted");
      logout();
      navigate("/");
    } catch {
      toast.error("Failed to delete account");
    }
  };

  const handleExport = async () => {
    try {
      const { data } = await api.get("/analytics");
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `duepilot-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Data exported");
    } catch {
      toast.error("Export failed");
    }
  };

  if (loading) {
    return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-lg font-semibold">Settings</h1>
        <p className="text-sm text-text-muted">Customize your experience</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card space-y-4">
          <h2 className="font-semibold text-sm">Appearance</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-text-muted mb-0.5">Theme</label>
              <select className="input-field text-sm" value={prefs.theme} onChange={(e) => { setPrefs({ ...prefs, theme: e.target.value }); setTheme(e.target.value); }}>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-0.5">Default Task View</label>
              <select className="input-field text-sm" value={prefs.defaultView} onChange={(e) => setPrefs({ ...prefs, defaultView: e.target.value })}>
                <option value="list">List</option>
                <option value="board">Board</option>
                <option value="calendar">Calendar</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="font-semibold text-sm">Study Preferences</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-text-muted mb-0.5">Preferred Study Time</label>
              <select className="input-field text-sm" value={prefs.preferredStudyTime} onChange={(e) => setPrefs({ ...prefs, preferredStudyTime: e.target.value })}>
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="night">Night</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="font-semibold text-sm">Focus Mode</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-text-muted mb-0.5">Focus Duration (min)</label>
              <input type="number" className="input-field text-sm" min={1} max={120} value={prefs.pomodoroDuration} onChange={(e) => setPrefs({ ...prefs, pomodoroDuration: parseInt(e.target.value) })} />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-0.5">Break Duration (min)</label>
              <input type="number" className="input-field text-sm" min={1} max={30} value={prefs.breakDuration} onChange={(e) => setPrefs({ ...prefs, breakDuration: parseInt(e.target.value) })} />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-0.5">Long Break (min)</label>
              <input type="number" className="input-field text-sm" min={1} max={60} value={prefs.longBreakDuration} onChange={(e) => setPrefs({ ...prefs, longBreakDuration: parseInt(e.target.value) })} />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-0.5">Sessions Before Long Break</label>
              <input type="number" className="input-field text-sm" min={1} max={10} value={prefs.sessionsBeforeLongBreak} onChange={(e) => setPrefs({ ...prefs, sessionsBeforeLongBreak: parseInt(e.target.value) })} />
            </div>
          </div>
        </div>

        <div className="card space-y-3">
          <h2 className="font-semibold text-sm">Smart Notification Preferences</h2>
          <p className="text-xs text-slate-400">Choose which AI notifications you want to receive</p>
          <div className="space-y-1.5">
            {Object.entries(notifLabels).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2.5 p-1.5 rounded hover:bg-bg-elevated cursor-pointer">
                <input type="checkbox" checked={prefs.notificationPreferences[key]} onChange={() => toggleNotif(key)} className="w-3.5 h-3.5 accent-primary" />
                <span className="text-xs">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? "Saving..." : "Save All Settings"}</button>
      </form>

      <div className="card space-y-3">
        <h2 className="font-semibold text-sm">Data</h2>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleExport} className="btn-ghost text-xs">Export Data (JSON)</button>
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-accent">Are you sure?</span>
              <button onClick={deleteAccount} className="text-xs bg-accent text-white px-2 py-1 rounded hover:bg-accent/90">Confirm</button>
              <button onClick={() => setConfirmDelete(false)} className="text-xs text-text-muted px-2 py-1">Cancel</button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="text-xs text-accent hover:text-accent/80 px-2 py-1 rounded hover:bg-accent/10">Delete Account</button>
          )}
        </div>
      </div>
    </div>
  );
}
