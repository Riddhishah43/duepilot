import { useState, useEffect } from "react";
import { Target } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", deadline: "", category: "personal" });

  useEffect(() => { loadGoals(); }, []);

  const loadGoals = async () => {
    try { const { data } = await api.get("/goals"); setGoals(data.goals); }
    catch { toast.error("Failed to load goals"); }
    finally { setLoading(false); }
  };

  const createGoal = async (e) => {
    e.preventDefault();
    try {
      await api.post("/goals", form);
      toast.success("Goal created!");
      setShowCreate(false);
      setForm({ title: "", description: "", deadline: "", category: "personal" });
      loadGoals();
    } catch { toast.error("Failed to create goal"); }
  };

  const toggleMilestone = async (goalId, milestoneId) => {
    try { await api.patch(`/goals/${goalId}/milestones/${milestoneId}`); loadGoals(); }
    catch { toast.error("Failed to update milestone"); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-heading">Goals</h1>
          <p className="page-subheading">Long-term goals with milestones</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn btn-primary text-sm">+ New Goal</button>
      </div>

      {showCreate && (
        <form onSubmit={createGoal} className="card space-y-3">
          <h2 className="font-semibold text-sm">New Goal</h2>
          <input className="input" placeholder="Goal title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <textarea className="input" placeholder="Description" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-text-muted mb-0.5">Deadline</label>
              <input type="date" className="input" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} required />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-0.5">Category</label>
              <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="personal">Personal</option>
                <option value="career">Career</option>
                <option value="education">Education</option>
                <option value="health">Health</option>
                <option value="finance">Finance</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary text-sm">Create Goal</button>
            <button type="button" onClick={() => setShowCreate(false)} className="btn btn-ghost text-sm">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin"></div></div>
      ) : goals.length === 0 ? (
        <div className="text-center py-10 text-text-muted"><p className="text-3xl mb-2"><Target size={36} /></p><p className="text-sm">No goals yet</p></div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {goals.map((goal) => (
            <div key={goal._id} className="card">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-sm">{goal.title}</h3>
                  <p className="text-xs text-text-muted">{goal.category} • Due {new Date(goal.deadline).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-xs mb-0.5"><span>Progress</span><span className="font-medium">{goal.progress}%</span></div>
                <div className="w-full h-1.5 bg-bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: `${goal.progress}%` }} />
                </div>
              </div>
              {goal.milestones?.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[11px] font-medium text-text-muted uppercase">Milestones</p>
                  {goal.milestones.map((m) => (
                    <label key={m._id} className="flex items-center gap-1.5 text-sm cursor-pointer">
                      <input type="checkbox" checked={m.completed} onChange={() => toggleMilestone(goal._id, m._id)}
                        className="rounded border-border text-accent focus:ring-accent bg-bg-tertiary" />
                      <span className={`text-xs ${m.completed ? "line-through text-text-muted" : ""}`}>{m.title}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
