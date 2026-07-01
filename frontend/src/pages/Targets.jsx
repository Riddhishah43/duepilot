import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

export default function Targets() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => { loadTasks(); }, []);

  const loadTasks = async () => {
    try {
      const { data } = await api.get("/tasks", { params: { status: "pending,in-progress" } });
      setTasks(data.tasks || []);
    } catch { toast.error("Failed to load tasks"); }
    finally { setLoading(false); }
  };

  const setTarget = async (taskId) => {
    try {
      await api.put(`/tasks/${taskId}`, { targetDeadline: editValue || null });
      toast.success("Target set!");
      setEditingId(null);
      setEditValue("");
      loadTasks();
    } catch { toast.error("Failed to set target"); }
  };

  const clearTarget = async (taskId) => {
    try {
      await api.put(`/tasks/${taskId}`, { targetDeadline: null });
      toast.success("Target removed");
      loadTasks();
    } catch { toast.error("Failed to clear target"); }
  };

  const toDateStr = (d) => {
    const date = new Date(d);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const isAtRisk = (task) => {
    if (!task.targetDeadline) return false;
    const now = new Date();
    const target = new Date(task.targetDeadline);
    const diff = (target - now) / (1000 * 60 * 60);
    return diff < 24;
  };

  const isMissed = (task) => {
    if (!task.targetDeadline) return false;
    return new Date(task.targetDeadline) < new Date();
  };

  const tasksWithTargets = tasks.filter((t) => t.targetDeadline);
  const tasksWithoutTargets = tasks.filter((t) => !t.targetDeadline);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold">Targets</h1>
        <p className="text-sm text-text-muted">Set personal deadlines before the actual due date</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center">
          <p className="text-2xl font-bold text-primary">{tasksWithTargets.length}</p>
          <p className="text-xs text-text-muted">Targets Set</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-warning">{tasks.filter((t) => isAtRisk(t) && !isMissed(t)).length}</p>
          <p className="text-xs text-text-muted">At Risk</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-accent">{tasks.filter((t) => isMissed(t)).length}</p>
          <p className="text-xs text-text-muted">Missed</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div></div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-10 text-slate-400"><p className="text-3xl mb-2">🎯</p><p className="text-sm">No active tasks to set targets on</p></div>
      ) : (
        <div className="space-y-3">
          {tasksWithTargets.length > 0 && (
            <div>
              <h2 className="font-semibold text-sm mb-2">Tasks with Targets</h2>
              <div className="space-y-1.5">
                {tasksWithTargets.map((task) => (
                  <div key={task._id} className={`card flex items-center justify-between ${isMissed(task) ? "border-accent/30 bg-accent/5" : isAtRisk(task) ? "border-warning/30 bg-warning/5" : ""}`}>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{task.title}</p>
                      <p className="text-xs text-slate-400">Due: {new Date(task.deadline).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3 ml-3 shrink-0">
                      {editingId === task._id ? (
                        <div className="flex items-center gap-1.5">
                          <input type="date" className="input-field text-xs py-1 px-2 w-36" value={editValue} onChange={(e) => setEditValue(e.target.value)} />
                          <button onClick={() => setTarget(task._id)} className="btn-primary text-xs py-1 px-2">Save</button>
                          <button onClick={() => { setEditingId(null); setEditValue(""); }} className="btn-ghost text-xs py-1 px-2">Cancel</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium ${isMissed(task) ? "text-accent" : isAtRisk(task) ? "text-warning" : "text-primary"}`}>
                            {isMissed(task) ? "Missed" : isAtRisk(task) ? "At Risk" : `Target: ${new Date(task.targetDeadline).toLocaleDateString()}`}
                          </span>
                          <button onClick={() => { setEditingId(task._id); setEditValue(toDateStr(task.targetDeadline)); }} className="btn-ghost text-xs py-1 px-2">Edit</button>
                          <button onClick={() => clearTarget(task._id)} className="text-xs text-accent hover:text-accent/80 py-1 px-1">✕</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tasksWithoutTargets.length > 0 && (
            <div>
              <h2 className="font-semibold text-sm mb-2">Tasks without Targets</h2>
              <div className="space-y-1.5">
                {tasksWithoutTargets.map((task) => (
                  <div key={task._id} className="card flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{task.title}</p>
                      <p className="text-xs text-slate-400">Due: {new Date(task.deadline).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-1.5 ml-3 shrink-0">
                      {editingId === task._id ? (
                        <div className="flex items-center gap-1.5">
                          <input type="date" className="input-field text-xs py-1 px-2 w-36" value={editValue} onChange={(e) => setEditValue(e.target.value)} />
                          <button onClick={() => setTarget(task._id)} className="btn-primary text-xs py-1 px-2">Set</button>
                          <button onClick={() => { setEditingId(null); setEditValue(""); }} className="btn-ghost text-xs py-1 px-2">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setEditingId(task._id)} className="btn-ghost text-xs py-1 px-2">Set Target</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
