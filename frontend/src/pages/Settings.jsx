import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function Settings() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState({
    pomodoroDuration: user?.focusPreferences?.pomodoroDuration || 25,
    breakDuration: user?.focusPreferences?.breakDuration || 5,
    longBreakDuration: user?.focusPreferences?.longBreakDuration || 15,
    sessionsBeforeLongBreak: user?.focusPreferences?.sessionsBeforeLongBreak || 4,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await api.put("/auth/profile", { focusPreferences: prefs }); toast.success("Settings saved"); }
    catch { toast.error("Failed to save settings"); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div>
        <h1 className="text-lg font-semibold">Settings</h1>
        <p className="text-sm text-gray-500">Customize your experience</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-3">
        <h2 className="font-semibold text-sm">Focus Mode Preferences</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-0.5">Focus Duration (min)</label>
            <input type="number" className="input-field" min="1" max="120" value={prefs.pomodoroDuration} onChange={(e) => setPrefs({ ...prefs, pomodoroDuration: parseInt(e.target.value) })} />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-0.5">Break Duration (min)</label>
            <input type="number" className="input-field" min="1" max="30" value={prefs.breakDuration} onChange={(e) => setPrefs({ ...prefs, breakDuration: parseInt(e.target.value) })} />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-0.5">Long Break (min)</label>
            <input type="number" className="input-field" min="1" max="60" value={prefs.longBreakDuration} onChange={(e) => setPrefs({ ...prefs, longBreakDuration: parseInt(e.target.value) })} />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-0.5">Sessions before long break</label>
            <input type="number" className="input-field" min="1" max="10" value={prefs.sessionsBeforeLongBreak} onChange={(e) => setPrefs({ ...prefs, sessionsBeforeLongBreak: parseInt(e.target.value) })} />
          </div>
        </div>
        <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? "Saving..." : "Save Preferences"}</button>
      </form>
    </div>
  );
}
