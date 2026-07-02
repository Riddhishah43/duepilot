import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const AVATAR_COLORS = [
  "bg-blue-500", "bg-success", "bg-accent", "bg-orange-500",
  "bg-danger", "bg-teal-500", "bg-indigo-500", "bg-red-500",
];

export default function Profile() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [form, setForm] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    timezone: user?.timezone || "UTC",
    avatar: user?.avatar || "",
    dailyGoal: user?.dailyGoal || 3,
    weeklyGoal: user?.weeklyGoal || 10,
  });
  const [avatarColor, setAvatarColor] = useState(() => {
    const saved = localStorage.getItem("avatarColor");
    return saved || AVATAR_COLORS[0];
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/analytics").then(({ data }) => setStats(data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put("/auth/profile", form);
      localStorage.setItem("avatarColor", avatarColor);
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const pickColor = (color) => {
    setAvatarColor(color);
    localStorage.setItem("avatarColor", color);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="page-heading">Profile</h1>
        <p className="page-subheading">Manage your account and preferences</p>
      </div>

      <div className="card">
        <div className="flex items-center gap-4 mb-5">
          <div className={`w-14 h-14 rounded-full ${avatarColor} flex items-center justify-center text-white text-xl font-bold shrink-0`}>
            {user?.name?.charAt(0) || "U"}
          </div>
          <div>
            <h2 className="font-semibold text-base">{user?.name}</h2>
            <p className="text-xs text-text-muted">{user?.email}</p>
            <p className="text-[11px] text-text-muted mt-0.5">Joined {new Date(user?.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
          </div>
        </div>

        <div className="mb-5">
          <p className="text-xs text-text-muted mb-1.5">Avatar Color</p>
          <div className="flex gap-1.5">
            {AVATAR_COLORS.map((color) => (
              <button key={color} onClick={() => pickColor(color)} className={`w-6 h-6 rounded-full ${color} ${avatarColor === color ? "ring-2 ring-offset-1 ring-accent ring-offset-bg-tertiary" : ""}`} />
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-text-muted mb-0.5">Name</label>
              <input className="input text-sm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-0.5">Timezone</label>
              <select className="input text-sm" value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })}>
                {["UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "Europe/London", "Europe/Paris", "Europe/Berlin", "Asia/Tokyo", "Asia/Shanghai", "Asia/Kolkata", "Australia/Sydney"].map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-text-muted mb-0.5">Bio</label>
            <textarea className="input text-sm" rows={2} maxLength={200} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="A short bio about yourself..." />
            <p className="text-[10px] text-text-muted text-right">{form.bio.length}/200</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-text-muted mb-0.5">Daily Goal (tasks/day)</label>
              <input type="number" className="input text-sm" min={1} max={20} value={form.dailyGoal} onChange={(e) => setForm({ ...form, dailyGoal: parseInt(e.target.value) })} />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-0.5">Weekly Goal (tasks/week)</label>
              <input type="number" className="input text-sm" min={1} max={100} value={form.weeklyGoal} onChange={(e) => setForm({ ...form, weeklyGoal: parseInt(e.target.value) })} />
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn btn-primary text-sm">{saving ? "Saving..." : "Save Changes"}</button>
        </form>
      </div>

      {stats && (
        <div className="card">
          <h2 className="font-semibold text-sm mb-3">Productivity Snapshot</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-2 rounded bg-accent-light">
              <p className="text-lg font-bold text-accent">{stats.totalTasks || 0}</p>
              <p className="text-[10px] text-text-muted">Total Tasks</p>
            </div>
            <div className="p-2 rounded bg-success-light">
              <p className="text-lg font-bold text-success">{stats.completedTasks || 0}</p>
              <p className="text-[10px] text-text-muted">Completed</p>
            </div>
            <div className="p-2 rounded bg-warning-light">
              <p className="text-lg font-bold text-warning">{stats.streak || 0}d</p>
              <p className="text-[10px] text-text-muted">Best Streak</p>
            </div>
            <div className="p-2 rounded bg-accent-light">
              <p className={`text-lg font-bold ${(stats.completionRate || 0) >= 70 ? "text-success" : "text-danger"}`}>
                {stats.completionRate || 0}%
              </p>
              <p className="text-[10px] text-text-muted">Completion Rate</p>
            </div>
          </div>
          {stats.bestDay && (
            <div className="mt-2 text-xs text-text-muted text-center">
              Best day: <span className="font-medium">{stats.bestDay.day}</span> ({stats.bestDay.hours}h)
            </div>
          )}
        </div>
      )}

      <div className="card">
        <h2 className="font-semibold text-sm mb-3">Account</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center p-2 rounded bg-bg-secondary">
            <span className="text-text-muted">Email</span>
            <span className="font-medium">{user?.email}</span>
          </div>
          <div className="flex justify-between items-center p-2 rounded bg-bg-secondary">
            <span className="text-text-muted">Member Since</span>
            <span className="font-medium">{new Date(user?.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
