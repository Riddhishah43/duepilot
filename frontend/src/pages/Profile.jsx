import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.name || "", timezone: user?.timezone || "UTC" });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await api.put("/auth/profile", form); toast.success("Profile updated"); }
    catch { toast.error("Failed to update profile"); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div>
        <h1 className="text-lg font-semibold">Profile</h1>
        <p className="text-sm text-gray-500">Manage your account</p>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded bg-primary/15 flex items-center justify-center text-primary text-lg font-bold">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div>
            <h2 className="font-semibold text-sm">{user?.name}</h2>
            <p className="text-xs text-gray-400">{user?.email}</p>
            <p className="text-[11px] text-gray-400">Joined {new Date(user?.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-0.5">Name</label>
            <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-0.5">Timezone</label>
            <select className="input-field" value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })}>
              {["UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "Europe/London", "Europe/Paris", "Europe/Berlin", "Asia/Tokyo", "Asia/Shanghai", "Asia/Kolkata", "Australia/Sydney"].map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? "Saving..." : "Save Changes"}</button>
        </form>
      </div>

      <div className="card">
        <h2 className="font-semibold text-sm mb-3">Account Info</h2>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between"><span className="text-gray-400">Email</span><span>{user?.email}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Productivity Score</span><span>{user?.productivityScore || 0}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Timezone</span><span>{user?.timezone || "UTC"}</span></div>
        </div>
      </div>
    </div>
  );
}
